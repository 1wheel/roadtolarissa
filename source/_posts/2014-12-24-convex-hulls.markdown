---
layout: post
title: "Convex Hulls"
permalink: /convex-hulls
comments: true
categories: 
---

<link rel="stylesheet" type="text/css" href="/javascripts/posts/convexHull/style.css">

A set of points' [convex hull](http://www.cs.uu.nl/geobook/introduction.pdf) is the smallest convex polygon that covers every points. If we picture each point as a peg in a board, we could approximate the convex hull by streching a rubber band around all of the points and then letting it pull itself taut against the outer points.

Unforentently, computures don't typically come with rubber bands and peg boards so to we'll need a different approach to programtically find a set of points convex hull.

Since each edge of the convex hull lies between two points from our set of points, we can find the convex hull by iterating over each each pair of points and checking to see if it lies on the hull. Checking is relativly simple - if some of the points are left of the line connecting the pair and some other are right, the pair can't possiblely be an edge of a [convex](http://mathworld.wolfram.com/Convex.html) shape. 

<div id='naive' style='width: 100%'></div>

```javascript
//construct array with all the pairs of points
var pairs = []
for (var i = 0; i < points.length; i++){
    for (var i = i + 1; j < points.length; j++){
        pairs.push({a:points[i], b:points[j]})
    }
}

//remove pairs of points that aren't on the convex hull
var convexHullEdges = pairs.filter(function(pair){
    //count how many points are to the left of each pair of points
    var leftPoints = points.reduce(function(count point){
        return count + isLeftofPair(pair, point)
    }, 0)

    //only keep pairs with all left or all right points
    return leftPoints == 0 || leftPoints == points.length - 2
})

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
