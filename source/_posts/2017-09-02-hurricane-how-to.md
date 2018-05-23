---
template: post.html
title: Hurricane How-To
date: 2017-09-02
permalink: /hurricane
shareimg: http://roadtolarissa.com/images/posts/hurricane-2.png
---

<link rel="stylesheet" type="text/css" href="/hurricane/style.css">

<script src="/hurricane/d3+_.js"></script>
<script src="/hurricane/script.js"></script>


When projections showed Hurricane Harvey could bring a record setting amount of rain to Houston, the graphics desk at the New York Times started exploring ways of showing the rainfall. After a couple of days of scrambling, we managed to make a [map](https://www.nytimes.com/interactive/2017/08/24/us/hurricane-harvey-texas.html) showing both the accumulation and rate of rainfall:

<img src="https://i.imgur.com/hCXJovg.gif" style="margin: 0px auto; display: block;">

Getting this done on deadline required mashing together a couple of different web technologies, like SVG and canvas, with a grab bag of open source libraries. This post describes some of the tricks and techniques we used to bring everything together. 

## Finding the data

First we needed a data source. Preferably a frequently updating one, with gridded values so we could make a map with more detailed information than just overlayed numbers with the total rainfall at few locations. 

The [Global Precipitation Measurement Constellation](https://pmm.nasa.gov/data-access/downloads/gpm) initially seemed like a good candidate—it promised a grid of rainfall rates around the world in 30 minute slices. But after spending most of the day wrangling netCDF files and R, I had only managed to make a map showing the path GPM satellites had traced over the earth during one of the 30 minute update windows: 

<img src="https://i.imgur.com/cFAL1iC.png" style="margin: 0px auto; display: block; max-width: 573px;">

[Interesting](https://www.youtube.com/watch?v=tHXHUc52SAw), but nowhere near to anything publishable. This was particularly frustrating because the previous afternoon I had watched Josh Katz put together a [historical rainfall map](https://www.nytimes.com/interactive/2017/08/29/upshot/harvey-rainfall-where-you-live.html) using similar data and tools, but I wasn't familiar enough with the domain to duplicate his efforts quickly. I started to worry that I had wasted time that would have been better spent making a map with a couple of numbers overlaid.

Thankfully two of my other collagues, Jugal Patel and Anjali Singhvi, found a [National Weather Service FTP](http://www.srh.noaa.gov/data/ridge2/Precip/qpehourlyshape/2017/201708/20170828/) and showed me how to convert the files to simple CSVs. Opening them in [QGIS](http://www.qgis.org/en/site/) showed they had exactly the data we wanted—a grid of hourly rainfall values (Update: NOAA has [replaced](http://www.nws.noaa.gov/os/notification/scn17-32ahps_pcpnaaa.htm) the shapefiles with netCDFs :/). 

<img src="https://i.imgur.com/Vgh8uZS.png" style="margin: 0px auto; display: block; max-width: 573px;">

A bit of bash downloaded files from the FTP, extracted them and converted them to a CSV with the day and hour in the file name (the 26th of August and 7 AM here). 

```bash
URL="http://www.srh.noaa.gov/data/ridge2/Precip/qpehourlyshape/2017/201708/20170826/nws_precip_2017082607.tar.gz"
curl -s $URL | tar xz --strip=3
ogr2ogr -f CSV 2607.csv nws_precip_2017082607.shp
```

Each row of the CSV has the observed rainfall in inches (`Globvalue`) at each point in the grid (`Hrapx`/`Hrapy` are the `x` and `y` grid indices)

```bash
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

The next step was to see how much rain was falling where. This could have been done in QGIS, but since the end result was going on the web, I started up a webpage with [d3](http://d3js.com/) and [d3-jetpack](https://github.com/gka/d3-jetpack).

First, I loaded the data and set up the [canvas preliminaries](http://diveintohtml5.info/canvas.html). Using SVG to draw the data wouldn't be a good idea with 20,000 points to draw—it's too slow. 

```javascript
var width = 700
var height = width/2

d3.loadData('2607.csv', (err, [data]) => {
  var ctx = d3.select('#graphic')
    .append('canvas')
    .at({width, height})
    .node()
    .getContext('2d')
```

Next, loop over grid points and draw a 1px rectangle over each, scaling the opacity based on the rainfall: 

```js
var color = d3.scaleLinear()
  .range(['rgba(255,0,255,0)', 'rgba(255,0,255,1)'])
data.forEach(d =>{
  ctx.beginPath()
  ctx.fillStyle = color(d.Globvalue)
  ctx.rect(d.Hrapx, d.Hrapy, 1, 1)
  ctx.fill()
})
```

It looks like something!

<div id='graphic-0' class='graphic'></div>

<div class='code'><a href='https://github.com/1wheel/roadtolarissa/blob/master/source/hurricane/script.js#L10-L28'>code</a></div>

But where is it? And why is the upper left corner cut off?

## Make it a map 

While plotting with the grid indices is quick, it's not totally clear what we're looking at. Because we wanted to overlay the coast and city labels, we had to position the rainfall values based on their lat/lon instead.

Sarah Almukhtar made me a detailed shapefile of Texas and Louisiana, running it through [mapshaper](http://mapshaper.org/) to shrink the file. I loaded it and set up a [Texas South State Plane projection](https://github.com/veltman/d3-stateplane#nad83--texas-south-epsg32141) zoomed in on the gulf. 

```javascript
d3.loadData('2607.csv', 'states.json', (err, [data, states]) => {
  var projection = d3.geoConicConformal()
    .parallels([26 + 10 / 60, 27 + 50 / 60])
    .rotate([98 + 30 / 60, -25 - 40 / 60])
    .fitSize([width, height], { 
      "type": "LineString", "coordinates": [[-99.2, 27.5], [-91.1, 30.5]]
    })
  })
```

[fitSize](https://github.com/d3/d3-geo#projection_fitExtent) makes adjusting projection crops way simpler than fiddling with translate and scale values. 

Since text and detailed features can be blurry on canvas if they aren't rendered at [double resolution](https://www.html5rocks.com/en/tutorials/canvas/hidpi/), I decided to make the map overlay with SVG. [topojson](https://github.com/topojson/topojson) merges the loaded state shapes into one shape which gets drawn to the screen as a path.

```javascript
var svg = d3.select('#graphic')
  .append('svg')
  .at({width, height})

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

Finally, the observed rainfall values are drawn at their projected lat/lon. Since the map is zoomed in, I've bumped the sides of the rectangles from 1px to 3px. 

```javascript
data.forEach(d =>{
  ctx.beginPath()
  // ctx.rect(d.Hrapx, d.Hrapy, 1, 1)
  var [x, y] = projection([d.Lon, d.Lat])
  ctx.rect(x, y, 3, 3)
```

<div id='graphic-1' class='graphic'></div>

<div class='code'><a href='https://github.com/1wheel/roadtolarissa/blob/master/source/hurricane/script.js#L32-L68'>code</a></div>


Now it's clear why the corner was cut off previously—there's only data for locations within a few miles of land. This misleadingly makes it look like it isn't raining over most of the ocean. To fix this, we decided to only show rainfall over land. 

There are a couple of ways this could have been done. Only drawing the observations on land would work, but the coastline would be blocky because the grid is zoomed in. Instead I decided to cover up the values in the ocean by drawing a white ocean and overlaying it. 

Drawing the ocean with only a shapefile of the land is a little tricky. I ended up drawing the land to a mask element and used that to clip a white rectangle covering up the whole graphic.

```javascript
var pathStr = path(topojson.feature(states, states.objects.states))
var mask = svg.append('mask#ocean')
mask.append('rect').at({width, height, fill: '#fff'})
mask.append('path').at({d: pathStr, fill: '#000'})
svg.append('rect').at({width, height, fill: '#fff', mask: 'url(#ocean)'})
```

Masks make [lots](https://bl.ocks.org/1wheel/76a07ca0d23f616d29349f7dd7857ca5) of [things](https://bl.ocks.org/1wheel/a8f39c8a96b71735488bf280d34bd765) possible. I suspect that there's a more efficient solution here, but it works!

<div id='graphic-2' class='graphic'></div>

<div class='code'><a href='https://github.com/1wheel/roadtolarissa/blob/master/source/hurricane/script.js#L73-L125'>code</a></div>

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

Making a separate network request for each hour of data wouldn't be very efficient, so I wrote a script to load all the CSVs, added a column with the observation time and then merged them into one big array. 

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

Combining two days of rainfall data made a 30 MB CSV—too big. Each observation from the same location repeated the station `Id`, `Lat`, `Lon`, `Hrapx` and `Hrapy` properties. To remove that redundancy, I grouped all the observations from one station into a single object. 

```javascript
var points = jp.nestBy(data, d => d.Id).map(point => {
  var vals = {}
  point.forEach(d => vals['t' + d.time] = +d.Globvalue)

  return {vals, lat: +point[0].Lat, +lon: point[0].Lon}
})

io.writeDataSync(__dirname + '/points.json', times)
```

This creates an array of stations, each with a `lat`, `lon` and `vals` hash. The `vals` hash lists the inches of rainfall that occurred during each hour (the t is preprended to avoid a [nasty safari bug](https://bugs.webkit.org/show_bug.cgi?id=164412)).   

```javascript
[
  {
    "lat": 26.6631,
    "lon": -97.4435,
    "vals": {
      "t2600": 0.02
      "t2601": 0.01
    },
  },
  {
    "lat": 27.6294,
    "lon": -98.2536,
    "vals": {
      "t2601": 0.04,
      "t2602": 0.01,
      "t2607": 0.03,
      "t2608": 0.11,
      "t2618": 0.05,
      "t2619": 0.12,
      "t2620": 0.09,
      "t2621": 0.01
    },
  },
  ...
```

Canvas is a lower level abstraction than SVG: it can easily draw 20,000 shapes, but there's no general purpose `.transition` function. To animate the rainfall on the 26th of August, I made an array of the hourly timestamps on that day and and looped over it at 5 frames per second. 

```javascript 
  var times = d3.range(24).map(d => 't26' + d3.format('02')(d))
  var curTimeIndex = 0
  d3.interval(() => {
    drawTime(times[curTimeIndex++ % times.length])
  }, 200)
```

At the start of each frame, everything on the canvas is removed with `clearRect`. Only points with rainfall at the current time are drawn. Since the data structure has changed `d.vals[time]` replaces `d.Globvalue`. 

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

Tom MacWright has good [tutorial on canvas animation](https://macwright.org/2015/08/14/canvas-animation-methods.html) with more techniques; `d3.interval` and `clearRect` are sufficient here: 

<div id='graphic-3' class='graphic'></div>

<div class='code'><a href='https://github.com/1wheel/roadtolarissa/blob/master/source/hurricane/script.js#L129-L202'>code</a></div>

## Accumulation 

Since the total rainfall was an important part of the story, I stared playing with different ways showing the accumulation of water. First, I needed to calculate how much water had fallen since the start of the storm. 

```javascript
points.forEach(function(d){
  var total = 0
  d.totals = {}
  for (hour in d.vals) {
    total += d.vals[hour]
    d.totals[hour] = total
  }

  d.pos = projection([d.lon, d.lat])
})
```

The hours have been added chronologically so the running `total` at each hour is equal to the cumulative rainfall at that hour. To keep things simple, the structure of the `totals` hash matches the `vals` hash. The point's position on the screen is also stored so `projection` doesn't have to be called on each point in each frame. 

Next, I added a new canvas element below everything else and made a new color scale for showing accumulation.

```javascript
var ctx2 = d3.select('#graphic')
  .append('canvas')
  .at({width, height})
  .node()
  .getContext('2d')

var totalColor = d => d3.interpolateYlGnBu(d / 12)
```

Finally, I updated `drawTime` to use the `totals` hash and the `totalColor` scale to draw the accumulated rainfall on the second canvas. I don't want to remove accumulated rainfall values on points that weren't rained on in a given hour, so `ctx2.clearRect` only gets called on the first hour. 

```javascript
function drawTime(time){
  ctx.clearRect(0, 0, width, height)
  if (time == times[0]) ctx2.clearRect(0, 0, width, height)

  points.filter(d => d.vals[time]).forEach(d =>{
    ctx2.beginPath()
    ctx2.rect(d.pos[0], d.pos[1], 3, 3)
    ctx2.fillStyle = totalColor(d.totals[time])
    ctx2.fill()

    ...
```

<div id='graphic-4' class='graphic'></div>

<div class='code'><a href='https://github.com/1wheel/roadtolarissa/blob/master/source/hurricane/script.js#206-L296'>code</a></div>


Rendering to different layers lets you break problems down into smaller pieces—it's much easier to tinker and fix bugs when you can hide everything (both visually and conceptually) but the part that you're working on. 

## Deleting data

Starting to look like something publishable! There were two remaining obstacles. As the hours passed and the storm progressed, the data file kept growing and was close to being too large to publish. And the bivariate color scale for showing rate and accumulation simultaneously was pretty but required too much explanation. 

A little tired from rushing to finish this, I sat down with Jeremy Ashkenas to figure out how to reduce the file size. There were some potential optimizations in how the data was represented, but it wasn't clear how much of an improvement they'd offer after gzipping. Instead we shrunk the data by removing off screen points and only including every fourth point on the grid.

```javascript
points = points.filter(d =>{
  var validLat =  25.7 <= d.lat && d.lat <= 31.2
  var validLon = -99.2 <= d.lon && d.lon <= -89.1
  var validIndex = d.Hrapx % 2 && d.Hrapy % 2

  return validLat && validLon && validIndex
})

io.writeDataSync(__dirname + '/points.json', points)
```

This got the data down to a manageable size. With only a quarter as many points, the sides of the rectangles needed to be doubled to continue covering the map. Half the side length is subtracted from the `x` and `y` positions of the rectangle to center it over its actual position.

```javascript
points.filter(d => d.vals[time]).forEach(d =>{
  ctx2.beginPath()
  ctx2.rect(d.pos[0] - 3, d.pos[1] - 3, 6, 6)
  ctx2.fillStyle = totalColor(d.totals[time])
  ctx2.fill()
```

The blockier grid gave us enough space to explore alternative representations for the rate of rainfall. We replaced the solid purple squares of color with the outline of a circle representing hourly rainfall. 

```javascript
  var r = Math.sqrt(d.vals[time])      

  ctx.beginPath()
  ctx.moveTo(d.pos[0] + r, d.pos[1])
  ctx.arc(d.pos[0], d.pos[1], r, 0, 2 * Math.PI)
  ctx.stroke()
```

This still left enough detail to see the eye as the hurricane made landfall and the current location of the storm, but didn't require a complicated legend with two color scales.

<div id='graphic-5' class='graphic'></div>

<div class='code'><a href='https://github.com/1wheel/roadtolarissa/blob/master/source/hurricane/script.js#L326-L413'>code</a></div>


## Finishing and beyond

The published version has additional features like a legend, a replay button, the tooltip that I snuck in after publishing and responsiveness. The code for all that is 4× longer than what's included here and isn't nearly as polished: 

```javascript
if (hour < 5) day = +day - 1
hour = hour - 5
hour = hour % 24
hour = (hour + 24) % 24

var ampm = hour >= 12 ? 'p.m.' : 'a.m.';
hour = hour % 12;
hour = hour ? hour : 12;
```

You do what you have to do to finish fast!

With additional time, I would have liked to figure out how to not reduce the spatial resolution of the data. A particle system in WebGL to show the rate (canvas can draw 10,000+ things at 5 FPS but not 60) and a more compact representation of that data (something like NetCDF perhaps) could have worked. If I had been more familiar with those tools, I might have given it a shot. 

Getting to make things at different tempos is one of my favorite parts of working on a graphics desk. Tight time constraints force you to find creative solutions, while slack between projects gives you space to explore techniques and tools you hadn't realized you wanted to learn. 



