---
template: post.html
title: What Should You Do When Stock Prices Drop? 
permalink: /sell-strat
draft: true
shareimg: http://roadtolarissa.com/images/posts/tktk.png
---


<link rel="stylesheet" type="text/css" href="style.css">



Buying high and selling low sound foolish, but it might work better than you think. 

Over the past 40 years, selling after the NASDAQ dropped more than 8% in two weeks and buying after the NASDAQ gained more than 8% would have yielded better returns than staying continuously invested. 

The white line on the below chart shows the NASDAQ's actual returns since 1971—it's 70 times bigger. Buying and selling after 8% swings would have done even better, with a hundred and fifty fold return. That investing strategy shown with green and reds lines indicating periods of holding and cashing out respectively. 

Mouse over the grid to explore buy and sell strategies with different thresholds. Not all of them work!

<div id='double-chart'>
	<div id='graph'></div>
	<div id='grid'> </div>
</div>

<p id='decade-note'>While some of these strategies have yielded good long term returns, all of them had <i>decades</i> where they under performed the market.

<div id='decade-sm'></div>

Try adjusting the two week, <span id='slider-span'>10</span> day window:

<div id='slider-chart'></div>

These strategies are quite sensitive to small adjustments of the time window. This suggests that their returns are highly dependent on past patterns which might not repeat in the future! Most of the outsized returns happen by exiting the market when the dot com bubble pops and the financial crisis happens. 

Following momentum works if the market generally does what it previously did; if large daily swings are the result of an underlying change in value that takes place slowly then this is the way to go. 

If, on the other hand, you think stocks act more like a random walk, then buying high and selling low is the exact opposite of what you should do. If we're not entering a sustained decline, which happened twice in the 2000s, these strategies will probably do worse than just staying in market like they did in the 1990s and 2010s. 

This ignores capital gains but also doesn't parks cash in bonds. Seems like too much work for me.


<script src='../worlds-group-2017/d3_.js'></script>
<script src='../worlds-group-2017/swoopy-drag.js'></script>
<script src='draw-line.js'></script>
<script src='_script.js'></script>
