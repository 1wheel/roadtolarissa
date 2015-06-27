---
template: post.html
title: "Stacked Bump Charts"
comments: true
permalink: /stacked-bump
categories: 
---

Alicia Parlapiano published an excellent [series of stacked bump charts](http://www.nytimes.com/interactive/2015/06/04/us/politics/stacking-up-the-presidential-fields.html) showing the history of presidential primary campaigns earlier this month. 

[img]

Her graphic does a great job showing both the size of the field and the duration of the primary campaigns, while previous pieces by the [Economist](http://www.economist.com/blogs/graphicdetail/2015/04/us-presidential-candidate-announcements) and [Bloomberg](http://www.bloomberg.com/politics/articles/2014-11-25/when-do-presidential-candidates-announce) focused on how the duration of campaigns has changed over time.

I've thinking about using a similar stacked bump chart to improve my (still very rough) [visualization](http://bl.ocks.org/1wheel/cbd9053de9bb39231924) of a line intersection algorithm. To get a feel for how to make one, I've recreated Alicia's chart with Basketball Reference's list of [most accomplished players](http://www.basketball-reference.com/leaders/hof_prob.html). The rest of the this post will show how to make your own bump chart with D3. 

##Drawing bars

First, the data needs to be in the right format. Since we're just showing when each player enters and exits the league (and ignoring complications like Jordan's Baseball career), lets start with an array of objects with exactly that info:

```javascript
var players = [
  {name: 'Russell',   start: 1957,  stop: 1969},
  {name: 'Wilt',      start: 1959,  stop: 1969},
  {name: 'Kareem',    start: 1970,  stop: 1989},
  {name: 'Jordan',    start: 1985,  stop: 2003},
  {name: 'Kobe',      start: 1997,  stop: 2015},
  {name: 'Duncan',    start: 1998,  stop: 2015},
	...
]
```

Lets try taking a look at the data. I typically start with [d3.conventions](http://github.com/1wheel/d3-starterkit), which packages several d3 conventions into a handy `c` object.

```javascript
var c = d3.conventions({height: 250, width: 750})
```

We pass a width and a height to `d3.conventions` and it adds an SVG to the page with the given width/height and margins for the axis. 

The c object also creates a linear x and y scale with their ranges set to the width and height respectively. By setting the x domain to our range of years and the y domain to the number of players, we can create a mapping between our player objects and pixels on the screen. 

```javascript
c.x.domain([1950, 2015])
c.y.domain([0, players.length])
```

Now we need to convert our javascript array of player objects to elements on the page that we can manipulate with the scales. 

```javascript
c.svg.dataAppend(players, 'line.player')
    .attr('x1', ƒ('start', c.x))
    .attr('x2', ƒ('stop' , c.x))
    .translate(function(d, i){ return [0, c.y(i)] })
    .style({stroke: 'steelblue', 'stroke-width': 4})
```

`c.svg.dataAppend(players, 'line.player')` adds line element for each player object to the SVG created by `d3.conventions`. Each line has a player's data attached to it by d3, which we can use to position and style the lines based on the properties of its corresponding player. 

`ƒ('start', c.x))` creates a function that takes an object and returns its start property transformed by the x scale. `.attr('x1', ƒ('start', c.x))` sets each line's `x1` attribute by passing its player object to the created function, essentially setting 

`.translate(function(d, i){ return [0, c.y(i)] })` uses [d3-jetpack]() to arrange to lines vertically. Setting the `y1` and `y2` attributes of the lines would have also worked, would have required duplicated 

Putting it all together 
<div id='lines'></div>

`d3.conventions` also configures an x and y axis along with a `drawAxis`. The x axis draws nicely by default, but getting a label for each player requires a little bit of fiddling with `tickValues` and `tickFormat`.  

```javascript
c.yAxis
    .tickValues(d3.range(players.length))
    .tickFormat(function(d){ return players[d].name })

c.drawAxis()
```

Its a good idea to take frequent looks at your data from different perspectives. I initially marked Bird's career end date as 1982. The error doesn't stand out in rows of number, but its hard not to notice a single short bar among many long bars.  

##Making bumps

Words, words words


```javascript
var c = d3.conventions({height: 120, parentSel: d3.select('#bump')})

c.x.domain([1950, 2015])
c.y.domain([0, 10])
```

<div id='bump'></div>


##Position labels

d3.drag

save positions

don't mutate starting array, save positions separately

##Taking a break

player segments, connections



<link rel="stylesheet" type="text/css" href="/javascripts/posts/stackedBump/style.css">


<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-jetpack-v1.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-starterkit-v1.js" type="text/javascript"></script>


<script src="/javascripts/posts/stackedBump/script.js"></script>
