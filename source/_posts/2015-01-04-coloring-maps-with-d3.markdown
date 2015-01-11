---
layout: post
title: "Coloring maps with d3"
categories: 
---

<link rel="stylesheet" type="text/css" href="/javascripts/posts/mapColor/style.css">

Transforming numbers into colors is tricky. Unlike positional encodings, which our visual system automatically quantifies (this dot is twice as far from the baseline as the other), we don't have any notion of a particular shade of red being twice as red as another. Since maps typically use position to display geometry, we're stuck using the less effective color channel to communicate numbers (with [some](http://roadtolarissa.com/population-division-fullscreen.html) [exceptions](bubbles)).

This post describes several [d3 quantitative scales](https://github.com/mbostock/d3/wiki/Quantitative-Scales) - linear, quantize, quantile and threshold - and walks through how they work and the trade offs involved when using them to display colors. 

We start with an array of objects - `places` - representing the filled in areas on the right choropleth. Each has a `value` property equal to a number that we'll encode as a color using the `colorScale` defined in the center code snippet. The scatter plot on the left shows the distribution of values. 

The code in the center uses a few libraries: `purples` an array of 5 [colorbrewer](http://bl.ocks.org/mbostock/5577023) purple shades, `_` [library](https://lodash.com/) of helper functions, `ss` [simple-statics](http://www.macwright.org/simple-statistics/), `ƒ` a [field accessor](http://roadtolarissa.com/blog/2014/06/23/even-fewer-lamdas-with-d3/), and `d3` [itself](http://d3js.org). 

<!-- ####Linear
`d3.scale.linear()` returns a function that uses linear interpolation to transform a value in the domain into one in the range. `d3.extent` finds the minimum and maximum numbers the value property takes on, which is then used to set the domain. The range is set to the lightest and darkest shades of purple. Internally, `d3.interpolate` [detects](https://github.com/mbostock/d3/wiki/Transitions#d3_interpolate) that the range is a color and has `colorScale` return lighter shades of purple when passed lower numbers and darker shades when passed higher numbers. By default the colors are interpolated through an RGB color space; d3 also [supports](https://github.com/mbostock/d3/wiki/Colors#hsl) other color spaces with better [perceptually propertiess](http://www.research.ibm.com/people/l/lloydt/color/color.HTM). 

Even when using a good color space, linear interpolation isn't great for choropleths. Our perception of an object's darkness [depends](http://en.wikipedia.org/wiki/Checker_shadow_illusion) on how dark its neighbors are, which makes it difficult to compare areas that aren't adjacent. We can avoid this problem by using just a few easily discernible colors that are comparable across the graphic instead of a slightly different color for every value. Using discrete colors comes at a cost of not being able to see small differences between values, but since color conveys those differences poorly the trade off is usually worth it. 

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
The [Jenks natural breaks algorithm](tom link) uses dynamic programing to find groupings of value so that the difference of values within a group is minimized. The breaks for our population of values are calculated and, after light manipulation, passed to a domain of a threshold scale. Each break in the domain is matched with a color in the range; values are colored based on the largest break which they are smaller than. Like the quantize scale, the horizontal rectangles show where the breaks occur. 

While much of data visualization involves encoding data with marks and colors, good data visualization requires careful thinking about what to obscure and _not_ show. All of the above nonlinear scales hide information about the distribution of values within a color shade to compensate for our eyes' inability to accurately to decode color gradients. Grouping values in different ways can also mask or highlight different aspects of the data. Since there isn't a perfect method of showing every data set, picking the right aspect of the data to not show (instead of allowing your defaults to pick for you) requires experimenting and examining the data in multiple ways.

####More reading

Robert Simmons' "Subleties of Color" [articles](http://earthobservatory.nasa.gov/blogs/elegantfigures/2013/08/05/subtleties-of-color-part-1-of-6/) and [talk](https://www.youtube.com/watch?v=DjJr8D4Bxjw) is a great introduction to difficulties of using color. 

Gregor Aisch's [critique](https://vis4.net/blog/posts/mastering-multi-hued-color-scales/) of a Guardian choropleth shows how color scale decisions (or lack thereof) can change the story a map tells (his [posts](https://vis4.net/blog/posts/mastering-multi-hued-color-scales/) on chroma.js are also excellent).

From a more academic perspective, Carlos Scheidegger has a [demo](http://algebraicvis.net/2014/11/11/a_primer.html) showing how some of these map coloring issues fit into his algebraic vis framework. 

Chapter 5, "Marks and Channels", of Tamara Munzner's ["Visualization Analysis & Design"](http://www.crcpress.com/product/isbn/9781466508910) introduces the accemic literature on different ways of encoding information and lays the groundwork for thinking carefully about these issues.  

[code for these animations on github](https://github.com/1wheel/roadtolarissa/tree/master/source/javascripts/posts/mapColor)
 -->
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

<div class='scroll-section'>
  <h4>Linear</h4>

  <p><code>d3.scale.linear()</code> returns a function that uses linear interpolation to transform a value in the domain into one in the range. <code>d3.extent</code> finds the minimum and maximum numbers the value property takes on, which is then used to set the domain. The range is set to the lightest and darkest shades of purple. Internally, <code>d3.interpolate</code> <a href="https://github.com/mbostock/d3/wiki/Transitions#d3_interpolate">detects</a> that the range is a color and has <code>colorScale</code> return lighter shades of purple when passed lower numbers and darker shades when passed higher numbers. By default the colors are interpolated through an RGB color space; d3 also <a href="https://github.com/mbostock/d3/wiki/Colors#hsl">supports</a> other color spaces with better <a href="http://www.research.ibm.com/people/l/lloydt/color/color.HTM">perceptually propertiess</a>.</p>

  <p>Even when using a good color space, linear interpolation isn&rsquo;t great for choropleths. Our perception of an object&rsquo;s darkness <a href="http://en.wikipedia.org/wiki/Checker_shadow_illusion">depends</a> on how dark its neighbors are, which makes it difficult to compare areas that aren&rsquo;t adjacent. We can avoid this problem by using just a few easily discernible colors that are comparable across the graphic instead of a slightly different color for every value. Using discrete colors comes at a cost of not being able to see small differences between values, but since color conveys those differences poorly the trade off is usually worth it.</p>
</div>

<div class='scroll-section'>
  <h4>Quantize</h4>

  <p>A quantize scale divides values into several discrete buckets, assigning a color to each based on which bucket it falls into. As with the linear scale, the domain is set to the minimum and maximum values. Instead of passing two colors to the range however, an array of colors is passed. The scale function then creates a bucket for each color, shown by the 5 horizontal bars on the left scatter plot.</p>

  <p>The quantize scale divides the range of values evenly so that values in the bottom 5th &ndash; those between <code>minValue</code> and <code>minValue + 1/5*(maxValue +minValue)</code> &ndash; are put in the first bucket with the lightest color, while values in the the top 5th are put in the darkest bucket. More formally, values in the nth bucket will be between <code>minValue + n/purples.length*(maxValue - minValue)</code> and <code>minValue + (n + 1)/purples.length*(maxValue - minValue)</code>.</p>
</div>

<div class='scroll-section'>
  <h4>Outliers compressed</h4>

  <p>While the quantize scale makes intuitive sense and is simple to implement, skewed data or outliers can totally alter the color scale. Here a few very large values stretch out the scale, compressing the rest of the values into one color bucket which results in a map with just two colors. Visual differences between lower values are erased and the two remaining colors don&rsquo;t intrinsically communicate anything about the proportions between the values they represent.</p>
</div>

<div class='scroll-section'>
  <h4>Quantile</h4>

  <p>A quantile scale ensures that every color in the range will be used by placing values into color buckets based on their sorted order. Unlike the domains of linear and quantize scales, which only take a <code>minValue</code> and a <code>maxValue</code>, the quantile scale uses the entire (sorted) population of values. The size of each bucket is calculated using the ratio between the number of values and the number of colors in the domain.</p>

  <p>Here, there are 70 values and 5 colors so each bucket has 14 values in it. The first bucket has the 14 lowest values, which are colored the lightest shade of purple; the second contains the 15th through 29th lowest values, and so on. On the scatter plot, the previously horizontal bars are now vertical as the colors of each place is determined by its rank, not value.</p>
</div>

<div class='scroll-section'>
  <h4>Distorts Distribution</h4>

  <p>Because the quantile scale always puts the same number of values into each bucket, every distribution of values will be colored the same way. Here there are 5 distinct groups of values and 5 colors, but some values in different groups share a color &ndash; potentially obscuring an interesting pattern.</p>
</div>

<div class='scroll-section'>
  <h4>Jenks Natural Breaks</h4>

  <p>The <a href="tom%20link">Jenks natural breaks algorithm</a> uses dynamic programing to find groupings of value so that the difference of values within a group is minimized. The breaks for our population of values are calculated and, after light manipulation, passed to a domain of a threshold scale. Each break in the domain is matched with a color in the range; values are colored based on the largest break which they are smaller than. Like the quantize scale, the horizontal rectangles show where the breaks occur.</p>

  <p>While much of data visualization involves encoding data with marks and colors, good data visualization requires careful thinking about what to obscure and <em>not</em> show. All of the above nonlinear scales hide information about the distribution of values within a color shade to compensate for our eyes&#8217; inability to accurately to decode color gradients. Grouping values in different ways can also mask or highlight different aspects of the data. Since there isn&rsquo;t a perfect method of showing every data set, picking the right aspect of the data to not show (instead of allowing your defaults to pick for you) requires experimenting and examining the data in multiple ways.</p>

  <h4>More reading</h4>

  <p>Robert Simmons&#8217; &ldquo;Subleties of Color&rdquo; <a href="http://earthobservatory.nasa.gov/blogs/elegantfigures/2013/08/05/subtleties-of-color-part-1-of-6/">articles</a> and <a href="https://www.youtube.com/watch?v=DjJr8D4Bxjw">talk</a> is a great introduction to difficulties of using color.</p>

  <p>Gregor Aisch&rsquo;s <a href="https://vis4.net/blog/posts/mastering-multi-hued-color-scales/">critique</a> of a Guardian choropleth shows how color scale decisions (or lack thereof) can change the story a map tells (his <a href="https://vis4.net/blog/posts/mastering-multi-hued-color-scales/">posts</a> on chroma.js are also excellent).</p>

  <p>From a more academic perspective, Carlos Scheidegger has a <a href="http://algebraicvis.net/2014/11/11/a_primer.html">demo</a> showing how some of these map coloring issues fit into his algebraic vis framework.</p>

  <p>Chapter 5, &ldquo;Marks and Channels&rdquo;, of Tamara Munzner&rsquo;s <a href="http://www.crcpress.com/product/isbn/9781466508910">&ldquo;Visualization Analysis &amp; Design&rdquo;</a> introduces the accemic literature on different ways of encoding information and lays the groundwork for thinking carefully about these issues.</p>

  <p><a href="https://github.com/1wheel/roadtolarissa/tree/master/source/javascripts/posts/mapColor">code for these animations on github</a></p>
</div>

<div id='bot-padding'></div>


<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/gscroll-0.1.js" type="text/javascript"></script>
<script src="/javascripts/libs/simple-statistics.js" type="text/javascript"></script>
<script src="/javascripts/posts/negBarTransition/lib.js" type="text/javascript"></script>

<script src="/javascripts/posts/mapColor/script.js" type="text/javascript"></script>
