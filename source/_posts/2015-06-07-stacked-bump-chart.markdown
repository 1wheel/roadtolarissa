---
layout: post
title: "Stacked Bump Charts"
comments: true
categories: 
plink: bump-chart
---

Alicia Parlapiano published an excellent [series of stacked bump charts](http://www.nytimes.com/interactive/2015/06/04/us/politics/stacking-up-the-presidential-fields.html) showing the history of presidential primary campaigns last Thursday. 

[img]

Her graphic does a great job showing both the size of the field and the duration of the primary campaigns, while previous pieces by the [Economist](http://www.economist.com/blogs/graphicdetail/2015/04/us-presidential-candidate-announcements) and [Bloomberg](http://www.bloomberg.com/politics/articles/2014-11-25/when-do-presidential-candidates-announce) focused on how the duration of campaigns has changed over time.

I've thinking about using a similar stacked bump chart to improve my (still very rough) [visualization](http://bl.ocks.org/1wheel/cbd9053de9bb39231924) of a line intersection algorithm. To get a feel for how to make one, I've recreated Alicia's chart with Basketball Reference's list of [most accomplished players](http://www.basketball-reference.com/leaders/hof_prob.html). The rest of the this post will show how to make your own bump chart with D3. 

First, the data needs to be in the right format. Since we're just showing when each player enters and exits the league (and ignoring complications like Jordan's MLG career), lets start with an array of objects with exactly that info:

```javascript
var players = [
  {name: 'Kareem',    start: 1970,  stop: 1989},
  {name: 'Jordan',    start: 1985,  stop: 2003},
  {name: 'Russell',   start: 1957,  stop: 1969},
  {name: 'Wilt',      start: 1959,  stop: 1969},
  {name: 'Kobe',      start: 1997,  stop: 2015},
  {name: 'Duncan',    start: 1998,  stop: 2015},
	...
]
```

Now, lets try drawing the chart

var c = d3.conventions({height: 120, parentSel: d3.select('#bump')})

c.x.domain([1950, 2015])
c.y.domain([0, 10])



<div id='lines'></div>

Words, words words

<div id='bump'></div>




<link rel="stylesheet" type="text/css" href="/javascripts/posts/stackedBump/style.css">


<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-jetpack-v1.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-starterkit-v1.js" type="text/javascript"></script>


<script src="/javascripts/posts/stackedBump/script.js"></script>
