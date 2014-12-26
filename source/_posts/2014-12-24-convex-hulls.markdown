---
layout: post
title: "Convex Hulls"
permalink: /convex-hulls
comments: true
categories: 
---

<link rel="stylesheet" type="text/css" href="/javascripts/posts/convexHull/style.css">

A set of points' [convex hull](http://www.cs.uu.nl/geobook/introduction.pdf) is the smallest convex polygon that covers every point. If we picture each point as a peg in a board, we could approximate the convex hull by stretching a rubber band around all of the points and then letting it pull itself taut against the outer ones.

Unfortunately, computers don't typically come with rubber bands and peg boards so we'll need a different approach to programmatically find a set of points' convex hull.

Since each edge of the convex hull lies between two points from our set, we can find the convex hull by iterating over each pair of points and checking to see if it lies on the hull. To check, the number of points to the left and right (blue and red) of the line formed by the pair are counted. If all the points aren't on the same side, that pair can't be an edge of a [convex](http://mathworld.wolfram.com/Convex.html) shape. 

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

While simple, this approach is quite slow. With `n` points, there are  `n(n-1)/2` pairs of points. Checking if every point is to the left of every pair has a asymptotic `O(n³)` runtime.

For a slightly trickier implementation, [Graham's scan](http://en.wikipedia.org/wiki/Graham_scan) has a running time of `n log n`. Starting from the leftmost point and moving right, the top of the convex hull for the left points (those in the black area) is computed. Every time a new point is added, points from the previous convex hull are removed right to left until there are no angles greater than 180°.

<div id='nlogn' style='width: 100%'></div>

```javascript
//array of points on top of the convex hull
var topPoints = []

//order points by x cord
_.sortBy(points, 'x').forEach(function(p){
  //right to left, trim topPoints until
  //   the last two topPoints and the next point p form an angle less than 180°
  //or topPoints only contains the left most point
  while(topPoints.length > 1
  && isConcave(p, topPoints[topPoints.length - 2], _.last(topPoints)_)){
    topPoints.pop()
  }

  topPoints.push(p)
})
```
While this approach initially looks like it could have a worst case runtime of `O(n²)` - for every point we could end up iterating over the whole `topPoints` array - each point can only be removed the `topPoints` array once. Asymptotically, most of the execution time will be spent sorting the array, making the algorithm `n log n`.

Depending on the number of points on the convex hull, this runtime can be  further improved.
[Jarvis' march](http://en.wikipedia.org/wiki/Gift_wrapping_algorithm) moves along the convex hull by checking all of the points to find the largest angle formed by the two last points on the hull and one of the other points. Below, larger angles are purple and small angle are green. 

<div id='hn' style='width: 100%'></div>
```javascript
//array of points on hull - initialize with leftmost point. 
var hull = [leftMostPoint], a, b

//keep adding points to hull until it makes a circle
while (hull[0] != _.last(hull)){
  //get last two points along hull
  a = hull[hull.length - 2]
  a = a ? a : origin //if hull only has one point, use the origin
  b = _.last(hull)
  //find the point that makes the largest angle with a and b
  var max = {angle: 0, p: null}
  points.forEach(function(p){
    var angle = calcAngle(a, b, p)
    if (angle > max.angle) max = {angle: angle, p: p}
  })
  hull.push(max.p)
}
```
With `h` points on the hull and `n` total points, each point will have its angle calculated `n*h` times. If there are less than `log n` points on the hull, Jarvis' march will be faster than Graham's scan.  

[Code for animations on github](https://github.com/1wheel/roadtolarissa/tree/master/source/javascripts/posts/convexHull)

[Computational Geometry: Algorithms and Applications, chapter 1](http://www.cs.uu.nl/geobook/)

[Chen's algorithmm](http://en.wikipedia.org/wiki/Chan%27s_algorithm) combines the Jarvis' march and Graham's scan with a runtime of `n log h`.  


<script src="/javascripts/libs/d3-3.5.2.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/posts/negBarTransition/lib.js" type="text/javascript"></script>
<script src="/javascripts/posts/convexHull/shared.js" type="text/javascript"></script>
<script src="/javascripts/posts/convexHull/naive.js" type="text/javascript"></script>
<script src="/javascripts/posts/convexHull/nlogn.js" type="text/javascript"></script>
<script src="/javascripts/posts/convexHull/hn.js" type="text/javascript"></script>
