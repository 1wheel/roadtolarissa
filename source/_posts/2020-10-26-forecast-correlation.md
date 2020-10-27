---
template: post.html
title: Correlations Between States in Presidential Election Forecasts
title: Forecast Correlation Comparisons
date: 2020-10-25
permalink: /forecast-correlation
shareimg: tktk
draft: true
---

<link rel='stylesheet' type='text/css' href='style.css'>


538 and the Economist have both released detailed data from their election forecasts, showing how each state would vote in 40,000 simulations of the election. To understand some unusual scenarios from the 538 model, like every state voting for Biden but New Jersey, Andrew Gelman [examined the correlation](https://statmodeling.stat.columbia.edu/2020/10/24/reverse-engineering-the-problematic-tail-behavior-of-the-fivethirtyeight-presidential-election-forecast/) in Trump vote share between pairs of several states. 

I was curious what the whole universe of pairwise correlations looked like; you can click on a grid cell to examine voting patterns in two states in more detail along with the electoral maps from individual forecasts. 

<div class='graph'></div>

538 and the Economist mostly agree on what pairs of states are most correlated: 

<div class='cor-scatter'></div>

I haven't followed the extensive model discussion closely enough to have a strong opinion on what all of this means, but it does look like the 538 model is allowing for the [possibility](https://twitter.com/Nate_Cohn/status/1320043524771991560) of a broad [realignment in politics](https://twitter.com/NateSilver538/status/1300825856072454145)--something you'd want to incorporate when modeling 2024 today, but not plausible for an election next week. 

Comparing vote share state by state clearly shows the Economist model thinks really surprising outcomes, like Trump winning Washington, are much less likely:

<div class='state-sm'></div>

<div id='notes'>
<p>The correlations matrix orders states by clustering on 538's correlations. The Economist matrix would look smoother if it was used to determine the sort order instead. 

<p>Only 10,000 scenarios are shown on the scatter plots; the scenarios are a snapshot from 2020-10-25 and not updated. The rendered electoral college scenarios ignore the possibility of Nebraska or Maine spiting their votes. 

<p><a href='https://github.com/1wheel/roadtolarissa/tree/master/source/forecast-correlation'>chart code</a>

</div> 

<script src='hcluster.js'></script>
<script src='../worlds-group-2017/d3_.js'></script>
<script src='../shared/chromatic.js'></script>
<script src='../shared/simple-stats.js'></script>
<script src='../javascripts/libs/topojson.js'></script>

<script src='script.js'></script>

