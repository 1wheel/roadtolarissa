---
template: post.html
title: Faster Rollovers for Canvas
date: 2019-03-21
permalink: /scan-sorted
shareimg: https://i.imgur.com/cfjlTI9.png
draft: true
---

Points drawn to canvas don't have `mouseover` events, so to add a tooltip to a chart with lots of points we have to calculate the closest point to the mouse. 

Using a [voronoi diagram](https://bl.ocks.org/mbostock/8033015) to calculate has been recommend, but the initialization time is slow: ~1,500 ms with a million points. Too slow for the tax calculator I worked with multiple zoom levels. Instead, we just looped over every point in the data array and found the one closest to mouse.


```js
canvasSel
  .call(d3.attachTooltip)
  .on('mousemove', function(){
    var [px, py] = d3.mouse(this)

    var minPoint = d3.least(data, d => {
      var dx = d.px - px
      var dy = d.py - py

      return dx*dx + dy*dy
    })

    // update tooltip text
})
```

With a million points, there's no initialization time and scanning takes about about ~15 ms—fast enough to avoid dropping many frames if we're only displaying a tooltip on mouseover. 

If you're doing more  


<div id='graph' class='full-width'>
</div>

On a square, uniform grid scanning takes 


The code for this isn't too complicated: 

```js
var bisect = d3.bisector(d => d.px)

canvasSel
  .call(d3.attachTooltip)
  .on('mousemove', function(){
    var [px, py] = d3.mouse(this)
    var index = bisect.left(data, px)

    var minPoint = null
    var minDist = Infinity
    var lxDist = 0
    var rxDist = 0
    var i = 0
    while (lxDist < minDist && rxDist < minDist){
      lxDist = checkPoint(data[index - i])
      rxDist = checkPoint(data[index + i])
      i++
    }

    function checkPoint(d){
      if (!d) return Infinity

      var dx = d.px - px
      var dy = d.py - py
      var dist = Math.sqrt(dx*dx + dy*dy)

      if (dist < minDist){
        minDist = dist
        minPoint = d
      }

      return Math.abs(px - d.px)
    }

    // update tooltip text
  })
```

But still more complicated than 

, scanning every element is so simple I'll probably stick with it unless bumping into performance problems.



<link rel="stylesheet" type="text/css" href="style.css">
<script src='../worlds-group-2017/d3_.js'></script>

<script src='https://unpkg.com/d3-delaunay@5.1.2/dist/d3-delaunay.js'></script>
<script src='script.js'></script>
