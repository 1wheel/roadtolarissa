---
title: sdfsdf
author: admin
layout: post
permalink: /ddddd-post.html
categories:
  - Uncategorized
---
ss
lkj;lkj;lkj;lkj;lkj;
<div id='gallery'></div>

<script src="{{ root_url }}/javascripts/libs/d3.3.13.js" type="text/javascript"></script>
<script>
function f(str){ return function(obj){ return obj[str]; } }

var projects = [
  {img: 'nba-draft',    url: 'www.roadtolarissa.com/nba-draft'},

]

d3.select('#gallery').selectAll('img')
    .data(projects).enter()
  .append('a')
    .attr('href', f('url'))
  .append('img')
    .attr('src', '/images/thumbnails/' + f('img') + '.png')
</script>


