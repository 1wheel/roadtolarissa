---
layout: post
title: "SVG Path Strings"
comments: true
categories: 
---

<link rel="stylesheet" type="text/css" href="/javascripts/posts/svgPaths/style.css">

SVG comes with a several shape elements - `rect`, `ellipse`, `line`, `polygon` - that can create basic forms. To create a map, steamgraph or other more complicated shapes, `path` elements are used. Instead of specifying the size and position of a path element with attributes like `height`, `radius` or `x` as we do with the basic shapes, the geometry of the path element is determined by a single `d` attribute.

This `d` attribute processes a path string describing the movement of pen across a sheet of paper. [D3](https://github.com/mbostock/d3/wiki/SVG-Shapes#path-data-generators) has powerful path generators that are simple to use; this post describes how the path strings are interpreted and how to create your own.


###moveto and lineto

Each path string starts with an `M` moveto command which moves the pen to a new coordinate defined by a pair of numbers after the `M`. For example, `M 100 200` moves the pen to a start position 100 pixels left and 200 pixels down from the origin (typically the upper left corner of the SVG). 

The `L` lineto command moves the pen from its current position to a new coordinate, tracing a straight line alone the way. `M 100,200 L 400,300` traces a line from 100,200 to 400,300.

`L` and `M` commands can be chained together to create complex shapes:

<div id='moveto'></div>

By default, SVG shapes are colored black with no stroke. Here the path has been styled with a black stroke and gray fill. 


###cubic bézier

[Béziers](https://www.jasondavies.com/animated-bezier/) connect two points with a smooth, flexible curve. The `C` cubic bézier command takes three coordinates 

<div id='bez'></div>

###elliptical arc

<div id='arc'></div>


<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-jetpack.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-hoverboard.js" type="text/javascript"></script>


<script src="/javascripts/posts/svgPaths/script.js"></script>