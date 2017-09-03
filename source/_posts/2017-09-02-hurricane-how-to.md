---
template: post.html
title: "Hurricane Map How To"
permalink: /hurricane
shareimg: http://roadtolarissa.com/images/posts/tktk
---

<link rel="stylesheet" type="text/css" href="/hurricane/style.css">

<script src="/hurricane/d3+_.js"></script>
<script src="/hurricane/script.js"></script>


When projections showed Hurricane Harey could bring a record setting amount of rain to Houston, the graphics desk at the New York Times started exporing ways of showing the rainfall. After a couple of days of scrambling, we managed to make a [map](https://www.nytimes.com/interactive/2017/08/24/us/hurricane-harvey-texas.html) showing both the accumulation and rate of rainfall:

<img src="https://i.imgur.com/hCXJovg.gif" style="margin: 0px auto; display: block;">

Getting this done on deadline required mashing together a couple of different web technologies, like svg and canvas, with a grab bag of open source libraries. This post describes some of tricks and techniques we used to bring everything together. 

## Finding the data

First we needed a data source. Preferably a frequently updating one, with gridded values so we could make a map with more detail than just a few station numbers overlaid.

The [Global Precipitation Measurement Constellation](https://pmm.nasa.gov/data-access/downloads/gpm) seemed initially seemed like a good candidate - it promised a grid of rainfall rates around the world 30 minute slices. After spending most of the day wrangling netCDF files and R though, I had only managed to make map showing the path GPM satellites had traced over the earth during one of the 30 minute update windows: 

<img src="https://i.imgur.com/cFAL1iC.png" style="margin: 0px auto; display: block;">

[Interesting](https://www.youtube.com/watch?v=tHXHUc52SAw), but no where nearer to something publishable. This was particularly frustrating because the previous afternoon I had watched Josh put together a [historical rainfall map](https://www.nytimes.com/interactive/2017/08/29/upshot/harvey-rainfall-where-you-live.html) using similar data and tools, but I wasn't familiar enough with the domain to duplicate his efforts quickly. 

Two of my other collagues, Jugal and Anjali

- https://www.nytimes.com/interactive/2017/08/24/us/hurricane-harvey-texas.html
- getting the data
- drawing rainfall
- animating the data
- showing total rainfall
- shrinking data/showing both
- cliping to land
- making a gif




The trickiest part of this piece was finding the right data source. We wanted frequently updating, hourly data to show where the rain was falling the hardest and how much had fallen overall. 

I started looking at the [Global Precipitation Measurement Constellation](https://pmm.nasa.gov/data-access/downloads/gpm) which has data on rainfall around the world in 30 minute slices released on 6 hour lag. After spending a few hours figuring out how to open up netCDF files, I realized the data wasn't updated as regularly as I hoped. Coloring the data points by observation time showed the paths of [satellites](http://imgur.com/lgjC75m) [moving](http://imgur.com/cFAL1iC) across the sky. Since not every point gets updated at the same time or on the same interval, calculating cumulative rainfall was trickier than just summing the hourly interval - too tricky to do on deadline. 

After spending most of a Saturday wandering down a dead end, I was ready to give up. Until Anjali found a [NOAA ftp server](http://www.srh.noaa.gov/data/ridge2/Precip/qpehourlyshape/2017/201708/20170828/) with exactly the data I was looking for! The format was a bit strange - a shapefile with a [grid of points](http://imgur.com/Vgh8uZS) showing calculated rainfall. I threw together a rough script to download download the last few days of observations, combine them into a csv and [plot the values](http://imgur.com/5jo48l0). 

Since both the cumulative and the hourly rainfall were interesting, I tried a bivariate color 
scale to trace the hurricane's path in red. You can see the [eye](http://imgur.com/yeJyHxs) of the hurricane as it lands! All the colors were a little too much to explain in a key though, so we switched to circles to show the current path of the hurricane. We also had to cut down on the spatial resolution to keep the file size under control - maybe a video would have been better, but I'm a big fan of tiny charts inside of tooltips.  



When projections showed Hurricane Harey could bring a record setting amount of rain to Houston, the graphics desk at the New York Times started exporing ways of showing the water. What does record setting rainfall look like in different parts of the country? Where and when did it rain the hardest? And how can we communicate how people experienced the rising water with just points on a map?

This talk will describe the process of answering one of those questions, from parsing NASA's microwave data with R to creating a live-updating interactive map with d3 and canvas that showed both the [accumulation and rate of rainfall]

