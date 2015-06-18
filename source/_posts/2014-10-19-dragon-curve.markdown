---
template: post.html
permalink: /dragon-curve
title: "Dragon Curve"
categories: 
---

<link rel="stylesheet" type="text/css" href="/javascripts/posts/dragonCurve/style.css">

<div id='dragon-curve'></div>
*[Dragon curve](http://en.wikipedia.org/wiki/Dragon_curve). Mouse over to iterate; click to <a id='step'>iterate all</a> and <a id='reset'>reset</a>; scroll to zoom.*

Another fractal with d3. Since the lines aren't space filling after a finite number of iterations, I've added squares to capture mouse events and colored them to hint at the direction the line will turn. This fractal also looks quite messy if different parts of it exist at different iterations. To handle this, squares to create the next level only appear once all the visible squares on the current level have been touched. 

Using canvas instead of SVG would be have allowed this to handle many more points before slowing the page down. I'm not sure how to do that and preserve the  simplicity at the heart of the current [code](https://github.com/1wheel/roadtolarissa/blob/master/source/javascripts/posts/dragonCurve/script.js): 

```javascript
function drawLine(a, b, θ){
  svg.append('path').attr('d', ['M', a, 'L', b].join(''))
      .on('mouseover', function(){
        //on mouseover, draw two new lines
        var ℓ = length(a, b)/(2*Math.sqrt(2))

        var θ1 = (θ - 45) % 360
        var b1 = extendPoint(a, ℓ, θ1)
        drawLine(a, b1, θ1)

        var θ2 = (θ - 135) % 360
        var b2 = extendPoint(b, ℓ, θ2)
        drawLine(b, b2, θ2)

        function extendPoint(a, ℓ, θ){
          return [a[0] + ℓ*Math.sin(θ*π/180), a[1] + ℓ*Math.cos(θ*π/180)]
        }
      })
}
```



<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>

<script src="/javascripts/posts/negBarTransition/lib.js" type="text/javascript"></script>

<script src="/javascripts/posts/dragonCurve/script.js" type="text/javascript"></script>

<meta property="og:image" content="/images/thumbnails/215-teeth.png" />