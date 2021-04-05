---
template: post.html
title: Faster Tooltips for Canvas
date: 2019-03-21
permalink: /scan-sorted
shareimg: https://i.imgur.com/cfjlTI9.png
---

Canvas and WebGL can efficiently draw hundreds of thousands of points. Because these points aren’t DOM nodes, they don’t have `click` or `mouseover` events; adding interaction or tooltips to them requires calculating the closest point to the mouse. 

[Voronoi diagrams](https://bl.ocks.org/mbostock/8033015) have been recommended, but their initialization time is slow: ~1,500 ms with a million points. With several zoom levels to compute, that locked up the browser for this [tax calculator](https://www.nytimes.com/interactive/2017/12/17/upshot/tax-calculator.html) that I worked on. Instead, we just looped over every point in the data array and found the one closest to the mouse.


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

There's no initialization time and checking the distance of a million points takes about [15 ms](https://bl.ocks.org/1wheel/da6c526602c05a5a77390620a6be3040)—good enough for a tooltip.

If you’re doing additional compution, like running an animation or calculating some value, something faster would be handy to avoid dropping frames. Precomputing the voronoi diagram could avoid intensive client side computation, but I’m not sure how you'd compactly serialize the data structure (update: Vladimir Agafonkin’s [flatbrush](https://github.com/mourner/flatbush) uses an array buffer for the index. It also handles rectangles, indexing a million in less than 300 ms!). 

Robert Monfera [suggested](https://twitter.com/monfera/status/1150784849206267906) a simple precomputation: sort the data along the x-axis.  

<div id='graph' class='full-width'></div>

With sorted data, we can find the point with the x-position closest to the mouse’s x-position in `O(log n)` time using a binary search. Keeping track of the <span class='purple'>nearest</span> point, we can keep looking at points to the <span class='yellow'>left</span> and <span class='yellow'>right</span> until we’re futher along the x-axis than the distance to the nearest point.

This is way [faster](https://bl.ocks.org/1wheel/77c660a764ab55a496c4e37623be9069)! On a square, uniform grid scanning in two directions takes `O(sqrt n)` comparisons; quite an improvement over checking every point `O(n)`, but not nearly as fast as a voroni’s `O(1)` or a quadtree’s `O(log n)` lookups. 


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

Still more complicated than simply checking every point though, so I'll probably stick with that unless I’m really trying to push performance the envelope or working with more complex [polygons](https://bl.ocks.org/veltman/f539d97e922b918d47e2b2d1a8bcd2dd).



<link rel="stylesheet" type="text/css" href="style.css">
<script src='../worlds-group-2017/d3_.js'></script>

<script src='https://unpkg.com/d3-delaunay@5.1.2/dist/d3-delaunay.js'></script>
<script src='script.js'></script>
