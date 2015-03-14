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

Writing this code in the Source tab as a [snippet](https://developer.chrome.com/devtools/docs/authoring-development-workflow#snippets) and checking the output by running `table(nominations)` in the console creates a pleasantly short feedback loop. To get more information from each nomination, set a breakpoint inside the `else` block and try looking for something else that can be programmatically read from the text (I also [get](asdf) the name of the movie, the winner and clean up the year field).

For a larger project, setting up a [replicatable data pipeline](http://bost.ocks.org/mike/make/) is generally a best practice; in the interest of taking a quick look at the oscar, 


`d3.csv.format` converts an array of objects to a csv string. With `copy(d3.csv.format(nominations))`, the nomination data copied to the clipboard and can be pasted into a csv file locally. Documenting what you've done so far or making the process [replicatable](http://bost.ocks.org/mike/make/) is generally a good idea to save yourself confusion in the future.


#### Looking at data

To get started quickly with minimal fuss, I typically grab a copy of my d3-starter-kit repo. It contains [d3](blah.com), [lodash](asdf), [d3-jetpack](asdj) 

Calculating summary known summary statistics is a good way to double check that the data is close to being correct:

```
var actressNomintions = nominations.filter(function(d){ return d.award == 'Best Actress' })
var byActress = d3.nest().key(f('name')).entries(actressNomintions)
byActress.length  //There have been 231 people nominated for Best Actress -  
d3.max(byActress, f('key', 'length')) //merel has been nominated x times - 
```
`f` is a combination 


#### Animating data


#### Interesting things to read

Wickamh - tidy data + split apply combine

tamera's book!

jsdata





```
var nominations = [],
    curYear,
    curNth,
    curAward

d3.selectAll('dl > *').each(function(){
  var sel = d3.select(this)
  if      (this.tagName == 'DT'){
    curYear = sel.text().trim()
    curNth = curYear.split('(')[1].split(')')[0].slice(0, str.length - 2)
  }
  else if (this.tagName == 'DIV'){
    curAward = sel.text().replace(' IN A LEADING ROLE', '').trim()
  }
  else{
    var nom = {year: curYear, nth, curNth, award: curAward}
    var text = sel.text().split('[NOTE')[0].trim()
    nom.won = ~text.indexOf('*') ? 1 : ''
    var nameMovie = text.replace('*', '').split(' -- ')
    nom.name = nameMovie[0]
    nom.movie = nameMovie[1] ? nameMovie[1].split(' {')[0].replace(/"/g, '') : ''
    nominations.push(nom)
  }
})

```

copy(d3.csv.format(nominations))
