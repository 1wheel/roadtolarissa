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

```
var script = document.createElement("script")
script.src = 'http://d3js.org/d3.v3.min.js'
document.body.appendChild(script)
```

Iterating over each child of the `dl` element, we build an array of nominations by tracking the current year and award type. Each time a `table` element is encountered, a new object is added to the nominations array with the year, award and name of the nominee parsed from the table text.

```
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
    nominations.push({year: curYear, award: curAward, name: sel.text().split(' -- ')[0]}
  }
})

```

Writing this code in the Source tab as a [snippet](https://developer.chrome.com/devtools/docs/authoring-development-workflow#snippets) and checking the output by running `table(nominations)` in the console creates a pleasantly short feedback loop. Getting more information from each nomination is simple - just set a breakpoint inside the `else` block and try looking for something else that can be programtically read from the text. 



```
var nominations = [],
    curYear,
    curAward

d3.selectAll('dl > *').each(function(){
  var sel = d3.select(this)
  if      (this.tagName == 'DT'){
    curYear = sel.text().trim()
  }
  else if (this.tagName == 'DIV'){
    curAward = sel.text().trim()
  }
  else{
    var nom = {year: curYear, award: curAward}
    var text = sel.text().split('[NOTE')[0].trim()
    nom.won = !!~text.indexOf('*')
    var nameMovie = text.replace('*', '').split(' -- ')
    nom.name = nameMovie[0]
    nom.movie = nameMovie[1] ? nameMovie[1].split(' {')[0].replace(/"/g, '') : ''
    nominations.push(nom)
  }
})

```

copy(d3.csv.format(nominations))
