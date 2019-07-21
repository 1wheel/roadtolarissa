---
template: post.html
title: Faster Rollovers for Canvas
date: 2019-03-21
permalink: /scan-sorted
shareimg: https://i.imgur.com/cfjlTI9.png
draft: true
---

Points drawn to canvas don't have `mouseover` events, so to add a tooltip to a chart with lots of points we have to calculate the closest point to the mouse. 

Voroni is recommend, but the initialization time is slow - tk ms with 500k points. I usally just iterate over every point in the data array. 


<div id='graph' class='full-width'>
</div>


The code for this is a l

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

Not too bad, scanning every element is so simple I'll probably stick with it unless bumping into performance problems.

```js
canvasSel
  .call(d3.attachTooltip)
  .on('mousemove', function(){
    var [px, py] = d3.mouse(this)

    var minPoint = _.minBy(data, d => {
      var dx = d.px - px
      var dy = d.py - py

      return dx*dx + dy*dy
    })

    // update tooltip text
})
````



<link rel="stylesheet" type="text/css" href="style.css">
<script src='../worlds-group-2017/d3_.js'></script>
<script src='script.js'></script>
