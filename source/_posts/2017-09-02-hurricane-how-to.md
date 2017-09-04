---
template: post.html
title: "Hurricane Map How-To"
permalink: /hurricane
shareimg: http://roadtolarissa.com/images/posts/tktk
---

<link rel="stylesheet" type="text/css" href="/hurricane/style.css">

<script src="/hurricane/d3+_.js"></script>
<script src="/hurricane/script.js"></script>


When projections showed Hurricane Harey could bring a record setting amount of rain to Houston, the graphics desk at the New York Times started exporing ways of showing the rainfall. After a couple of days of scrambling, we managed to make a [map](https://www.nytimes.com/interactive/2017/08/24/us/hurricane-harvey-texas.html) showing both the accumulation and rate of rainfall:

<img src="https://i.imgur.com/hCXJovg.gif" style="margin: 0px auto; display: block;">

Getting this done on deadline required mashing together a couple of different web technologies, like svg and canvas, with a grab bag of open source libraries. This post describes some of tricks and techniques we used to bring everything together. 

## Finding the data

First we needed a data source. Preferably a frequently updating one, with gridded values so we could make a map with more detail than just a few station numbers overlaid.

The [Global Precipitation Measurement Constellation](https://pmm.nasa.gov/data-access/downloads/gpm) seemed initially seemed like a good candidate - it promised a grid of rainfall rates around the world 30 minute slices. After spending most of the day wrangling netCDF files and R though, I had only managed to make map showing the path GPM satellites had traced over the earth during one of the 30 minute update windows: 

<img src="https://i.imgur.com/cFAL1iC.png" style="margin: 0px auto; display: block; max-width: 573px;">

[Interesting](https://www.youtube.com/watch?v=tHXHUc52SAw), but no where near to anything publishable. This was particularly frustrating because the previous afternoon I had watched Josh put together a [historical rainfall map](https://www.nytimes.com/interactive/2017/08/29/upshot/harvey-rainfall-where-you-live.html) using similar data and tools, but I wasn't familiar enough with the domain to duplicate his efforts quickly and started to worry that I had wasted time that should have gone towards making a map that just showed station numbers. 

Thankfully two of my other collagues, Jugal and Anjali, found a [National Weather Service FTP](http://www.srh.noaa.gov/data/ridge2/Precip/qpehourlyshape/2017/201708/20170828/) and showed me how to convert the files to simple CSVs. Opening them in QGIS showed they had exactly the data we wanted - a grid of hourly rainfall values. 

<img src="https://i.imgur.com/Vgh8uZS.png" style="margin: 0px auto; display: block; max-width: 573px;">


A bit of bash downloaded files from the ftp, extracted them and converted them a CSV with day and hour in the file name (the 26th and 7 AM here). 

```
URL="http://www.srh.noaa.gov/data/ridge2/Precip/qpehourlyshape/2017/201708/20170826/nws_precip_2017082607.tar.gz"
curl -s $URL | tar xz --strip=3
ogr2ogr -f CSV 2607.csv nws_precip_2017082607.shp
```

Each row of the CSV has the observed rainfall in inches (Globvalue) at each point in the grid (Hrapx/Hrapy are the x and y grid indices)
```
Id,Hrapx,Hrapy,Lat,Lon,Globvalue
169209,591,117,28.1442,-97.6825,0.02
169210,592,117,28.1399,-97.6446,0.03
169213,595,117,28.1268,-97.5306,0.02
170771,577,118,28.2358,-98.2106,0.02
170783,589,118,28.1862,-97.7537,0.02
170784,590,118,28.1820,-97.7157,0.02
170785,591,118,28.1777,-97.6777,0.03
...
```

## Putting it on a canvas

The next step was to see how much rain was falling where. This could have been done in QGIS, but since the end result was going on the web, I started up a webpage with [d3]() and [jetpack]().

First, load the data and set up the [canvas preliminaries](http://diveintohtml5.info/canvas.html). Using svg to draw the data wouldn't be a good idea; with over 20,000 points to draw and canvas is much faster. 

```javascript
d3.loadData('2607.csv', (err, [data]) => {
  var width = 700
  var height = width/2

  var ctx = d3.select('#graphic')
    .html('')
    .append('canvas')
    .at({width, height})
    .node()
    .getContext('2d')
```

Next, loop over grid points and draw a 1px rectangle over each, scaling the opacity based on the rainfall: 

```js
  var color = d3.scaleLinear().range(['rgba(255,0,0,0)', 'rgba(255,0,0,1)'])
  data.forEach(d =>{
    ctx.beginPath()
    ctx.fillStyle = color(d.Globvalue)
    ctx.rect(d.Hrapx, d.Hrapy, 1, 1)
    ctx.fill()
  })
```

It looks like something!

<div id='graphic-0' class='graphic'></div>

But where is it? And why is the upper left corner cut off?

## Make it a map 

While plotting with the grid indices is quick, it's not totally clear what we're looking at. Because we wanted to overlay the coast and city labels, we had to position the rainfall values based on their lat/lon instead.

Sarah made me a detailed shapefile of Texas and Louisiana, running it through [mapshaper](http://mapshaper.org/) to shrink the file. I loaded and set up a [Texas South State Plane projection](https://github.com/veltman/d3-stateplane#nad83--texas-south-epsg32141) zoomed in the gulf. 

```javascript
var projection = d3.geoConicConformal()
  .parallels([26 + 10 / 60, 27 + 50 / 60])
  .rotate([98 + 30 / 60, -25 - 40 / 60])
  .fitSize([width, height], { 
    "type": "LineString", "coordinates": [[-99.2, 27.5], [-91.1, 30.5]]
  })
})
```

[fitSize](https://github.com/d3/d3-geo#projection_fitExtent) make adjusting projection crops way simpler than fiddling with translate and scale values. 

Since text and detailed features can be blurry on canvas if they aren't rendered at [double resolutionn](https://www.html5rocks.com/en/tutorials/canvas/hidpi/), I decided to make the map overlay with svg. [topojson]() merges the loaded state shapes into one shape which gets drawn to the screen as a path

```javascript
var svg = d3.select('#graphic')
  .append('svg')
  .at({width: width, height: height})

var path = d3.geoPath().projection(projection)
var pathStr = path(topojson.mesh(states, states.objects.states))
svg.append('path')
  .at({d: pathStr, fill: 'none', stroke: '#000', strokeWidth: .5})
```

A bit of css positions the svg directly over the canvas. 

```css
#graphic{
  position: relative;
}

#graphic canvas, #graphic svg{
  position: absolute;
  top: 0px;
  left: 0px;
}
``` 

Finally, the observed rainfall values are drawn at their projected lat/lon. Since the map is zoomed in, I'm bumped the sides of the rectangles from 1 pixel to 3. 

```javascript
data.forEach(d =>{
  ctx.beginPath()
  // ctx.rect(d.Hrapx, d.Hrapy, 1, 1)
  var [x, y] = projection([d.Lon, d.Lat])
  ctx.rect(x, y, 3, 3)
```

<div id='graphic-1' class='graphic'></div>

Now it's clear why the corner was cut off previously - there's only data for locations within a few miles of land. This misleading makes it look a little like it isn't raining over most of the ocean. To fix this, we decide to only show rainfall over land. 

There are a couple of ways this could have been done. Only drawing the observations on land would work, but the coastline would be blocky because the grid is zoomed in. Instead I decided to cover up the values in the ocean by drawing a white ocean and overlaying it. 

Drawing the ocean with only a shapefile of the land is a little tricky. I ended drawing the land to a mask element and using a mask to clip a white rectangle covering up the whole graphic.

```javascript
var pathStr = path(topojson.feature(states, states.objects.states))
var mask = svg.append('mask#ocean')
mask.append('rect').at({width, height, fill: '#fff'})
mask.append('path').at({d: pathStr, fill: '#000'})
svg.append('rect').at({width, height, fill: '#fff', mask: 'url(#ocean)'})
```

Masks make [lots](https://bl.ocks.org/1wheel/76a07ca0d23f616d29349f7dd7857ca5) of [things](https://bl.ocks.org/1wheel/a8f39c8a96b71735488bf280d34bd765) possible. There might be a simpler of doing this, but it works!

<div id='graphic-2' class='graphic'></div>

The city labels are group elements translated to each city's location with a circle and text inside.  

```javascript
var cities = [
  {name: 'Houston',     cord: [-95.369, 29.760]},
  {name: 'Austin',      cord: [-97.743, 30.267]},
  {name: 'San Antonio', cord: [-98.493, 29.424]}
]
var citySel = svg.appendMany(cities, 'g')
  .translate(d => projection(d.cord))
citySel.append('circle').at({r: 1})
citySel.append('text').text(d => d.name).at({textAnchor: 'middle', dy: -5})
```

## Animation

Showing the progression of the storm required getting more hours of data into the browser. 

Loading a separate CSV for each hour of data wouldn't be very efficient, so I wrote a script to load all the CSVs, add a column with the observation time and merged them into one big array. 

```javascript
var {_, d3, jp, glob, io} = require('scrape-stl')

var data = []
glob.sync(__dirname + '/csv/*.csv').forEach(path => {
  var time = _.last(path.split('/')).split('.csv')[0]
  io.readDataSync(path).forEach(d => {
    d.time = time
    data.push(d)
  })
})
```

Combining two days of rainfall data made a 30 MB CSV - too big. Each observation from the same location repeated the station Id, lat, log, Hrapx and Hrapy properties. Putting all the observations from one station into a single object removes the redundancy and makes the file size manageable. 

```javascript
var points = jp.nestBy(data, d => d.Id).map(point => {
  var vals = {}
  point.forEach(d => vals[d.time] = +d.Globvalue)

  return {vals, lat: +point[0].Lat, +lon: point[0].Lon}
})

io.writeDataSync(__dirname + '/points.json', times)
```

This creates an array of locations, each with a lat, lon and vals hash. The vals hash lists the inches rainfall the occurred during each hour.   

```json
{
  "lat": 26.6631,
  "lon": -97.4435,
  "vals": {
    "2600": 0.02
    "2601": 0.01
  },
},
{
  "lat": 27.6294,
  "lon": -98.2536,
  "vals": {
    "2601": 0.04,
    "2602": 0.01,
    "2607": 0.03,
    "2608": 0.11,
    "2618": 0.05,
    "2619": 0.12,
    "2620": 0.09,
    "2621": 0.01
  },
}, 
...
```

Canvas is a lower level abstraction than svg: it can easily draw 20,000 shapes, but there's no general purpose transition functional available. To animate the rainfall on the 26th of August, I made an array of the hourly timestamps on that day and and looped over it at 5 frames per second. 

```javascript 
  var times = d3.range(24).map(d => '26' + d3.format('02')(d))
  var curTimeIndex = 0
  d3.interval(() => {
    drawTime(times[curTimeIndex++ % times.length])
  }, 200)
```

At the start of each frame, everything on the canvas is removed with clearRect. Only points with with rainfall at the current time are drawn and because the data structure has changed, d.vals[time], d.Globvalue. 

```javascript
function drawTime(time){
  ctx.clearRect(0, 0, width, height)
  points.filter(d => d.vals[time]).forEach(d =>{
    ctx.beginPath()
    var [x, y] = projection([d.lon, d.lat])
    ctx.rect(x, y, 3, 3)
    ctx.fillStyle = color(d.vals[time])
    ctx.fill()
  })
}
```

Tom MacWright has good [tutorial on canvas animations](https://macwright.org/2015/08/14/canvas-animation-methods.html) with more techniques; d3.interval and clearRect are enough to do quite a lot though: 

<div id='graphic-3' class='graphic'></div>

## Accumulation 

3d overlay


<div id='graphic-4' class='graphic'></div>


## Less confusing total

<div id='graphic-5' class='graphic'></div>


## Making it better

It would have been nice to use netcdf and WebGL but that's hard to do
Being familiar with you tools make it possible to make things quickly. 



- https://www.nytimes.com/interactive/2017/08/24/us/hurricane-harvey-texas.html
- getting the data
- drawing rainfall
- animating the data
- showing total rainfall
- shrinking data/showing both
- cliping to land
- making a gif


The trickiest part of this piece was finding the right data source. We wanted frequently updating, hourly data to show where the rain was falling the hardest and how much had fallen overall. 

I started looking at the [Global Precipitation Measurement Constellation](https://pmm.nasa.gov/data-access/downloads/gpm) which has data on rainfall around the world in 30 minute slices released on 6 hour lag. After spending a few hours figuring out how to open up netCDF files, I realized the data wasn't updated as regularly as I hoped. Coloring the data points by observation time showed the paths of [satellites](http://imgur.com/lgjC75m) [moving](http://imgur.com/cFAL1iC) across the sky. Since not every point gets updated at the same time or on the same interval, calculating cumulative rainfall was trickier than just summing the hourly interval - too tricky to do on deadline. 

After spending most of a Saturday wandering down a dead end, I was ready to give up. Until Anjali found a [NOAA ftp server](http://www.srh.noaa.gov/data/ridge2/Precip/qpehourlyshape/2017/201708/20170828/) with exactly the data I was looking for! The format was a bit strange - a shapefile with a [grid of points](http://imgur.com/Vgh8uZS) showing calculated rainfall. I threw together a rough script to download download the last few days of observations, combine them into a csv and [plot the values](http://imgur.com/5jo48l0). 

Since both the cumulative and the hourly rainfall were interesting, I tried a bivariate color 
scale to trace the hurricane's path in red. You can see the [eye](http://imgur.com/yeJyHxs) of the hurricane as it lands! All the colors were a little too much to explain in a key though, so we switched to circles to show the current path of the hurricane. We also had to cut down on the spatial resolution to keep the file size under control - maybe a video would have been better, but I'm a big fan of tiny charts inside of tooltips.  



When projections showed Hurricane Harey could bring a record setting amount of rain to Houston, the graphics desk at the New York Times started exporing ways of showing the water. What does record setting rainfall look like in different parts of the country? Where and when did it rain the hardest? And how can we communicate how people experienced the rising water with just points on a map?

This talk will describe the process of answering one of those questions, from parsing NASA's microwave data with R to creating a live-updating interactive map with d3 and canvas that showed both the [accumulation and rate of rainfall]

