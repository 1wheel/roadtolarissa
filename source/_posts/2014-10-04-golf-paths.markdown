---
template: post.html
permalink: /golf-paths
title: "Golf Paths"
comments: true
categories: 
---
<link rel="stylesheet" type="text/css" href="/javascripts/posts/golf-wl/style.css">

<div id='golf-wl'></div>
*3,112 amateur matches of golf. Originally by [Todd Schneider](http://toddwschneider.com/posts/how-many-paths-are-possible-in-an-18-hole-round-of-match-play-golf/), redone in d3. [fullscreen](/javascripts/posts/golf-wl/), [code](https://github.com/1wheel/roadtolarissa/blob/master/source/javascripts/posts/golf-wl/script.js) and [data](https://github.com/toddwschneider/matchplay).*

Two weeks ago, [Todd Schneider](http://toddwschneider.com/) posted an excellent analysis and charts counting the number of ways to play through 18 holes of Match Play Golf. Match Play is essentially "Best of 18 Holes" between two players. Instead of comparing stroke totals after finishing the entire match, strokes are counted after each hole. The player with the fewest strokes on a hole scores a point; the winner of the match is the player who's scored the most.

This graph shows different paths that golfers have taken through 3,112 matches. At each hole, the circles' sizes are proportional to the number of matches that had the given difference in scores. Each hole only has three possible outcomes (Player A wins by finishing with fewer strokes, Player B wins by finishing with fewer strokes, both players draw; respectively represented by the green, red, and blue lines). Since only hole/score-difference pairs with wins and losses are shown, so many possible routes through a match can be displayed at once. 

I've always wanted try a "Best of X Series" visualization (mostly because of basketball's "Best of 7" playoff format) but I struggled thinking of something that fit the small sample of basketball playoff series. When I saw Todd's graph and scraped data, I was excited to start working.

I've added a couple of tweaks to his design. Mouse-over interactions surfaced a lot of information. While the tens of thousands of data points (each of the 3,112 matches has information about 18 holes) have been heavily aggregated, there are still hundreds of circles and lines on the screen -- making more nuanced comparisons difficult without actual numbers. Clicking to select also makes it possible to answer questions like "What's the biggest comeback?" or "How long has a match gone without anyone scoring?" in addition to having a fun animation. Exploring a more comprehensive visual querying language would have been interesting but a little too complicated for a quick project like this. 

The data has also been reorientated slightly. Instead of treating USAG's player order as something significant, I've adjusted the graph so the player who scored first is always on top. Clicking on the bottom half of the display will show matches with a lead change, making it easier to select matches that start with a win streak. Hopefully the "First Scorer" labeling throughout the graph is more meaningful than "Player A." I also played with reorienting the data so the eventual winner would always be on top -- this made the biggest comeback much more visible, but also made the graph lopsided (in an interesting way) and the labeling potentially more confusing. I can see how an orientation criteria selector that allows for exploiting the vertical symmetry in different ways would be fun (but I'm not sure what the transition between criteria would look like).

Finally, I shifted the aesthetic from Tron-ish bright geometries on a dark background to something closer to a stylized subway map. Partially to communicate that golf rounds can take different paths through hole/score-difference pairs and partially because subway maps are pretty. 



<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>

<script src="/javascripts/posts/negBarTransition/lib.js" type="text/javascript"></script>

<script src="/javascripts/posts/golf-wl/script.js" type="text/javascript"></script>

<meta property="og:image" content="/images/thumbnails/215-teeth.png" />