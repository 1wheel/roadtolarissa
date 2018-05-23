---
template: post.html
title: Minute by Minute Point Differentials of 2015 NBA Games
date: 2016-01-10
permalink: /nba-minutes
shareimg: http://roadtolarissa.com/images/posts/nba-minutes.png
---

<div id='graph'></div>

Since seeing Allison McCann and Mike Beuoy's [Every NBA Team’s Chance Of Winning In Every Minute Across Every Game](https://fivethirtyeight.com/features/every-nba-teams-chance-of-winning-in-every-minute-across-every-game/) last year, I've been trying to think of ways of seeing an entire season of basketball at once. Beyond each team's average chance of winning over time, I was curious about what their distribution of chances looked like. 

To squeeze distribution in, I had to make a couple of trade offs. Instead of being able to encode point differentials with vertical position like I did with my [Golden State's win streak chart](http://roadtolarissa.com/gsw-streak/), I used color for point difference and saved vertical position for distribution. Since there have been more score differences (GSW was beating by MEM 52 at one point) than can be usefully encoded as 
[unique colors](http://roadtolarissa.com/blog/2015/01/04/coloring-maps-with-d3/), I bucketed the score differences into 7 colors. It isn't possible to see exact differences anymore without mousing over, but the charts still show when teams are ahead or behind by a lot or a little. To help convey that a collection of games are being shown, I also bucketed time into one minute segments. This hides second by second changes, but allows each game to be represented by a series of dots.
 
Showing an entire season - not just the first half shown here - might require using something other than dots to avoid a long vertical scroll. Stacked area charts, which also wouldn't require bucketing time, might work better? I'd also be curious to see how these charts would change if they showed winning percentage instead of the score differentials I had on hand. 

I'm not sure where I first saw the key trick of this chart - showing a  changing distribution by stacking colored objects. [538](http://fivethirtyeight.com/features/dan-feyer-american-crossword-puzzle-tournament/) and [WSJ](http://graphics.wsj.com/job-market-tracker/) have both used the technique recently, but I wouldn't be surprised if there are much earlier examples. 


<span class='source'>Data from stats.nba.com. Scraping and chart [code](https://github.com/1wheel/roadtolarissa/tree/master/source/javascripts/posts/nba-minutes).</span>


<link rel="stylesheet" type="text/css" href="/javascripts/posts/nba-minutes/style.css">


<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-jetpack-v1.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-starterkit-v0.js" type="text/javascript"></script>

<script src="/javascripts/posts/nba-minutes/script.js"></script>
