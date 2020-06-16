---
template: post.html
title: You Regress It: How Effective Are Face Masks? 
title: You Regress It: Have Masks Prevented 66,000 Infections in New York City? 
date: 2019-12-218
permalink: /regression-discontinuity
shareimg: https://i.imgur.com/FL2zUAs.png
draft: true
---

<link rel='stylesheet' type='text/css' href='style.css'>

A [paper](https://www.pnas.org/content/early/2020/06/10/2009637117/) published last week claiming mask usage prevented 66,000 infections in NYC has received [widespread media coverage](https://www.google.com/search?biw=1296&bih=1121&tbm=nws&sxsrf=ALeKk01Enaskz9I8eHTE29TOyN_z3ZhA-g%3A1592334789691&ei=xRnpXtzfKfCRwbkP1JWukAg&q=zhang+pnas+mask&oq=zhang+pnas+mask&gs_l=psy-ab.3...5208.5208.0.5833.1.1.0.0.0.0.72.72.1.1.0....0...1c.1.64.psy-ab..0.0.0....0.MZW-_TMFfIU). It has also been [heavily criticized](https://twitter.com/KateGrabowski/status/1271542361244352514) for, among other things, a tenuous analysis of a [regression discontinuity](https://statmodeling.stat.columbia.edu/2019/06/25/another-regression-discontinuity-disaster-and-what-can-we-learn-from-it/).

Fitting lines to the number of new cases each day in New York City <span class='underline'>before</span> and <span class='underline'>after</span> face masks were mandatory, the authors attribute the steeper decline in cases to face masks: new cases were falling by 39 per day before the order and 106 after, so face masks probably sped up the rate of decrease by about 67 cases a day.

<div class='paper-img'>![](https://i.imgur.com/YUF5FPU.png)</div>

There are some bold claims along the way ("After April 3, the only difference in the regulatory measures between NYC and the United States lies in face covering on April 17 in NYC"), but let's take a closer look at mechanics of this regression. 

With large day-of-week patterns, the regression is sensitive to the exact start and end dates — can you tweak them to make a chart recommending _against_ mask usage?  

<div id='graph'></div>

These small adjustments aren't unreasonable. [Mobility](https://www.google.com/covid19/mobility/) decreased before the lockdown order; the mask order had a [three-day grace period](https://www.nytimes.com/2020/04/15/nyregion/coronavirus-face-masks-andrew-cuomo.html). And there's a variable lag between infections and positive tests that the paper doesn't engage with. Add a <span class='lag'>seven day lag</span> to account for incubation, testing and reporting to the <span class='lag'>paper's dates</span> and the regression makes it look like there's a strong case for banning masks!  

With fuzzy boundaries a [local regression](https://en.wikipedia.org/wiki/Local_regression) might be more appropriate. But it's not really possible to do [causal inference](https://twitter.com/NoahHaber/status/1271578680922267649) with case counts from just three regions like this paper tries to do, especially if you're fitting straight lines to exponential infection curves.  

A [growing body](https://www.preprints.org/manuscript/202004.0203/v2/download) of [evidence](https://apps.who.int/iris/rest/bitstreams/1279750/retrieve) supports mask usage. Shoddy statistics published in PNAS (with disconcertingly positive [initial expert reactions](https://www.sciencemediacentre.org/expert-reaction-to-a-study-looking-at-mandatory-face-masks-and-number-of-covid-19-infections-in-new-york-wuhan-and-italy/) and [continued public popularity](https://twitter.com/search?q=https%3A%2F%2Fwww.pnas.org%2Fcontent%2Fearly%2F2020%2F06%2F10%2F2009637117&src=typed_query&f=live)) will make it harder to [communicate](https://twitter.com/jeremyfaust/status/1271572240010809347) the results of future research, especially after masks have become politicized and recommendations have shifted. The paper's abstract puts it well: "sound science is essential in decision-making for the current and future public health pandemics."

<div id='notes'>
<p>[NYC case data](https://github.com/nychealth/coronavirus-data/blob/master/tests.csv) // [chart code](https://github.com/1wheel/roadtolarissa/blob/master/source/regression-discontinuity/script.js)

<p>The chart from the paper has been lightly edited for clarity. 

<p>The top line 66,000 number comes from a similarly suspect regression on cumulative cases. The discontinuous regression was more interesting to illustrate and the results are in the same ballpark.


</div>

<script src='../worlds-group-2017/d3_.js'></script>
<script src='../shared/chromatic.js'></script>
<script src='../worlds-group-2017/swoopy-drag.js'></script>
<script src='../shared/simple-stats.js'></script>

<script src='days.js'></script>
<script src='script.js'></script>


<svg height=0>
  <marker id="arrowhead" viewBox="-10 -10 20 20" refX="0" refY="0" markerWidth="20" markerHeight="20" stroke-width="1" orient="auto"><polyline stroke-linejoin="bevel" points="-6.75,-6.75 0,0 -6.75,6.75"></polyline></marker>
</svg>
