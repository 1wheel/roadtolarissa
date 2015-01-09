---
layout: post
title: "Coloring maps with d3"
categories: 
---

<link rel="stylesheet" type="text/css" href="/javascripts/posts/mapColor/style.css">

Transforming numbers into colors is tricky. Unlike positional encodings which our visual system automatically quantifies (this dot is twice as far from the baseline as the other), we don't have any notion of a particular shade of red being more twice as red as another. Since maps typically use position to display geometry though, we're stuck using the less effective color channel (some exceptions [population lines, bubble map]).

This post describes several [d3 quantitative scales](d3 wiki) - linear, quantize, quantile and threshold - walking through how they work and the tradeoffs involved when using them to display colors. 

We start with an array of objects - `places` - representing the filled in areas on the right choropleth map. Each has a `value` property equal to a number that we'll encode as a color using the `colorScale` defined in the center code snippet. The scatter plot on the left shows the distribution of values. 

The code in the center uses a couple of helpers: `purples` an array of 5 colorbrewer purple shades, `_` library of helper functions, `ss` simple-statics and `ƒ` a field accessor. 


####Linear
`d3.scale.linear()` returns a function that uses linear interpolation to transform a value the domain into the range. `d3.extent` finds the minimum and maximum number the value property takes on which is then used to set the domain. The range is set to the lightest and darkest shade of purple. Internally, `d3.interpolate` [detects](link to docs) that the range is a color and has `colorScale` return lighter shades of purple when passed lower numbers and darker shades when passed higher numbers. By default the colors are interpolated through a RGB color space; d3 also supports the more [perceptually accuratee](simmons?) [HSL](docs) and LAB(docs). 

Even with a good color space, linear interpolation isn't great for choropleths. Our perception of an objects darkness [depends](optical illiusion) on how dark its neighbors are which makes it difficult to compare areas that aren't adjacent. We could avoid this problem by using just a few easily discernible colors instead of many slightly different ones for every possible value. Using discrete comes at a cost of not being able to see small differences between values, but since color conveys those differences so poorly the trade off is usually worth it. 

####Quantize
A quantize scale divides the values into several discrete buckets, assigning a color to each value based on which bucket they fall into. As with the linear scale, the domain of the scale is set to the minimum and maximum values. Instead of passing two colors to the range however, an array of colors are passed. The scale function then creates a bucket for each color, shown by the 5 vertical bars on the left scatter plot. 

The quantize scale divides the range of values evenly so that values in the bottom 5th - those between `minValue` and `minValue + 1/5*(maxValue +`minValue)` - are put in the first bucket with the lightest color while values in the the top 5th are put in the darkest bucket. More formally values in the nth bucket will be between `minValue + n/purples.length*(maxValue - minValue)` and `minValue + (n + 1)/purples.length*(maxValue - minValue)`.

####Outliers outsized impact
While the quantize scale makes intuitive sense and is easy to implement, skewed data or outliers can totally alter the color scale. Here a few very large values stretch out the scale, compressing the rest of the values into one color bucket which results in a map with just two colors. Visual differences between lower values are erased and the two colors that remain don't intrinsically communicate anything about the proportions between the values the represent.

####Quantile


####Hides Distribution
some text about the top right

####jenks natural breaks
some text about the top right


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

<span class='scroll-section'>
  ####Linear</h1>
  some text about the top right
</span>

<span class='scroll-section'>
  ####Quantize</h1>
  some text about the top right
</span>

<span class='scroll-section'>
  ####Doesn't work great with outliers</h1>
  some text about the top right
</span>

<span class='scroll-section'>
  ####Quantile</h1>
  some text about the top right
</span>

<span class='scroll-section'>
  ####Might distort underlying date</h1>
  some text about the top right
</span>

<span class='scroll-section'>
  ####jenks natural breaks</h1>
  some text about the top right
</span>

<div id='bot-padding'></div>


<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/gscroll-0.1.js" type="text/javascript"></script>
<script src="/javascripts/libs/simple-statistics.js" type="text/javascript"></script>
<script src="/javascripts/posts/negBarTransition/lib.js" type="text/javascript"></script>

<script src="/javascripts/posts/mapColor/script.js" type="text/javascript"></script>
