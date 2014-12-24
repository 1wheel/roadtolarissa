---
layout: post
title: "Convex Hulls"
permalink: /convex-hulls
comments: true
categories: 
---

<link rel="stylesheet" type="text/css" href="/javascripts/posts/convexHull/style.css">

A set of points' [convex hull](http://www.cs.uu.nl/geobook/introduction.pdf) is the smallest convex polygon that covers every points. If we picture each point as a peg in a board, we could approximate the convex hull by streching a rubber band around all of the points and then letting it pull itself taut against the outer points.


<div id='naive' style='width: 100%'></div>

```javascript
var n = prices.length
```

[Graham scan](http://en.wikipedia.org/wiki/Graham_scan)
<div id='nlogn' style='width: 100%'></div>


```javascript
var peak = 0;
```

[Jarvis march](http://en.wikipedia.org/wiki/Gift_wrapping_algorithm)
<div id='hn' style='width: 100%'></div>

[Code for animations on github](https://github.com/1wheel/roadtolarissa/tree/master/source/javascripts/posts/convexHull)

[Computational Geometry: Algorithms and Applications, chapter 1](http://www.cs.uu.nl/geobook/)


<script src="/javascripts/libs/d3-3.5.2.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/posts/negBarTransition/lib.js" type="text/javascript"></script>
<script src="/javascripts/posts/convexHull/shared.js" type="text/javascript"></script>
<script src="/javascripts/posts/convexHull/naive.js" type="text/javascript"></script>
<script src="/javascripts/posts/convexHull/nlogn.js" type="text/javascript"></script>
<script src="/javascripts/posts/convexHull/hn.js" type="text/javascript"></script>
