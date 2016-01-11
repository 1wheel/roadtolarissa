---
template: post.html
title: "Minute by Minute Point Differentials of 2015 NBA Games"
comments: true
permalink: /nba-minutes
categories: 
shareimg: http://roadtolarissa.com/images/posts/nba-minutes.png
---

<div id='graph'></div>

Since seeing Allison McCann and Mike Beuoy's ["Every NBA Team’s Chance Of Winning In Every Minute Across Every Game
"](https://fivethirtyeight.com/features/every-nba-teams-chance-of-winning-in-every-minute-across-every-game/) last year, I've been trying to think of ways of seeing an entire season of basketball at once. Beyond each team's average chance of winning at each minute, I was curious about what their distribution of chances looked like over time. 

To squeeze everything in, I had to make a number of trade offs. Instead of being able to encode point differentials with vertical position like I did with the [Golden State's win streak chart](http://roadtolarissa.com/gsw-streak/), I used color for point difference in order to use vertical position for distribution. Since there have been more score differences (GSW was 52 ahead of MEM at one point) than can be usefully encoded as 
[unique colors, ](http://roadtolarissa.com/blog/2015/01/04/coloring-maps-with-d3/) I bucketed the score differences into 7    

http://fivethirtyeight.com/features/dan-feyer-american-crossword-puzzle-tournament/

Data from stats.nba.com. Scraping and chart [code](https://github.com/1wheel/roadtolarissa/tree/master/source/javascripts/posts/nba-minutes).


<div class='tooltip'></div>



<link rel="stylesheet" type="text/css" href="/javascripts/posts/nba-minutes/style.css">


<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-jetpack-v1.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-starterkit-v0.js" type="text/javascript"></script>

<script src="/javascripts/posts/nba-minutes/script.js"></script>
