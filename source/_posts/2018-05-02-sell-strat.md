---
template: post.html
title: Buying High and Selling Low Can Beat the Market
title2: What Should You Do When Stock Prices Drop? 
title3: Beat the Market by Selling Low and Buying High 
date: 2018-05-02
permalink: /sell-strat
shareimg: https://i.imgur.com/5z400QK.png
---

<link rel="stylesheet" type="text/css" href="style.css">

What should you do when the stock market drops? Selling low and buying high sounds foolish, but it might work better than you think. 

Over the past 40 years, selling after the NASDAQ fell more than 8% in two weeks and buying after the NASDAQ climbed more than 8% in two weeks would have yielded better returns than staying continuously invested.

Last month the NASDAQ dropped more than 8% in two weeks. Should you liquidate your stocks? Or is this 8% in two weeks strategy overfit and cherry-picked?

Mouse over the grid to explore buy and sell strategies with different thresholds. Not all of them are successful.

<div id='double-chart'>
	<div id='graph'></div>
	<div id='grid'> </div>
</div>

<p id='decade-note'>While some of these strategies have yielded good long term returns, all of them had <i>decades</i> where they underperformed the market.

<div id='decade-sm'></div>

Try adjusting the two week, <span id='slider-span'>10</span> day window: <span id='slider-chart'></span>

These strategies are quite sensitive to small adjustments of the time window, suggesting that they're dependent on past patterns which might not repeat in the future. Most of their index beating returns happened by exiting the market as the dotcom bubble popped and the financial crisis started. 

Following momentum works if the market generally does what it previously did; if large daily swings are the result of an underlying change in value that takes place slowly then this is the way to go. 

If, on the other hand, you think stocks act more like a random walk, then buying high and selling low is the exact opposite of what you should do. If we're not entering a sustained decline, which happened twice in the 2000s, these strategies will probably do worse than just staying in the market like they did in the 1990s and 2010s. 

Regardless of how you think of markets, be aware that this model ignores the tax penalty from short term capital gains. And instead of investing in T-bonds while not in stocks, it sits on yield-less cash. 

For me, committing to regularly monitoring the market, optimally managing all these transactions and filling out a longer Form 8949 sounds like entirely too much work so I'll be holding for now.

<script src='../worlds-group-2017/d3_.js'></script>
<script src='../worlds-group-2017/swoopy-drag.js'></script>
<script src='draw-line.js'></script>
<script src='_script.js'></script>
