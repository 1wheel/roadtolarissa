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

I've thinking about using a similar stacked bump chart to improve my (still very rough) [visualization](http://bl.ocks.org/1wheel/cbd9053de9bb39231924) of a line intersection algorithm. To get a feel for how to make one, I've recreated Alicia's chart with Basketball Reference's list of [most accomplished players](http://www.basketball-reference.com/leaders/hof_prob.html). The rest of the this post will show how to make your own bump chart with D3. 

##Drawing bars

First, the data needs to be in the right format. Since we're just showing when each player enters and exits the league (and ignoring complications like Jordan's Baseball career), lets start with an array of objects with exactly that info:

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

Lets try taking a look at the data. I typically start with [d3.conventions](http://github.com/1wheel/d3-starterkit), which packages several d3 conventions into a handy `c` object.

```javascript
var c = d3.conventions({height: 250, width: 750})
```

We pass a width and a height to `d3.conventions` and it adds an SVG to the page with the given width/height and margins for the axis. 

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

`c.svg.dataAppend(players, 'line')` adds line element with the for each player object to the SVG created by `d3.conventions`. Each line has a player's data attached to it by d3, which we can use to position and style the lines based on the properties of its corresponding player. 

`.translate(function(d, i){ return [0, c.y(i)] })` uses [d3-jetpack translate](https://github.com/gka/d3-jetpack#selectiontranslate) to arrange to lines vertically. The function passed to translate is called on each line. The first arguement, `d`, is the player object associtated with the line and the secound, `i`, is the index number of the line. By passing the index of each line to the y scale, which linearly converts number between 0 and the number of players to a number between 0 and the height of the chart, we're essentially evenly spacing each line vertically. This won't create a bump chart quite yet, but by using the start and stop properties of player object to set the length of the line, we can create a prelimary visualization. 

`ƒ('start', c.x))` creates a function that takes an object and returns its start property transformed by the x scale. `.attr('x1', ƒ('start', c.x))` calls the created function with every player object and sets their coorisponding line's `x1` attribute to the returned value. `.attr('x2', ƒ('stop', c.x))` does almost the same thing, but sets maps the player's `stop` property to the line's `x2` instead. Putting it all togeather: 

<div id='lines'></div>

Its a good idea to take frequent looks at your data from different perspectives. I initially entered Bird's career end date as 1982 instead of 1992. The error doesn't stand out in the rows of number, but its hard not to notice a single short bar among many long bars.  

The axis are drawn with another `d3.conventions` helper function, `drawAxis`. The x axis draws nicely by default, but getting a label for each player requires a little bit of fiddling with `tickValues` and `tickFormat`:  

```javascript
c.yAxis
    .tickValues(d3.range(players.length))
    .tickFormat(function(d){ return players[d].name })

c.drawAxis()
```

##Making bumps

Drawing the line with bumps is a bit trickier than straight lines. Instead of using a constant height for each line like we did above, the height of the line varies year to year. In a given year, the height of a player's line should be proportional to the number of players who started playing before them and are still playing in the current year. We'll start by adding `years` property to the player objects which will keep track of number of players under the current player in each:

```javascript
players.forEach(function(d){ d.years = [] })
```

We're going to be repeatably counting the number of active players who started playing before a given player, so lets also make sure that our array of players is sorted based on their start date. 

```javascript
players = _.sortBy(players, 'start')
```

With the array sorted, we can find the number of earlier starting, still active players for each player in given year by iterating over the `players` array. Each time we find a player that is active in the given year, increment an `numActiveBefore` variable and save its current value to the player. 

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

Each entry in the years array is an object with the year and the number of active players who started playing before the player.  Because our data has been reshaped to closely match what we're try draw, all we need to do now is convert every element of the `years` array to x and y pixel positions and connect those positions with a line. 

Calling `d3.conventions` again gives a clean slate to work with. The domain of the scales need to be defined again.

```javascript
var c = d3.conventions({height: 120, width: 750})

c.x.domain([1950, 2015])
c.y.domain([0, 10])

c.drawAxis()
```

Like before the x scale will convert a year between 1950 and 2015 to a number between 0 and 750, representing a x position. The y scale will convert years' `numActiveBefore` (always between 0 and 10 since there aren't ever 10 players active at once) to a value between 0 and 120, representing a y position. 

To draw the shapes, we'll use a [line generator](https://github.com/mbostock/d3/wiki/SVG-Shapes#line) to transform each player's years array to an [SVG path string](http://roadtolarissa.com/blog/2015/02/22/svg-path-strings/) that the browser can render. 

```javascript
var line = d3.svg.line()
    .x(ƒ('year', c.x))
    .y(ƒ('numActiveBefore', c.y))
```

Passing an array to `line` will convert every member of the array to point on the line. The x position is determined by the member's `year` property scaled by the x scale; the y position by the member's `numActiveBefore` property scaled by the y scale. 

Finally, we'll create a path element for each player and set its path `d`escription attribute to the result of calling `line` with the player's array of `years`.

```javascript
c.svg.dataAppend(players, 'path.player').attr('d', ƒ('years', line))
```

By using the layers of abstractions we've built up, this single line of code draws 20 complicated shapes at once!

<div id='bump'></div>

This is looking much closer than the bars, but without labels the chart isn't very useful. 

```javascript
c.svg.dataAppend(players, 'text.label')
    .attr('x', ƒ('start', c.x))
    .attr('y', ƒ('years', 0, 'numActiveBefore', c.y))
    .text(ƒ('name'))
    .attr({'text-anchor': 'end', 'dy': '.33em', 'dx': '-.5em'})
```

The x position of each player's label is proportional to the player's start year. The y position is a bit trickier - we need the `numbActiveBefore` of the first element of the player's `years` array transformed by the y scale. `.text(ƒ('name'))` sets the text of the label to the player's `name` property.

The start and end circles can be positioned similarly, using the cx and cy attributes. 

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

For the stop circle, the last element of the `years` array is used instead of the first. The chart is starting to come together:

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

These styles could have been set with `.style`, but moving them to a separate css file makes them easier to reuse and the javascript a little more readable. 

##Positioning labels

Adding labels definitely improves the chart, but introduce the problem of label overlap. While we could try to implement some sort of automatic label placement algorithm, our dataset is small so positioning them manually will be much quicker.  

The manually positioning can be reprsented as small offsets from the each label's calculated placement:

```javascript
var playersLabelOffsets = {
  "Russell": [-2, 2],
  "Wilt":    [0,  10],
  "Kareem":  [31, -10],
  ...
}
save positions

don't mutate starting array, save positions separately

##Taking a break

player segments, connections

##More improvements

Alicia had a number of great styling choices that I didn't go over. Trying to replicate them without looking at her code is good practice.

Tooltips? Hover highlighting? On load animations? Tempting to add, but less can be more. 

<link rel="stylesheet" type="text/css" href="/javascripts/posts/stackedBump/style.css">


<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-jetpack-v1.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-starterkit-v1.js" type="text/javascript"></script>


<script src="/javascripts/posts/stackedBump/script.js"></script>
