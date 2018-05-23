---
template: post.html
title: The Ways Out of World Group Stage
date: 2016-10-06
permalink: /worlds-group
shareimg: http://roadtolarissa.com/images/posts/worlds-group.png
---

The second half of League of Legends' World Group Stage starts tonight! Each team will play the other three teams in their group once more. The best two teams in each group advance to the quaterfinals. 

The charts below show how each team could advance. Every group has six games left, which means there are 2^6 = 64 possible outcomes. Outcomes are represented by circles, with a green circle indicating the team advances, yellow that a tiebreaker match will be required and red for elimination. 

C9 and AHQ are best positioned to advance, with only 12 elimination scenarios. Having lost their first three games, G2 and SPY's only chance for advancement is winning all three of their games and subsequent tiebreaker matches. 

<h1 class='group-header' style='margin-top: 60px;'>Group A</h1>
<div class='group' id='group-a'></div>
<h1 class='group-header'>Group B</h1>
<div class='group' id='group-b'></div>
<h1 class='group-header'>Group C</h1>
<div class='group' id='group-c'></div>
<h1 class='group-header'>Group D</h1>
<div class='group' id='group-d'></div>



<span class='source' style='margin-left: 20px'>[code](https://github.com/1wheel/roadtolarissa/blob/master/source/worlds-group/script.js)</span>


<link rel="stylesheet" type="text/css" href="/worlds-group/style.css">

<script src="/worlds-group/d3v4.js"></script>
<script src="/worlds-group/lodash.js"></script>
<script src="/worlds-group/swoopy-drag.js"></script>
<script src="/worlds-group/script.js"></script>