---
template: post.html
title: Population Division
date: 2014-03-06
permalink: /population-division
---

<div id='joymap'></div>

</br>
*James Cheshire's [Population Lines](http://spatial.ly/2013/09/population-lines/) redone with d3. [Data](http://sedac.ciesin.columbia.edu/data/set/grump-v1-population-count) from NASA. [Fullscreen](/population-division-fullscreen.html) and [code](https://github.com/1wheel/roadtolarissa/blob/master/source/javascripts/posts/joymap/drawMap.js).*

Originally I wanted to use the population map as a template for exploring different ways of transitioning data with d3. With delays and durations, a variety of vertical and horizontal sweeping effects can be created. Unfortunately, it isn't possible to simultaneously animate hundreds of line elements smoothly. [Lars Kotthoff's](http://4c.ucc.ie/~larsko/#other) [variable width](https://github.com/mbostock/d3/pull/448) line generator did help cut down on the thousands of elements I started with - at first, the darker lines representing higher populations were formed by separating each longitude into a series of low and high segments - and with staggering, only a few dozen at a time are animated in the finished version.    

Aesthetically, I was really drawn towards Cheshire's use of light and dark lines. A simple coloring rule makes China look like the cover of [Unknown Pleasures](http://www.youtube.com/watch?v=wVvoQIdD80U) and parts of South America like a map of Mordor. 

Functionally, having two colors representing high and low density makes it easy to compare different areas. Outside of the Sahara, for example, most of Africa is more populated than the western interior of the US. If I had more time, I would have made the density dividing point adjustable so the map could show where/how many people lived at various densities. 

Using a polylinear scale to convert population to line height, I created another threshold effect:

```javascript
	  populationToHeight = d3.scale.linear()
	      .domain([0, 1, d3.max(d3.merge(longitudes))])
	      .range([0, -1, -180])
```

Segments with a population of 0 have a height of 0. Segments with a population of 1 or more have a height between 1 and 180, with each additional person adding significantly less than 1 pixel of height. Since essentially all land is inhabited, even sparsely populated coasts get a nice bevel differentiating them from the ocean. Greenland's ice sheet is also clearly shown.

I'm not totally satisfied with the tooltip. Making the size of the highlighted area adjustable would make insights like the popular ['half of humanity lives in this circle'](http://www.washingtonpost.com/blogs/worldviews/wp/2013/05/07/map-more-than-half-of-humanity-lives-within-this-circle/) map discoverable. I also wish the size of the bars corresponded to the absolute number of people highlighted to make comparison between areas easier. Using a log scale common to all regions made at a glance comparisons between regions easier but obscured change over time. Plotting percentage change as a line on top of log scaled bars would achieve both goals; however that would require multiple axes which would significantly detract from the simplicity of the rest of the display. 


<script src="/javascripts/libs/d3.3.13.js" type="text/javascript"></script>
<script src="/javascripts/posts/joymap/line-variable.js" type="text/javascript"></script>
<script src="/javascripts/posts/joymap/drawMap.js" type="text/javascript"></script>

<style>
#joymap-tooltip {
  position: absolute;
  width: 150px;
  padding: 8px;
  font: 12px sans-serif;
  background: rgba(255, 255, 255, .3);
  border: solid 1px gold;
  /*border-radius: 8px;*/
  pointer-events: none;
  opacity: 0;
  top: 0;
  left: 0;
}

#joymap-tooltip-title{
  text-align: center;
   font-weight: bold;
   font-size: 105%;
    text-shadow:
      -1px -1px 0 white,
      0px -1px 0 white,
      1px -1px 0 white,
      -1px 1px 0 white,
      0px 1px 0 white,
      1px 1px 0 white;
 }
</style>


<meta property="og:image" content="/images/thumbnails/joymap.png" />
