---
title: Zoomable Sierpinski Triangle
author: admin
layout: post
permalink: /zoomable-sierpinski-triangle-with-d3-js
categories:
  - Uncategorized
---
<p style="text-align: center;">
  <a href="http://roadtolarissa.com/triangles/"><img class="aligncenter size-large wp-image-168" title="triangle" src="http://www.roadtolarissa.com/wp-content/uploads/2012/12/triangle-1024x815.png" alt="" width="640" height="509" /></a>http://roadtolarissa.com/triangles/
</p>

After finishing up the <a href="http://www.roadtolarissa.com/interactive-visualization-of-white-house-petition-signatures/">petition project</a>, I wanted to use what I learned about d3.js to create something a little more fun. After a few hours<sup>1</sup> of work,  I had this:

```javascript
//triangle centered at (cx, cy) with circumradius r
function addTriangle(cx, cy, r){
  svg.append('polygon')
    .on(mobile ? "click" : "mouseover", function(d){
      addTriangle(  cx,             cy - r/2,       r/2);     
      addTriangle(  cx - r*sin30/2, cy + r*cos30/2, r/2);     
      addTriangle(  cx + r*sin30/2, cy + r*cos30/2, r/2);
      
      d3.select(this).on('mouseover', function(){});
      d3.select(this).on('click', function(){
        addTriangle(cx, cy, r);});
    })
    .attr('fill', 'white')
    .attr('points', (cx)  +','+   (cy)  +' '+ 
                    (cx)  +','+   (cy)  +' '+
                    (cx)  +','+   (cy))
    .transition()
    .duration(600)
    .delay(10)
      .attr('fill', randomColor())
      .attr('points', (cx)  +','+   (cy-r)          +' '+ 
              (cx-r*sin30)  +','+   (cy + r*cos30)  +' '+
              (cx+r*sin30)  +','+   (cy + r*cos30))
}
```

which is currently live at the above link. There are a lot of things I'd like to add &#8211; proper mobile support, more fractal patterns, deeper zooming, and more interesting coloring &#8211; but I've just been clicking and scrolling around the triangles instead. It's incredible to me that such a small snipping of code could create something so visually engaging. Even though the internet already has dozens of Sierpinski Triangles, I haven't found any as interactive and eloquent as this one (which is because of d3.js, not anything I've done) so I feel ok posting it.

1. The most frustrating part of making this: tricking myself into think that I had forgotten everything about geometry. From about 2 AM to 3.30 AM, I was trying to find the vertices of an equilateral triangle given the circumradius and center. This is pretty easy to do with trigonometry (see lines 21-23) , but I kept getting lopsided triangles no matter how I calculated the vertices. I even ended up pulling a geometry textbook off the shelf to check that I was doing the math correctly. Eventually (and I can't remember what lead me to this realization or why it didn't come earlier) it dawned on me that Math.sin(x) thought x was in radians and I was entering degrees.
