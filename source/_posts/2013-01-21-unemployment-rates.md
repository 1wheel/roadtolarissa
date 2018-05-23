---
title: Unemployment Rates
template: post.html
date: 2013-01-21
permalink: /unemployment-rates
---
[<img class="aligncenter size-large wp-image-185" title="unemployment rates" src="http://www.roadtolarissa.com/wp-content/uploads/2013/01/rate1-1024x705.png" alt="" width="640" height="440" />][1]

Three years ago, the New York Times published a [nifty interactive graphic][2] showing how the recession had impacted the unemployment rate of different demographic groups. Wanting show a broader range of dates, add features, and get more practice with d3.js, I started working on a remake.

During my job at Goody Goody, I got some practice getting time series from Bureau of Labor Statistics. Since I was only interested in a few types of data like the CPI and unemployment rate in Texas, I used their [clunky java app][3] to get the data I needed.

[<img class="aligncenter size-full wp-image-186" title="BLS java app" src="http://www.roadtolarissa.com/wp-content/uploads/2013/01/rate2.png" alt="" width="784" height="459" />][4]

I briefly contemplated manually selecting all the series that I wanted to use for downloading but decided not to because of the amount of time and errors that would be involved in doing that. Poking around the BLS website more, I found their [FTP site][5] which contained huge text files with unemployment time series. This wasn't particularly user friendly, but all the data was machine readable and I wrote a [small python program][6] to extract and repackage the time series I wanted to show.

Even at this relatively early stage, I made a couple of decisions to limit the project's scope. The BLS collects a huge amount of demographic data &#8211; martial status, occupation, disabilities, veteran, reasons for not working more, ect. &#8211; and I omitted most of them because only a limited number of groupings have [crosstabs][7]. I also picked the semi arbitrary start year of 2001 to keep amount of data the page requires down. Many of the series go back to the 1950s and including them would have required either long page load times or a tricker system of only downloading requested time frames.

Implementing the page in d3.js wasn't too difficult. I'm getting more familiar with the library and the style of coding that works well with it. The biggest issue with the library  right now is its inability to do smooth transitions in none webkit browsers. The NYT's version of the graphic was written in flash and doesn't lag in firefox. Beta builds of firefox with the right experimental settings enabled display the page fine, but I'm not sure how long it will be before those improvements are widely installed.

In terms of new features, I added another set of buttons to allow for easy comparisons between two different demographic groups and a brush on the bottom graph for selecting time. These additions take some of the focus away from the recession, but also historically contextualize the unemployment rate and draw the viewer to explore the data.

 [1]: http://www.roadtolarissa.com/unemployment
 [2]: http://www.nytimes.com/interactive/2009/11/06/business/economy/unemployment-lines.html
 [3]: http://data.bls.gov/pdq/querytool.jsp?survey=ln
 [4]: http://www.roadtolarissa.com/wp-content/uploads/2013/01/rate2.png
 [5]: ftp://ftp.bls.gov/pub/time.series/ln
 [6]: https://github.com/1wheel/unemployment/blob/master/parseBLS.py
 [7]: http://en.wikipedia.org/wiki/Cross_tabulation
