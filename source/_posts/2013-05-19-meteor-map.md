---
title: Meteor Map
template: post.html
date: 2013-05-19
permalink: /meteor-map
---
[<img class=" wp-image-234 alignnone" alt="meteor map" src="http://www.roadtolarissa.com/wp-content/uploads/2013/05/meteormap.png" width="620" height="421" />][1]

*An [interactive map][1] made for [visualizing.org's Meteorites contest][2].*

I started from &#8216;scratch' with a blank [map of the world generated][3] by d3. Each meteor in the contest data set had a latitude and longitude, so I used those coordinates to plot a small circle on the map to represent each impact. After coloring the circles orange, the map looked almost like the one above.

Most of the ~30 hours I've spent working on this map were spent adding some of these small improvements:

*   <strong style="line-height: 16px;">Circle size and color proportional to meteor mass<br /> </strong>The data set also included the meteors' mass. I initially tried to make each circle's radius proportional to the square root of the mass so each pixel of circle would correspond to some amount of mass. Because of the masses of meteors varied so much  the largest were too big and smallest were too small to see. After playing around with exponents smaller than 1/2, I eventually switched to logarithmic scaling. This gets rid of any simple correspondence between a circle's area and mass, but fits the data much better. Glancing at the histogram, it appears that the distribution of masses is approximately log-normal.
*   **Mouseover** **effects**  
    [<img class="alignnone size-full wp-image-242" alt="mouseover" src="http://www.roadtolarissa.com/wp-content/uploads/2013/05/mouseover.png" width="254" height="326" />][4]  
    The data set had some additional information that I wasn't sure how to represent graphically. To keep that information accessible and make the map interactive, I added it to a mouseover tooltip. Each meteor also had a URL pointing to its [meteorological society page][5] which was used to create an onclick event for the circles. The pages had pictures of meteors which I used to create thumbnail previews. This went fairly smoothly until I tried to upload the images to my webserver. I was using meteor name as the filename and some of them had unicode characters which resulted in weird errors that were difficult to diagnose.
*   **Crossfilters**<br>
    To make the map even more interactive, I incorporated the year and mass data into histogram [crossfilters][6]. I've used the crossfilter library indirectly before, through [dc.js][7] which has several chart types premade. Getting the circles on the map to change with transitions went beyond what dc.js can do out of the box and I had to get my hands dirty with the actual crossfilter library. The messiness of the code I ended up with reflects that - I'm getting closer to doing things correctly, but I'm not quite there yet.

Ultimately, I ended up with a presentation pretty close to [Javier de la Torre's][8]:

[<img class="alignnone size-full wp-image-247" alt="cartodb" src="http://www.roadtolarissa.com/wp-content/uploads/2013/05/cartodb.png" width="744" height="442" />][9]

I  think my version has a number of improvements (obviously, I just finished making it!) &#8211; the better looking tooltips which active on mouseover not on click, the crossfilters, dotmap instead of heatmap (I really don't like what happens to their contiguous areas on zoom)  - but Torre apparently made his in only 30 minutes. I don't regret the additional time spent on mine since most of it was spent learning, but [cartodb][10] or [fusion tables][11] look like they would be the appropriate tool to use the vast majority of the time. I am a little frustrated I wasn't able to do more with the flexibility of d3 - the only other published entry for the contest I've seen, [bolid.es][12], is stunning &#8211; and I'm looking forward to seeing what else gets made.

 [1]: http://roadtolarissa.com/meteors/
 [2]: http://visualizing.org/contests/visualizing-meteorites
 [3]: http://www.jasondavies.com/maps/transition/
 [4]: http://www.roadtolarissa.com/wp-content/uploads/2013/05/mouseover.png
 [5]: http://www.lpi.usra.edu/meteor/metbull.php?code=23593
 [6]: http://square.github.io/crossfilter/
 [7]: http://nickqizhu.github.io/dc.js/
 [8]: http://vimeo.com/59791629
 [9]: http://www.roadtolarissa.com/wp-content/uploads/2013/05/cartodb.png
 [10]: http://osm2.cartodb.com/tables/2320/public#/map
 [11]: https://developers.google.com/fusiontables/
 [12]: http://bolid.es/
