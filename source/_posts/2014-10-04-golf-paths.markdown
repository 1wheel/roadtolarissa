---
layout: post
permalink: /golf-paths
title: "Golf Paths"
comments: true
categories: 
---
<link rel="stylesheet" type="text/css" href="/javascripts/posts/golf-wl/style.css">

<div id='golf-wl'></div>
*3,112 Amateur matches of golf. [Fullscreen](/javascripts/posts/golf-wl/), [Data](http://sedac.ciesin.columbia.edu/data/set/grump-v1-population-count) and [code](https://github.com/1wheel/roadtolarissa/blob/master/source/javascripts/posts/golf-wl/script.js).*

Last Friday, Todd Schneider posted excellent analysis and charts counting the number of ways to play through 18 holes of Match Play Golf. Match play is essentially "Best of 18 Holes" played between two players. Instead of comparing stroke totals after finishing the entire match, strokes are counted after each hole. The winner of that hole is the player with the fewest strokes on it and the winner of the match is the player who has won the most holes.

This graph (based heavily on Todd's) shows different paths golfers have taken through matches. Since each hole only has three possible outcomes and each 

I've added a couple of tweaks to Todd's display. Mouse over interactions surfaced a lot of information. While the tens of thousands of data points loaded (each of the 3000 matches has information about 18 holes) has been heavily aggregated, there are still hundreds of circles and lines on the screen so making more nuanced comparisons is difficult without actual numbers. Clicking to select also makes it possible to answer questions like "what's the biggest comeback?" or "how long has a match gone without anyone scoring" in addition to have fun animation. Exploring a more comprehensive sort of visual querying language capable of many more questions would have been interesting but a little too complicated for a quick project like this. 

The data has also been reorientated slightly. Instead of treating USAG's player order as something meaningful, I've adjusted the graph the player who scored first is always on top. Clicking on the bottom half of the display will show matches with a lead change, it is easier select matches w

<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>

<script src="/javascripts/posts/negBarTransition/lib.js" type="text/javascript"></script>

<script src="/javascripts/posts/golf-wl/script.js" type="text/javascript"></script>

<meta property="og:image" content="/images/thumbnails/215-teeth.png" />