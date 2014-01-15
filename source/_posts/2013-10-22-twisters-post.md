---
title: Twisters
author: admin
layout: post
permalink: /twisters-post
categories:
  - Uncategorized
---
<p style="text-align: center;">
  <a href="http://roadtolarissa.com/twisters/"><img class=" wp-image-287 aligncenter" title="Tornado Map" alt="" src="http://www.roadtolarissa.com/wp-content/uploads/2013/10/nados-1024x988.png" width="640" height="617" /></a>
  <p  style="text-align: center;">
    <em><a href="http://roadtolarissa.com/twisters/">Interactive tornado map</a></em>
  </p>
</p>

<p style="text-align: left;">
  This is a remake of a <a href="http://uxblog.idvsolutions.com/2013/06/tornado-travel-map.html">map</a> John Nelson made over the summer:
</p>

<p style="text-align: center;">
  <a href="http://uxblog.idvsolutions.com/2013/06/tornado-travel-map.html"><img class="aligncenter" title="Another Tornado Map" alt="" src="http://farm8.staticflickr.com/7373/9027126483_1f55a634ab_z.jpg" width="640" height="443" /></a>
</p>

<p style="text-align: left;">
  Seeing Nelson&#8217;s map for the first time, I was struck at how well its combination of two intuitive ideas &#8211; transforming starting/ending locations into direction and displaying those directions with a polar histogram &#8211; created an instantly understandable visualization. It does a wonderful job of clearly communicating an idea to a wide audience. Sharing what I&#8217;ve learned from looking at this map with a sentence: &#8220;Most tornadoes in the US travel Northeast and typically occur in the East&#8221; isn&#8217;t nearly as impactful (a week after hearing that I probably wouldn&#8217;t remember the direction) or informative (what do &#8216;most&#8217; and &#8216;typically&#8217; mean?) as looking at the map.
</p>

<p style="text-align: left;">
  I&#8217;ve tried to emulate the aesthetic of Nelson&#8217;s map while attaching one more simple idea &#8211; <a href="http://square.github.io/crossfilter/">crossfilter </a>- to it. Some things I&#8217;m happy with:
</p>

*   **Click to Zoom  
    [<img class=" wp-image-288 aligncenter" alt="ok" src="http://www.roadtolarissa.com/wp-content/uploads/2013/10/ok.png" width="461" height="235" />][1]</br>**d3&#8242;s built in [zoom ][2]is nice, but it is tricky to use on devices without a scroll wheel. Putting an [onclick zoom event][3] on each state avoids this difficulty and has the huge add bonus of playing very nicely with crossfilter.  The state to state transitions are my favorite part of this map. Getting multistate tornadoes to behave correctly took a little bit of [data wrangling][4] and tinkering with crossfilter; I really like the result.
*   **Brushable Arc  
    [<img class="size-full wp-image-289 aligncenter" alt="arc" src="http://www.roadtolarissa.com/wp-content/uploads/2013/10/arc.png" width="198" height="173" />][5]**</br>Not the most useful or impressive thing in the world, but I don&#8217;t think anyone has done this before in d3 and after another [struggle ][6]with trigonometry, I&#8217;m trilled that it actually works. I&#8217;d like to make it more accessible  - it might work well in [dc.js][7] - but the code needs a lot of polishing first.

Some &#8216;Todos&#8217; without a checkmark:

*   **Responsive Design  
    **Most screens will have some empty horizontal space and not enough vertical space to view the entire display at once.  Resizable charts with D3 aren&#8217;t actually that difficult to create &#8211; if the drawing of the chart is correctly [decoupled][8] from its other functions you essentially get that behavior for free by redrawing after window.onresize - but (attractively) laying out 9 differently sized charts is.
*   **Adjustable Color  
    **Setting the attributes of the lines so they matched the actual tornadoes was fun &#8211; direction, start, stop, width, and length clearly apply to both &#8211; but color, more than anything else, is the most visible property of the lines. Nelson colors according to direction to hammer home the point of his chart. I went with [wind speed][9] since it seemed more meteorological and less morbid than deaths; I would have liked to avoid imposing that decision on the viewer. I&#8217;m hoping the graphs on this blog share the sense of playfulness I have exploring data and adjustable colors would have done a good job of that.
*   **Tracking Dollar Damage[<img class="size-full wp-image-291 aligncenter" alt="arc" src="http://www.roadtolarissa.com/wp-content/uploads/2013/10/arc1.png" width="598" height="129" />  
    ][10]**eh&#8230; Probably too many charts on the page already.
*   **Mouse Over Effects  
    **Unlike the my last three projects, there wasn&#8217;t an easy way to find images of the focused items. In lieu of a tooltip, it would have been cool to highlight each bar that the moused over tornado was a member of and possibly display text on the bar showing the corresponding exact value. Currently the only way to find out more about a given tornado on the map is to fiddle with the bars, which is pretty dorky (or with d3.select($0).data(), which is pretty obscure).

But! I haven&#8217;t posted anything for four months and I&#8217;m looking forward to starting something new and applying some of what I&#8217;ve learned [working full time][11] with d3 over the the last two months.

 [1]: http://www.roadtolarissa.com/wp-content/uploads/2013/10/ok.png
 [2]: https://github.com/mbostock/d3/wiki/Zoom-Behavior
 [3]: http://bl.ocks.org/mbostock/4699541
 [4]: https://github.com/1wheel/tornado-tuners/blob/master/matchStates.py
 [5]: http://www.roadtolarissa.com/wp-content/uploads/2013/10/arc.png
 [6]: http://www.roadtolarissa.com/zoomable-sierpinski-triangle-with-d3-js/
 [7]: http://nickqizhu.github.io/dc.js/
 [8]: http://bost.ocks.org/mike/chart/
 [9]: http://en.wikipedia.org/wiki/Fujita_scale
 [10]: http://www.roadtolarissa.com/wp-content/uploads/2013/10/arc1.png
 [11]: https://www.quovo.com/us/no/index.php
