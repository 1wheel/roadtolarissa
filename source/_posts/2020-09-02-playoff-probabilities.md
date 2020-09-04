---
template: post.html
title: 2020 NBA Playoff Probabilities
date: 2020-09-03
permalink: /playoff-probabilities
shareimg: tktk
draft: true
---

<link rel='stylesheet' type='text/css' href='style.css'>

<div class='full-width'>
  <div id='graph'></div>
</div>

<div class='full-width'>
  <div id='timeline'></div>
</div>

How have NBA playoff predictions shifted since the tournament started? Showing each team's championship chances over time would be more straight forward: 

<div class='full-width'>
  <div id='finals-wp'></div>
</div>

But that misses all the stories of the individual series - Orlando suddenly having a shot after stealing their first game, Utah almost making a come back and Brooklyn getting crushed. 

Rachael Dottle's [How France And Croatia Made It To The World Cup Final](https://fivethirtyeight.com/features/how-france-and-croatia-made-it-to-the-world-cup-final-in-one-chart/) does an even better of bringing the drama of a tournament into a chart by incorporating in game win probability. You can see individual goals!

<div id='notes'>
<p>[Chart Code](https://github.com/1wheel/roadtolarissa/blob/master/source/playoff-probabilities/script.js) // [538 2019-20 NBA Predictions](https://projects.fivethirtyeight.com/2020-nba-predictions)

<!-- <p>This is a foot note -->
</div>

<script src='../worlds-group-2017/d3_.js'></script>
<script src='../shared/chromatic.js'></script>
<script src='../worlds-group-2017/swoopy-drag.js'></script>
<script src='../shared/simple-stats.js'></script>

<script src='script.js'></script>



<svg height=0>
  <marker id="arrowhead" viewBox="-10 -10 20 20" refX="0" refY="0" markerWidth="20" markerHeight="20" stroke-width="1" orient="auto"><polyline stroke-linejoin="bevel" points="-6.75,-6.75 0,0 -6.75,6.75"></polyline></marker>
</svg>
