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

[img]

I've been thinking about using a similar stacked bump chart to improve my (still very rough) [visualization](http://bl.ocks.org/1wheel/cbd9053de9bb39231924) of a line intersection algorithm. To get a feel for how to make one, I've recreated Alicia's chart with Basketball Reference's list of [most accomplished players](http://www.basketball-reference.com/leaders/hof_prob.html). The rest of the this post will show how to make your own bump chart with d3. 

##Drawing bars

First, the data needs to be in the right format. Since we're just showing when each player enters and exits the league (and ignoring complications like Jordan's baseball career), let's start by creating an array of objects with exactly that info:

```javascript
var players = [
  {name: 'Russell',   start: 1957,  stop: 1969},
  {name: 'Wilt',      start: 1959,  stop: 1969},
  {name: 'Kareem',    start: 1970,  stop: 1989},
  {name: 'Bird',      start: 1980,  stop: 1982},
  {name: 'Jordan',    start: 1985,  stop: 2003},
  {name: 'Kobe',      start: 1997,  stop: 2015},
  {name: 'Duncan',    start: 1998,  stop: 2015},
	...
]
```

To take a look at the data, I typically start with [d3.conventions](http://github.com/1wheel/d3-starterkit), which packages several d3 conventions into a handy `c` object.

```javascript
var c = d3.conventions({height: 250, width: 750})
```

We pass a width and a height to `d3.conventions` and it adds an SVG to the page with the given width/height and margins for the axes. 

The c object also creates a linear x and y scale with their ranges set to the width and height respectively. By setting the x domain to our range of years and the y domain to the number of players, we can create a mapping between our player objects and pixels on the screen. 

```javascript
c.x.domain([1950, 2015])
c.y.domain([0, players.length - 1])
```

Now we need to convert our javascript array of player objects to elements on the page that we can manipulate with the scales. 

```javascript
c.svg.dataAppend(players, 'line')
    .translate(function(d, i){ return [0, c.y(i)] })
    .attr('x1', ƒ('start', c.x))
    .attr('x2', ƒ('stop' , c.x))
    .style({stroke: 'steelblue', 'stroke-width': 4})
```

`c.svg.dataAppend(players, 'line')` adds a line element for each player object to the SVG created by `d3.conventions`. Each line has a player's data attached to it by d3, which we can use to position and style the lines based on the properties of its corresponding player. 

`.translate(function(d, i){ return [0, c.y(i)] })` uses [d3-jetpack translate](https://github.com/gka/d3-jetpack#selectiontranslate) to arrange the lines vertically. The function passed to translate is called on each line. The first argument, `d`, is the player object associated with the line and the second, `i`, is the index number of the line. By passing the index of each line to the y scale, which linearly converts numbers between 0 and the number of players to numbers between 0 and the height of the chart, we're essentially evenly spacing each line vertically. This won't create a bump chart quite yet, but by using the start and stop properties of the player objects to set the length of the line, we can create a preliminary visualization. 

`ƒ('start', c.x))` creates a function that takes an object and returns its start property transformed by the x scale. `.attr('x1', ƒ('start', c.x))` calls the created function with every player object and sets their corresponding line's `x1` attribute to the returned value. `.attr('x2', ƒ('stop', c.x))` does almost the same thing, but maps the player's `stop` property to the line's `x2` attribute instead. Putting it all together: 

<div id='lines'></div>

It's a good idea to take frequent looks at your data from different perspectives. I initially entered Bird's career end date as 1982 instead of 1992. The error doesn't stand out in rows of numbers, but it's hard not to notice a single short bar among many long bars thanks to preattentive visual processing.

The axes are drawn with another `d3.conventions` helper function, `drawAxis`. The x axis draws nicely by default, but getting a label for each player requires a little bit of fiddling with `tickValues` and `tickFormat`:  

```javascript
c.yAxis
    .tickValues(d3.range(players.length))
    .tickFormat(function(d){ return players[d].name })

c.drawAxis()
```

##Making bumps

Drawing the lines with bumps is trickier than drawing straight lines. Instead of using a constant height like we did above, the height of each line varies year to year. In a given year, the height of a player's line should be proportional to the number of players who started playing before him and are still playing in the current year. We'll start by adding a `years` property to the player objects, which will keep track of the number of active players who started before him in each year:

```javascript
players.forEach(function(d){ d.years = [] })
```

We're going to be repeatably counting the number of active players who started before a given player, so let's sort the array of players based on their start dates. 

```javascript
players = _.sortBy(players, 'start')
```

With the array sorted, we can find the number of earlier starting, still active players for each player in given year by iterating over the `players` array. Each time we find a player who's active in the given year, increment an `numActiveBefore` variable and save its current value to that player. 

<div id='yeariteration'></div>
Repeating this for every year gives enough information to construct each player's `years` array: 

```javascript
d3.range(1950, 2016).forEach(function(year){
  var numActiveBefore = 0
  players.forEach(function(d){
    //is the player active in the given year?
    if (d.start <= year && year <= d.stop){
      d.years.push({year: year, numActiveBefore: numActiveBefore++})
    }
  })
})
```

Each entry in the `years` array is an object with the year and the number of active players who started playing before the player in question.  Because our data has been reshaped to closely match what we're trying to draw, all we need to do now is convert every element of the `years` array to x and y pixel positions and connect those positions with a line. 

Calling `d3.conventions` again gives us a clean slate to work with. The domain of the scales needs to be defined again:

```javascript
var c = d3.conventions({height: 120, width: 750})

c.x.domain([1950, 2015])
c.y.domain([0, 10])

c.drawAxis()
```

Like before, the x-scale will convert numbers between 1950 and 2015 to numbers between 0 and 750, representing x positions. The y-scale will convert years' `numActiveBefore` (always between 0 and 10, since there aren't ever 10 players active at once) to a value between 0 and 120, representing a y position. 

To draw the shapes, we'll use a [line generator](https://github.com/mbostock/d3/wiki/SVG-Shapes#line) to transform each player's `years` array to an [SVG path string](http://roadtolarissa.com/blog/2015/02/22/svg-path-strings/) that the browser can render:

```javascript
var line = d3.svg.line()
    .x(ƒ('year', c.x))
    .y(ƒ('numActiveBefore', c.y))
```

Passing an array to `line` will convert every member of the array to a point on the line. The x position is determined by the member's `year` property scaled by the x-scale; the y position by the member's `numActiveBefore` property scaled by the y-scale. 

Finally, we'll create a path element for each player and set its path `d` attribute to the result of calling `line` with the player's `years` array:

```javascript
c.svg.dataAppend(players, 'path.player').attr('d', ƒ('years', line))
```

By using the layers of abstractions we've built up, this single line of code draws 20 complicated shapes at once!

<div id='bump'></div>

This is looking much closer to Alicia's chart than the bars we started with, but without labels it isn't very useful, so let's add those: 

```javascript
c.svg.dataAppend(players, 'text.label')
    .attr('x', ƒ('start', c.x))
    .attr('y', ƒ('years', 0, 'numActiveBefore', c.y))
    .text(ƒ('name'))
    .attr({'text-anchor': 'end', 'dy': '.33em', 'dx': '-.5em'})
```

The x position of each player's label is proportional to the player's start year. The y position is less straightforward - we need the `numbActiveBefore` of the first element of the player's `years` array transformed by the y-scale. `.text(ƒ('name'))` sets the text of the label to the player's `name` property.

The start and end circles can be positioned similarly, using the `cx` and `cy` attributes:

```javascript
c.svg.dataAppend(players, 'circle.start')
    .attr('cx', ƒ('start', c.x))
    .attr('cy', ƒ('years', 0, 'numActiveBefore', c.y))
    .attr('r', 3)

c.svg.dataAppend(players, 'circle.stop')
    .attr('cx', ƒ('stop', c.x))
    .attr('cy', ƒ('years', _.last, 'numActiveBefore', c.y))
    .attr('r', 3)
```

For the stop circle, the last element of the `years` array is used instead of the first. Now the chart's starting to come together:

<div id='bump-circles'></div>

We're also using a little bit of css styling:

```css
.player{
  stroke: steelblue;
  stroke-width: 4px;
  fill: none;
}

circle{
  stroke-width: 2px;
  stroke: steelblue;
  fill: steelblue;
}

.start{
  fill: white;
}

.label{
  text-shadow: 0 1px 0 #F5F5F5, 1px 0 0 #F5F5F5, 0 -1px 0 #F5F5F5, -1px 0 0 #F5F5F5;
}
```

These styles could have been set with `.style`, but moving them to a separate css file makes them easier to reuse and the javascript more readable. 

##Positioning labels

Adding labels definitely improves the chart, but introduces the problem of label overlap. While we could try to implement some sort of automatic label placement algorithm, our dataset is small so positioning them manually will be much quicker.  

The manual positioning can be represented as small offsets from each label's calculated placement and rendered with `translate`:

```javascript
var playerLabelOffsets = {
  "Russell":   [-2, 5],
  "Wilt":      [0,  10],
  "Kareem":    [31, -10],
  "Robertson": [53, -5],
  ...
}

c.svg.selectAll('text.name')
    .translate(function(d){ return playerLabelOffsets[d.name] })
```

So the label 'Robertson' is moved 53 pixels to the right and 5 up. These offsets could be stored in the `players` array, but manually merging data from different sources is generally not a good idea - when the players data invariably needs to be updated, we can now just drop the new spreadsheet in. 

It's possible to adjust all the offsets by editing the position value and incrementally reloading the page. This isn't that bad with [live-server](https://github.com/tapio/live-server), but getting things in just the right position by typing numbers isn't ideal. Using [d3.behavior.drag](https://github.com/mbostock/d3/wiki/Drag-Behavior), we can create an event handler that will update a label's offsets when we click and drag on it: 

```javascript
var drag = d3.behavior.drag()
    .on('drag', function(d){
      var pos = d3.mouse(c.svg.node())
      var x = pos[0] - d3.select(this).attr('x')
      var y = pos[1] - d3.select(this).attr('y')
      var offset = [x, y].map(Math.round)
      
      playerLabelOffsets[d.name] = offset
      d3.select(this).translate(offset)
    })

c.svg.selectAll('text.name').call(drag)
```

Each time we drag a label, the drag function finds the position of the mouse relative to the upper-left hand corner of the SVG and subtracts the calculated placement (the x and y attributes) to find the offset. The updated offset is saved to `playerLabelOffsets` so it can be accessed later and the label itself is translated with the offset. This happens every time the mouse moves while dragging - a much faster feedback loop than editing a number, saving a file and reloading a web page.

I've arranged the labels to get rid of the overlap. They're definitely not perfect - can you do better?

<div id='bump-drag'></div>

_Click and drag to reposition the labels_
<br>

After dragging the labels around, the mutated `playerLabelOffsets` object can be copied to the clipboard by running `> copy(playerLabelOffsets)` in the browser console and saved by pasting the object into your javascript file. 


##Taking a break

While it's starting to look nice, our chart isn't quite showing the number of time that great players are active at a given time. Jordan and Magic took breaks. These periods of activity and inactively can be represented by an array of player segments with start and stop years for each segment.  

```javascript
var playerSegments = [
  {name: 'Russell',   start: 1957,  stop: 1969},
  {name: 'Kareem',    start: 1970,  stop: 1989},
  {name: 'Jordan',    start: 1985,  stop: 1994},
  {name: 'Jordan',    start: 1996,  stop: 1998},
  {name: 'Jordan',    start: 2001,  stop: 2003},
  ...
}
```

With [d3.nest](https://github.com/mbostock/d3/wiki/Arrays#-nest) we can group the player segments by name. d3.nest takes a key function and an array of objects. It calls the key function on each object and returns an array of key/values pairs. The key property is a string returned by the key function and the values property is an array of all the original objects that returned a given key. 

By using `ƒ('name')` as the key function and passing in `playerSegments`, each player segment with the same name will be grouped together. We'll iterate over each of those groups to recreate a `players` array with the same properties as the one manually created earlier:

```javascript
var players = d3.nest().key(ƒ('name')).entries(playerSegments)
players.forEach(function(d){
  d.values = _.sortBy(d.values, 'start')
  d.start  = d.values[0].start
  d.stop   = _.last(d.values).stop
  d.name   = d.key
  d.years  = []
})
```

The player's overall start is equal to the first segment's start; the player's stop is equal to the last segment's stop. The year's property of each player can be calculated as we did [previously](#yeariteration), by iterating over each year and finding the number of previously active players for each player.

Since our new `players` array has the same properties as before, the `line`  function can be reused to draw a thin line to show their career span: 

```javascript
c.svg.dataAppend(players, 'path.player')
    .attr('d', ƒ('years', line))
    .style('stroke-width', 1)
```
<div id='bump-thin'></div>

To create a thick line for each player segment, we'll iterate over each player's segments (stored in the values array by d3.nest). The segments' `years` array will be created by filtering the player's `years` array for years between the segment's `start` and `stop`:

```javascript
players.forEach(function(player){
  player.values.forEach(function(segment){
    segment.years = player.years.filter(function(year){
      return segment.start <= year.year && year.year <= segment.stop
    })
  })
})
```

Now the `playerSegments` have a `years` array and thick lines can be drawn with the `line` function:

```javascript
c.svg.dataAppend(playerSegments, 'path.player')
    .attr('d', ƒ('years', line))
    .style('stroke-width', 3)
```
<div id='bump-break'></div>


This same technique could be used to encode other time based information along a single bump line. If we made segments for each team a player was on, for example, we could color code the lines to see Robinson's and Duncan's long, overlapping time on the Spurs or [the Shaq's rainbow](https://i.imgur.com/oCTy1.jpg).  

##More improvements

Alicia had a number of great styling choices that I didn't go over. Trying to replicate them without looking at her code and then peeking at her css if you get stuck is good practice.

If I had been publishing this chart, I would have gone over board with tooltips, hover highlighting and scroll into view animations. Those effects add a lot in the right place, but thinking carefully about Alicia's chart has been instructive to me - getting the little details just right makes the chart interesting without requiring flashy effects.

<link rel="stylesheet" type="text/css" href="/javascripts/posts/stackedBump/style.css">


<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-jetpack-v1.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-starterkit-v1.js" type="text/javascript"></script>


<script src="/javascripts/posts/stackedBump/script.js"></script>
