---
layout: post
permalink: /golf-paths
title: "Golf Paths"
comments: true
categories: 
---
<link rel="stylesheet" type="text/css" href="/javascripts/posts/golf-wl/style.css">

<div id='golf-wl'></div>
*3,112 Amateur matches of golf. [Fullscreen](/javascripts/posts/golf-wl/), [Data](http://sedac.ciesin.columbia.edu/data/set/grump-v1-population-count) and [code](https://github.com/1wheel/roadtolarissa/blob/master/source/javascripts/posts/golf-wl/script.js).*

Last Friday, Todd Schneider posted excellent analysis and charts counting the number of ways to play through 18 holes of Match Play Golf. Match play is essentially "Best of 18 Holes" played between two players. Instead of comparing stroke totals after finishing the entire match, strokes are counted after each hole. The player with the fewest strokes on a hole scores and the winner of the match is the player who has scored the most by winning the most holes.

This graph shows different paths golfers have taken through matches. Since each hole only has three possible outcomes and we mostly only care about the score at each hole, many possible matches can be collapsed into one discrete display. More about the graph blah blah blah

I've always wanted try a "Best of X Series" visualization, mostly because of basketball's "Best of 7" playoff format but I struggle thinking of something that fit the small sample size. When I saw Todd had a cool graph and had pulled data i was excited to make something

I've added a couple of tweaks to his design. Mouse over interactions surfaced a lot of information. While the tens of thousands of data points loaded (each of the 3000 matches has information about 18 holes) has been heavily aggregated, there are still hundreds of circles and lines on the screen so making more nuanced comparisons is difficult without actual numbers. Clicking to select also makes it possible to answer questions like "what's the biggest comeback?" or "how long has a match gone without anyone scoring" in addition to have fun animation. Exploring a more comprehensive sort of visual querying language capable of many more questions would have been interesting but a little too complicated for a quick project like this. 

The data has also been reorientated slightly. Instead of treating USAG's player order as something significant, I've adjusted the graph so player who scored first is always on top. Clicking on the bottom half of the display will show matches with a lead change, it is easier select matches that start with a win streak and hopefully the "First Scorer" labeling throughout the graph is more meaningful than "Player A". I also tried reorienting so the eventual winner would always be on top - this made the biggest comeback much more visible, but also made the graph lopsided (in an interesting way) and the labeling potentially more confusing. I could see a orientation criteria selector that allowed for exploiting the vertical symmetry in different ways being fun (not sure what the transition between criteria would look like).

Finally, I shifted the aesthetic from tronish bright geometries on dark background to something closer to a stylized subway map. Partially to communicate that golf rounds can take different paths through hole/score pairs and partially because subway maps are pretty. 



<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>

<script src="/javascripts/posts/negBarTransition/lib.js" type="text/javascript"></script>

<script src="/javascripts/posts/golf-wl/script.js" type="text/javascript"></script>

<meta property="og:image" content="/images/thumbnails/215-teeth.png" />