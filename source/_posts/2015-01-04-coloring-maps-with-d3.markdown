---
layout: post
title: "Coloring maps with d3"
categories: 
---

<link rel="stylesheet" type="text/css" href="/javascripts/posts/mapColor/style.css">

Transforming numbers into colors is tricky. Unlike positional encodings which our visual system automatically quantifies (this dot is twice as far from the baseline as the other), we don't have any notion of a particular shade of red being more twice as red as another. Since maps typically use position to display geometry though, we're stuck using the less effective color channel (some exceptions [population lines, bubble map]).

This post describes several [d3 quantitative scales](d3 wiki) - linear, quantize, quantile and threshold - walking through how they work and the tradeoffs involved when using them to display colors. 

We start with an array of objects - `var places` - representing the filled in areas on the right choropleth map. Each has a `value` property equal to a number that we'll encode as a color using the `colorScale` defined in the center. The scatter plot on the left shows the distribution of values - each place has been sorted and  

<div id='container'>
  <div id='overlay'>
    <svg></svg>
    <div id='color-code'>
      <div id='gradient'>
<pre>
colorScale = d3.scale.linear()
    .domain(d3.extent(places, ƒ('value')))
    .range([purples[0], _.last(purples)])
</pre>
      </div>
      <div id='quantize'>
<pre>
colorScale = d3.scale.quantize()
    .domain(d3.extent(places, ƒ('value')))
    .range(purples)
</pre>
      </div>
      <div id='quantile'>
<pre>
colorScale = d3.scale.quantile()
    .domain(_.sortBy(places, ƒ('value')))
    .range(purples)
</pre>
      </div>
      <div id='jenks'>
<pre>
breaks = ss.jenks(places.map(ƒ('value')), 5)
breaks[4] = breaks[4] + 1
colorScale = d3.scale.quantile()
    .domain(breaks.slice(1))
    .range(purples)
</pre>
      </div>
    </div>
  </div>
</div>
<div id='overlay-space'></div>

<div class='scroll-section'>
  <h1>Linear Scale</h1>
  [al line](asdf.com)
  Coloring maps can be tricky! Here is some advice on it. We start with an array of places, coloring them based on their locations:

      `placePaths.style('fill', function(d){ return color(x.value) })`

  `d3.scale.linear` uses linear interpolation to transform a value the domain into the range. This isn't a method
</div>

<div class='scroll-section'>
  <h1>Quantize</h1>
  some text about the top right
</div>

<div class='scroll-section'>
  <h1>Doesn't work great with outliers</h1>
  some text about the top right
</div>

<div class='scroll-section'>
  <h1>Quantile</h1>
  some text about the top right
</div>

<div class='scroll-section'>
  <h1>Might distort underlying date</h1>
  some text about the top right
</div>

<div class='scroll-section'>
  <h1>jenks natural breaks</h1>
  some text about the top right
</div>

<div id='bot-padding'></div>


<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/gscroll-0.1.js" type="text/javascript"></script>
<script src="/javascripts/libs/simple-statistics.js" type="text/javascript"></script>
<script src="/javascripts/posts/negBarTransition/lib.js" type="text/javascript"></script>

<script src="/javascripts/posts/mapColor/script.js" type="text/javascript"></script>
