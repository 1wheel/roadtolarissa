---
template: post.html
title: regression-discontinuity-covid TKTK
date: 2019-12-218
permalink: /regression-discontinuity
shareimg: x
draft: true
---

<link rel='stylesheet' type='text/css' href='style.css'>

A [paper](https://www.pnas.org/content/early/2020/06/10/2009637117/) published last week arguing for mask usage has been [heavily criticized](https://twitter.com/KateGrabowski/status/1271542361244352514) for, among other things, a tenuous analysis of a [regression discontinuity](https://statmodeling.stat.columbia.edu/2019/06/25/another-regression-discontinuity-disaster-and-what-can-we-learn-from-it/).

<div class='paper-img'>![](https://i.imgur.com/vouYR6Q.png)</div>

With large day-of-week patterns, this regression is extremely sensitive to the exact start and end dates - can you tweak them to make a chart recommending _against_ mask usage?  

<div id='graph'></div>

These small adjustments aren't unreasonable. [Mobility](https://www.google.com/covid19/mobility/) decreased before the lockdown order; the mask order has a [three-day grace period](https://www.nytimes.com/2020/04/15/nyregion/coronavirus-face-masks-andrew-cuomo.html). And there's a variable lag between infections and positive tests that the paper doesn't engage with. With fuzzy boundaries a [local linear regression](https://en.wikipedia.org/wiki/Local_regression) would be more appropriate, but it's not really possible to do [causal inference](https://twitter.com/NoahHaber/status/1271578680922267649) with case counts from just three regions like this paper attempts. 

A growing [body of evidence](https://apps.who.int/iris/rest/bitstreams/1279750/retrieve) supports mask usage, but shoddy statistics published in PNAS (with disconcertingly positive [initial](https://www.sciencemediacentre.org/expert-reaction-to-a-study-looking-at-mandatory-face-masks-and-number-of-covid-19-infections-in-new-york-wuhan-and-italy/) reactions) [poisons the well]((https://twitter.com/jeremyfaust/status/1271572240010809347) for future research. The paper's abstract actually makes this point: "sound science is essential in decision-making for the current and future public health pandemics."

<script src='../worlds-group-2017/d3_.js'></script>
<script src='../shared/chromatic.js'></script>
<script src='../shared/simple-stats.js'></script>
<script src='days.js'></script>
<script src='script.js'></script>

