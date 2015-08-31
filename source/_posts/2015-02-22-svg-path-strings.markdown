---
template: post.html
title: "SVG Path Strings"
comments: true
permalink: path-strings
categories: 
---

<link rel="stylesheet" type="text/css" href="/javascripts/posts/svgPaths/style.css">

SVG comes with several shape elements - `rect`, `ellipse`, `line`, `polygon` - that can create basic forms. To create a map, streamgraph or other more complicated shapes, `path` elements are used. Instead of specifying the size and position of a path element with attributes like `height`, `radius` or `x` as we do with the basic shapes, the geometry of the path element is determined by a single `d` attribute.

This `d` attribute processes a path string that describing the movement of a pen across a sheet of paper. [D3](https://github.com/mbostock/d3/wiki/SVG-Shapes#path-data-generators) has powerful path generators that are simple to use; this post describes how the path strings are interpreted so you can create your own.

## Straight Line

Each path string starts with an `M` moveto command that moves the pen to a new coordinate defined by a pair of numbers after the `M`. For example, `M 100 200` moves the pen to a start position 100 pixels left and 200 pixels down from the origin (typically the upper left corner of the SVG). 

The `L` lineto command moves the pen from its current position to a new coordinate, tracing a straight line along the way. `M 100,200 L 400,300` traces a line from 100,200 to 400,300.

Multiple `L` and `M` commands can be combined to create complex shapes:

<div id='moveto'></div>

By default, SVG shapes are colored black with no stroke. Here the path has been styled with a black stroke and gray fill. 


## Cubic Bézier

[Béziers](https://www.jasondavies.com/animated-bezier/) connect two points with a smooth curve. The `C` curveto command takes three coordinates: a control point for the current position, a control point for the next position and the new position itself. `M 670,60 C 110,50 250,440 530,415` starts at 680,60 and moves to 530,415 along a path determined by the control points:

<div id='bez'></div>

The smooth curveto `S` command allows for easy chaining of béziers. It takes a new control coordinate and a new position and draws a bézier using the previous current position and its control point. `L` and `M` commands can also follow `C` and `S` commands, so a single path can be both straight and curved.


## Elliptical Arc

While béziers are quite flexible, they aren't actually able to draw a [perfect circle](http://spencermortensen.com/articles/bezier-circle/). The arc `A` command draws an ellipse segment from the current position to a new position. The first three parameters define the x radius, the y radius and the rotation of the ellipse. The next two parameters are boolean flags that indicate if the larger or smaller ellipse segment should be used and if the left or right ellipse should be used (unused segments denoted with a dashed line below). The final two parameters are the x and y values of the new position. 

<div id='arc'></div>

If the start and end points are moved so far apart that they can't be connected by an ellipse with the given radius and rotation, a new minimal radius is calculated and used instead. 


## Other useful commands

Each of the above commands has a lower case version that uses relative position from the current point instead of distance from the origin. `M 100,200 l 40,80` moves to 100,200 and draws a diagonal 40 pixels to the right and 80 pixels down to 140,280. This has the same effect as `M 100,200 L 140,280`, but the code to generate the former can be more convenient. 

The closepath `Z` command draws a straight line from the current position to the start of the path, creating a closed shape.   


## More reading
  
The W3C [documentation on paths](http://www.w3.org/TR/SVG/paths.html#Introduction) is terse but covers many cases and implementation details I've glossed over. 

While starting to feel a bit dated (particularly on animation), [SVG Primer](http://www.w3.org/Graphics/SVG/IG/resources/svgprimer.html#SVG_Basics) gently covers most of the SVG specification.

Scotty Murray's [book](http://chimera.labs.oreilly.com/books/1230000000345/ch03.html#_simple_shapes) does a great job of explaining how SVG and D3 fit together. 

[Code for animations on github](https://github.com/1wheel/roadtolarissa/blob/master/source/javascripts/posts/svgPaths/script.js) - [Inkscape](https://inkscape.org/en/) and [Illustrator](http://www.adobe.com/products/illustrator.html) have much more robust SVG creation tools than what I've put together this weekend. 

<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-jetpack.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-hoverboard.js" type="text/javascript"></script>


<script src="/javascripts/posts/svgPaths/script.js"></script>