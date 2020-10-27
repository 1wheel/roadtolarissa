---
template: post.html
title: Correlations Between States in Presidential Election Forecasts
title: Election Forecast Correlations
date: 2020-10-25
permalink: /forecast-correlation
shareimg: https://i.imgur.com/MqUH9IT.png
---

<link rel='stylesheet' type='text/css' href='style.css'>


[538](https://projects.fivethirtyeight.com/2020-election-forecast/) and the [Economist](https://projects.economist.com/us-2020-forecast/president) have both released detailed data from their election forecasts, listing how each state votes in 40,000 simulations of the presidential election. To understand some unusual scenarios from the 538 model, like every state [voting for Biden but New Jersey](https://twitter.com/gelliottmorris/status/1300480869082292225), Andrew Gelman [examined the correlation](https://statmodeling.stat.columbia.edu/2020/10/24/reverse-engineering-the-problematic-tail-behavior-of-the-fivethirtyeight-presidential-election-forecast/) in Trump vote share between pairs of several states. 

I was curious what the whole universe of pairwise correlations looked like; you can click on a grid cell below to examine voting patterns in two states in more detail along with the electoral maps from individual simulation scenarios. 

<div class='graph'></div>

Mousing around the edges of the scatter plot pulls out more unusual scenarios, like Trump losing everywhere but `CA-HI-VT`. 

On the correlation matrices, it appears that both models have identified similar groups of states. A scatter plot shows this directly: 

<div class='cor-scatter'></div>

Outside of the `CA-DC-VT-WA` v. `LA-MS-ND-KY` cluster, where the 538 correlation dips below 0, the models are mostly aligned. Glancing over the outliers, it looks the Economist might not have an equivalent to 538's <a href='https://fivethirtyeight.com/features/how-fivethirtyeights-2020-presidential-forecast-works-and-whats-different-because-of-covid-19/'>regional regression</a> that groups states in the same geographic region together; the Economist has `HI` at .2 correlation with `WA` & `OR` and while 538 has them around .7.

Stepping back from the funky correlation charts, comparing vote share state by state clearly shows a bigger difference between the models: the <span class='u-eco'>Economist model</span> considers really surprising outcomes, like Biden decisively winning `UT`, less likely than the <span class='u-538'>538 model</span>.

<div class='state-sm'></div>

I haven't followed the extensive discussion around election modeling closely enough to have a strong opinion on what all of this means, but it does look like the 538 model is allowing for the [possibility](https://twitter.com/Nate_Cohn/status/1320043524771991560) of a broad [realignment in politics](https://twitter.com/NateSilver538/status/1300825856072454145)--something you'd want to incorporate when modeling 2024 today, but not plausible for an election next week with [sixty million ballots](https://www.nytimes.com/interactive/2020/us/elections/absentee-ballot-early-voting.html) already cast.


<div id='notes'>
<p>Only 5,000 scenarios are shown on the scatter plots; the scenarios are a snapshot from 2020-10-25 and not updated (looking at the correlations over time might be interesting though!). The rendered electoral college scenarios ignore the possibility of `NE` or `ME` spliting their votes. 

<p>The correlations matrix orders states by clustering on 538's correlations. Sorting using the Economist correlations [splits up](https://i.imgur.com/JH9FC8I.png) the negative 538 correlations.

<p><a href='https://github.com/1wheel/roadtolarissa/tree/master/source/forecast-correlation'>chart code</a>

</div> 

<script src='hcluster.js'></script>
<script src='../worlds-group-2017/d3_.js'></script>
<script src='../shared/chromatic.js'></script>
<script src='../shared/simple-stats.js'></script>
<script src='../javascripts/libs/topojson.js'></script>

<script src='script.js'></script>

