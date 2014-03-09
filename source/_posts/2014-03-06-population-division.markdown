---
layout: post
title: "Population Division"
comments: true
categories: 
permalink: /population-division

---

<div id='joymap'></div>

</br>
*James Cheshire's [Population Lines](http://spatial.ly/2013/09/population-lines/) redone with d3. [Data](http://sedac.ciesin.columbia.edu/data/set/grump-v1-population-count) from NASA. [Fullscreen](/population-division-fullscreen.html).*

Originally I wanted to use the population map as a template for exploring different ways of transitioning data with d3. With different delays and durations, a variety of vertical and horizontal sweeping effects can be created. Unfortunately, it isn't possible to animate hundreds line elements simultaneously smoothly. [Lars Kotthoff's](http://4c.ucc.ie/~larsko/#other) [variable width](https://github.com/mbostock/d3/pull/448) line generator did help cut down on the thousands of elements I start with - at first, the darker lines representing higher populations by segmenting each longitude into low and high lines - and with staggering, only a few dozen at a time are animated in the finished version.    

Aesthetically, I was really drawn towards Cheshire's use of light and dark lines. A simple coloring rule makes China look like the cover of Unknown Pleasures and parts of South America like a map of Mordor. 

Functionally, having a single threshold representing high and low density makes it easy to compare different areas. Outside of the Sahara, for example, most of Africa is more populated than the western interior of the US. If I had more time, I would have made the threshold adjustable so the map could show where/how many people lived at various densities. 

Sticking to the no


<script src="/javascripts/libs/d3.3.13.js" type="text/javascript"></script>
<script src="/javascripts/posts/joymap/line-variable.js" type="text/javascript"></script>
<script src="/javascripts/posts/joymap/drawMap.js" type="text/javascript"></script>

