---
layout: post
title: "Coloring maps with d3"
categories: 
---

<link rel="stylesheet" type="text/css" href="/javascripts/posts/mapColor/style.css">

Transforming numbers into colors is tricky. Unlike positional encodings, which our visual system automatically quantifies (this dot is twice as far from the baseline as the other), we don't have any notion of a particular shade of red being twice as red as another. Since maps typically use position to display geometry, we're stuck using the less effective color channel to communicate numbers(with some exceptions, e.g.: [population lines, bubble map]).

This post describes several [d3 quantitative scales](d3 wiki) - linear, quantize, quantile and threshold - and walks through how they work and the trade offs involved when using them to display colors. 

We start with an array of objects - `places` - representing the filled in areas on the right choropleth. Each has a `value` property equal to a number that we'll encode as a color using the `colorScale` defined in the center code snippet. The scatter plot on the left shows the distribution of values. 

The code in the center uses a couple of helpers: `purples` an array of 5 [colorbrewer](link) purple shades, `_` [library](link) of helper functions, `ss` [simple-statics](link) and `ƒ` a [field accessor](link). 


####Linear
`d3.scale.linear()` returns a function that uses linear interpolation to transform a value in the domain into one in the range. `d3.extent` finds the minimum and maximum numbers the value property takes on, which is then used to set the domain. The range is set to the lightest and darkest shades of purple. Internally, `d3.interpolate` [detects](link to docs) that the range is a color and has `colorScale` return lighter shades of purple when passed lower numbers and darker shades when passed higher numbers. By default the colors are interpolated through an RGB color space; d3 also supports the more [perceptually accuratee](simmons?) [HSL](docs) and LAB(docs). 

Even when using a good color space, linear interpolation isn't great for choropleths. Our perception of an object's darkness [depends](optical illiusion) on how dark its neighbors are, which makes it difficult to compare areas that aren't adjacent. We can avoid this problem by using just a few easily discernible colors that are comparable across the graphic instead of a slightly different color for every value. Using discrete colors comes at a cost of not being able to see small differences between values, but since color conveys those differences poorly the trade off is usually worth it. 

####Quantize
A quantize scale divides values into several discrete buckets, assigning a color to each based on which bucket it falls into. As with the linear scale, the domain is set to the minimum and maximum values. Instead of passing two colors to the range however, an array of colors is passed. The scale function then creates a bucket for each color, shown by the 5 horizontal bars on the left scatter plot. 

The quantize scale divides the range of values evenly so that values in the bottom 5th - those between `minValue` and `minValue + 1/5*(maxValue +minValue)` - are put in the first bucket with the lightest color, while values in the the top 5th are put in the darkest bucket. More formally, values in the nth bucket will be between `minValue + n/purples.length*(maxValue - minValue)` and `minValue + (n + 1)/purples.length*(maxValue - minValue)`.  

####Outliers compressed
While the quantize scale makes intuitive sense and is simple to implement, skewed data or outliers can totally alter the color scale. Here a few very large values stretch out the scale, compressing the rest of the values into one color bucket which results in a map with just two colors. Visual differences between lower values are erased and the two remaining colors don't intrinsically communicate anything about the proportions between the values they represent.

####Quantile
A quantile scale ensures that every color in the range will be used by placing values into color buckets based on their sorted order. Unlike the domains of linear and quantize scales, which only take a `minValue` and a `maxValue`, the quantile scale uses the entire (sorted) population of values. The size of each bucket is calculated using the ratio between the number of values and the number of colors in the domain.

Here, there are 70 values and 5 colors so each bucket has 14 values in it. The first bucket has the 14 lowest values, which are colored the lightest shade of purple; the second contains the 15th through 29th lowest values, and so on. On the scatter plot, the previously horizontal bars are now vertical as the colors of each place is determined by its rank, not value.  

####Distorts Distribution
Because the quantile scale always puts the same number of values into each bucket, every distribution of values will be colored the same way. Here there are 5 distinct groups of values and 5 colors, but some values in different groups share a color - potentially obscuring an interesting pattern.

####Jenks Natural Breaks
The Jenks natural breaks algorithm uses dynamic programing to find groupings of value so that the difference of values within a group is minimized. The breaks for our population of values are calculated and, after light manipulation, passed to a domain of a threshold scale. Each break in the domain is matched with a color in the range; values are colored based on the largest break which they are smaller than. Like the quantize scale, the horizontal rectangles show where the breaks occur. 

While much of data visualization involves encoding data with marks and colors, good data visualization requires careful thinking about what to obscure and _not_ show. All of the above nonlinear scales hide information about the distribution of values within a color shade to compensate for our eyes' inability to accurately to decode color gradients. Grouping values in different ways can also mask or highlight different aspects of the data. Since there isn't a perfect method of showing every data set, picking the right aspect of the data to not show (instead of allowing your defaults to pick for you) requires experimenting and examining the data in multiple ways.

####More reading

Robert Simons 'TALK NAME' and  'OPENVISCONF VID' on using color.

Georgo ashet has 'choropleth spefic' advice and 'visual demonstration' of the HSL color space

With a more achemic take, Carlos Sasdfas has a demo showing how some of these map coloring issues fit into his algebraic vis framework. 

Chapter 5, "Marks and Channels", of Tamara Munzner's "Visualization Analysis & Design" introduces the accemic literature on different ways of encoding information and lays the groundwork for thinking carefully about these issues.  
 
`code for animations on this page on github`

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
    .domain(places.map(ƒ('value')))
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
  <h1>Linear</h1>
</span>

<span class='scroll-section'>
  <h1>Quantize</h1>
</span>

<span class='scroll-section'>
  <h1>Doesn't work great with outliers</h1>
</span>

<span class='scroll-section'>
  <h1>Quantile</h1>
</span>

<span class='scroll-section'>
  <h1>Might distort underlying date</h1>
</span>

<span class='scroll-section'>
  <h1>jenks natural breaks</h1>
</span>

<div id='bot-padding'></div>


<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/gscroll-0.1.js" type="text/javascript"></script>
<script src="/javascripts/libs/simple-statistics.js" type="text/javascript"></script>
<script src="/javascripts/posts/negBarTransition/lib.js" type="text/javascript"></script>

<script src="/javascripts/posts/mapColor/script.js" type="text/javascript"></script>
