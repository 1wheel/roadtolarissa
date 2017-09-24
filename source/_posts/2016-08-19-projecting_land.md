---
template: post.html
title: Projecting Land
permalink: /projecting-land
shareimg: http://roadtolarissa.com/images/posts/projecting-land.png
---

<div id='map-container'></div>

Andy Woodruff's [Land by latitude and longitude](http://andywoodruff.com/blog/land-by-latitude-and-longitude-or-a-pile-of-continents/) with some interactivity bolted on. Andy sensibly used different equal area projections to show the actual amount of land at each latitude and longitude. 

Here, you can adjust the rotation speed and projection to make pretty blobs of color. 


<span class='source'>[code](https://github.com/1wheel/roadtolarissa/blob/master/source/projecting-land/script.js)</span>


<link rel="stylesheet" type="text/css" href="/projecting-land/style.css">

<script src="/javascripts/libs/d3v4+jetpack.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-geo-projection.js" type="text/javascript"></script>
<script src="/javascripts/libs/topojson.js" type="text/javascript"></script>

<script src="/projecting-land/script.js"></script>
