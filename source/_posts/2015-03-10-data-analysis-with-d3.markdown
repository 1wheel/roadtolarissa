---
layout: post
title: "Data Analysis With D3"
comments: true
categories: 
---

D3 is best known for the polished interactive visualizations it powers. Because of the richness of its API, it is also an excellent tool for acquiring and, with a bit of work, analyzing, data. Using the history of the Oscars as an example, this post will walk through this process.

#### Scraping data

The [Academy Awards Database](http://awardsdatabase.oscars.org/ampas_awards/BasicSearchInput.jsp) displays all award nominations on a single page (pick award years 1927 to 2014 and click search). The Elements tab of the dev tools reveals the structure of the page: 

<gif></gif>

All the awards are contained within a single `dl` element. Each years and award types are marked with `dt` and `div` elements, with the actual nominations are `table` elements interwoven - not nested - between. While we could use `document.querySelectorAll` or the already loaded jquery to traverse the DOM, injecting onto the page allows us to use the same API for gathering and displaying data. Its also simple: 

```javascript
var script = document.createElement("script")
script.src = 'http://d3js.org/d3.v3.min.js'
document.body.appendChild(script)
```

Iterating over each child of the `dl` element, we build an array of nominations by tracking the current year and award type. Each time a `table` element is encountered, a new object is added to the nominations array with the year, award and name of the nominee parsed from the table text.

```javascript
var nominations = [],
    curYear,
    curAward

d3.selectAll('dl > *').each(function(){
  var sel = d3.select(this)
  if      (this.tagName == 'DT'){
    curYear = sel.text()
  }
  else if (this.tagName == 'DIV'){
    curAward = sel.text()
  }
  else{
    nominations.push({year: curYear, award: curAward, name: sel.text().split(' -- ')[0]})
  }
})

```

Writing this code in the Source tab as a [snippet](https://developer.chrome.com/devtools/docs/authoring-development-workflow#snippets) and checking the output by running `table(nominations)` in the console creates a pleasantly short feedback loop. To get more information from each nomination, set a breakpoint inside the `else` block and try looking for something else that can be programmatically read from the text (I also [get](asdf) the name of the movie, the winner and clean up the year field).

For a larger project, setting up a [replicatable data pipeline](http://bost.ocks.org/mike/make/) is generally a best practice; in the interest of taking a quick look at the oscar, 


`d3.csv.format` converts an array of objects to a csv string. With `copy(d3.csv.format(nominations))`, the nomination data copied to the clipboard and can be pasted into a csv file locally. Documenting what you've done so far or making the process [replicatable](http://bost.ocks.org/mike/make/) is generally a good idea to save yourself confusion in the future.


#### Looking at data

To get started quickly with minimal fuss, I usually grab a copy of my [d3-starter-kit repo](blah.com). It contains [d3](blah.com), [lodash](asdf), [d3-jetpack](asdj) and some helper functions and for generating tooltips, scales, axiis and styling them.

Having saved the array of nomintions as `data.csv`, we can load it into the starter-kit [template](script.js) and check the integrity of our data: 

```javascript
d3.csv('data.csv', function(nominations){
  //convert the award ceremony index to a number  
  nominations.forEach(function(d){ d.ceremonyNum = +d.ceremonyNum })

  //check that every ceremony has been loaded
  d3.extent(nominations, f('ceremonyNum')) //[1, 87]
```

Passed a single string, `f` [returns a function](link to old post) that takes an object and returns the object's string property. For the computer, `f('ceremonyNum')` is equivalent to `function(d){ return d.ceremonyNum; })`. For humans, the lack syntactical noise makes it more expressive and quicker to type - critical for rapid prototyping.

Lets focus in on actress nominations:

```javascript
//select only actress nominations
var actressNominations = nominations.filter(function(d){ 
  return d.award == 'ACTRESS' })

//group by name
var byActress = d3.nest().key(f('name')).entries(actressNominations)

//sanity check - Merylr Strep has 15 nominations
d3.max(byActress, f('values', 'length'))
```

[d3.nest](docs) takes a key function and an entries array, grouping the members of the entires by result of applying the key function. An array of group objects is returned. Each has a `key` property, here the name of an actress, and an array of `values`, here an array of nominations. 

When passed multiple string arguments, `f` converts each into field accessor functions and returns their composition. `f('values', 'length')` is equivalent to `function(d){ return d.values.length }); calling it with every group object and taking the max returns the most Best Actress nominations a single person has received.Calculating known summary statistics from your data - here Meryl's [15 Best Actress nominations](wiki.com) - is a great way of double checking your data and calculations. 
I'm curious about the relationship between number of previous nominations and actual winners. To get an overview of the data, I'll start by making an Amanda Cox style [record chart](http://flowingdata.com/2014/11/06/touchdown-passing-record/). To do that, each nomination needs information about the previous nominations the nomminie had:

```javascript
//count previous nominations
byActress.forEach(function(actress){
  actress.values.forEach(function(nomination, i){
    actress.prevNominations = i 
    nomination.otherNominations = actress.values
  })
})
```

Since the nominations are already sorted by year, the index of each actresses' nomination in its nested values array is equal to the number of previous nominations the actress had at the time of the nomination. While looping over each of the nominations in the values array, I also attach a reference to the actresses' other nominations so it will be easy to find a nominees' other nominations easily later.   

Time to graph the data! 

```javascript
var c = d3.conventions({parentSel: d3.select('#nominations-scatter')})

//compute domain of scales
c.x.domain(d3.extent(actressNominations, f('ceremonyNum')))
c.y.domain(d3.extent(actressNominations, f('prevNominations')))

//draw x and y axis
c.drawAxis()

//draw a circle for each actress nomination
c.svg.dataAppend(actressNominations, 'circle.nomination')
    .attr('cx', f('ceremonyNum', c.x))
    .attr('cy', f('prevNominations', c.y))
    .classed('winner', f('won'))
    .attr('r', 3)
    .call(d3.attachTooltip)
```

There are a couple of simplifications that make the code shorter and more readable. `d3.conventions` returns an object with automatically configured margin, svg, scales and axis - saving the tedium of globbing together snippets from several bl.ocks over and over.

`c.svg.dataAppend(actressNominations, 'circle.nomination')` is shorthand for

```javascript
c.svg.selectAll('circle.nomination')
    .data(actressNominations).enter()
  .append('circle')
    .classed('nomination', true)
```

In addition to converting strings into accessor functions, `f` also composes functions. Typically the functions passed to `attr` or `style` select a single property from that data bound to an element and encode it as a visual property with a scale function. Instead of typing this same type of function over and over - `.attr('cx', function(d){ return c.x(d.ceremonyNum) })` - we can strip it down to its bare essentials with `.attr('cx', f('ceremonyNum', c.x))`.

`d3.attachTooltip` adds a basic tooltip showing all the properties attached to an element, removing the need to `Inspect element` and run `d3.select($0).datum` to examine outliers.  

The result:

##### Number of previous nominations over time
<div id='nominations-scatter'></div>

Unfortunately nominations in the same year with the same number of previous nominations cover each other up. We can fix that by grouping on year and previous nominations, then offsetting nominations in the same group so they don't overlap:

```javascript
d3.nest()
  .key(function(d){ return d.ceremonyNum + '-' + d.prevNominations })
  .entries(actressNominations)
.forEach(function(year){
  //sort nominations so winners come first  
  year.values.sort(d3.ascendingKey('won')).forEach(function(d, i){
    d.offset = i
    //save new position as a property for labels later
    d.pos = [c.x(d.ceremonyNum) + i*1.5, c.y(d.prevNominations) - i*3]
  })
})

var circles = c.svg.dataAppend(actressNominations), 'circle.nomination')
    //position with transform translate instead
    .translate(f('pos'))
    .classed('winner', f('won'))
    .attr('r', 3)
```

Just like with the calculation of previous nominations, we've grouped the data, sorted items in the same group, and saved their index. This pattern is useful in a wide range situations// and d3 makes it easy to use.  

<div id='nominations-offset'></div>

This graph is functional but it is difficult to see the arcs of different careers. We can start by highlight all of an actresses' nominations on mouseover:    

```javascript
var mouseoverPath = c.svg.append('path.connection')

circles.on('mouseover', function(d){
  //make nominations with the same name larger
  circles.attr('r', function(e){ return d.name == e.name ? 7 : 3 })

  //connect them with a path
  mouseoverPath.attr('d', 'M' + d.otherNominations.map(f('pos')).join('L'))
})
```

Saving a reference to an actresses' other nominations and storing position as an `[x, y]` property makes [drawing a path](roadtolariss/as) connecting them simple.   

Connecting and labeling the nominations of very successful actresses helps provide context while examining other careers. Oscar nominations aren't nearly as sparse as home runs; only the actresses with more than 5 nominations are connected so the bottom of the graph doesn't turn to spaghetti.

```javascript
var topActresses = byActress.filter(function(d){ return d.values.length > 5 })

c.svg.dataAppend(topActresses, 'path.connection')
    .attr('d', function(d){ return 'M' + d.values.map(f('pos')).join('L') })

c.svg.dataAppend(topActresses, 'text')
    //values are sorted by time - most recent nomination is always last 
    .translate(function(d){ return _.last(d.values).pos })
    .text(f('key'))
    .attr({dy: -4, 'text-anchor': 'middle'})
```

<div id='nominations-linked'></div>

While javascript doesn't have an abundance of stats packages like R or python, `d3.nest` and `d3.mean` make rudimentary trend analysis possible:

```javascript
//group by year
var byYear = d3.nest().key(f('ceremonyNum')).entries(actressNominations)
byYear.forEach(function(d){
  //for each year, select previous 15 years
  var prevYears = byYear.slice(Math.max(0, i - 15), i + 1)
  //create array of all nominations over previous 15 years
  var prevNoms = _.flatten(prevYears.map(f('values')))

  //average previous nominations for nominees and winners 
  d.nomAvgPrev = d3.mean(prevNoms,                  f('prevNominations'))
  d.wonAvgPrev = d3.mean(prevNoms.filter(f('won')), f('prevNominations'))
})
```
Looping over each year, the average number of previous nominations over the past 15 is computed and attached to each year group. This isn't a particularity efficient way of calculating a rolling average - see [science.js](https://github.com/jasondavies/science.js) or [simple-statistics](https://github.com/tmcw/simple-statistics) for that - but our data set is small and it gets the job done.


```javascript
var line = d3.svg.line()
    .x(f('key', c.x))
    .y(f('nomAvgPrev', c.y))

c.svg.append('path.nomAvg').attr('d', line(byYear))
c.svg.append('path.winAvg').attr('d', line.y(f('wonAvgPrev', c.y))(byYear))
```

Again, `f` provides a susscient way of grabbing a property from an object and transforming it with a scale. 

<div id='nominations-average'></div>

Over the last 20 years, the accemdy has prefered picked best actresses with fewer previous nominations than their other nommines. 

#### Animating data


#### Interesting things to read
ggplot2 dplyr rstudio provide a lovely intergrated enviroment with tight feedback cycles
Wickamh - tidy data + split apply combine

tamera's book!

rotations of data, tuffte/heere

iterating over the design space

jsdata