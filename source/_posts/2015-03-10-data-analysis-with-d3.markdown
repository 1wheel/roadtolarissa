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

All the awards are contained within a single `dl` element. Each years and award types are marked with `dt` and `div` elements, with the actual nominations are `table` elements interwoven - not nested - between. While jquery is already loaded and the 

```
var script = document.createElement("script");
script.src = 'http://d3js.org/d3.v3.min.js';
document.body.appendChild(script);

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

copy(d3.csv.format(nominations))
```