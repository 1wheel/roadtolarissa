---
title: Film Strips
author: admin
layout: post
plink: film-strips-post
categories:
  - Uncategorized
---
[<img class="alignnone  wp-image-220" alt="filmstrips" src="http://www.roadtolarissa.com/wp-content/uploads/2013/05/filmstrips.png" width="640" height="417" />][1]

<p style="text-align: center;">
  <a href="http://roadtolarissa.com/film-strips/">http://roadtolarissa.com/film-strips/</a>
</p>

I've had this idea bouncing around in the back of my head for a few months. When I finally got around to working on it, I was pleasantly surprised to have a functional prototype after only a few hours.

The idea is pretty simple: Take a bunch of [sequential stills from a movie][2], create a map of how their [average color][3] changes over time, and add a [mouseover effect][4] that shows the enlarged still. Thanks to google and stackoverflow, it didn't take too long to find programs and libraries that did most of what I was picturing and with my experience on other projects, gluing everything together went smoothly.

Because of disk space constraints, I'm only hosting the 2013 Best Picture Nominees. Many more (static) film strips are located at [MovieBarcode][5] which this project was inspired by. You can also make interactive film strips from your own movie files &#8211; the whole process is [automated ][6]- if you're not familiar with python though, getting all the tools setup will take a few hours.

I have a couple of idea of additional features (subtitle integration, variable bar width, experiments with other ways of generating and showing color, ect) but since this is sitting in distinctly gray area of fair use, I'm a little hesitant to put more time into it. I am glad I did what I've done. I've started working at an actual workplace and I'd like to stay (/get back) in the habit of working on things for fun.

 [1]: http://roadtolarissa.com/film-strips/
 [2]: http://www.ffmpeg.org/
 [3]: http://www.pythonware.com/products/pil/
 [4]: http://d3js.org/
 [5]: http://moviebarcode.tumblr.com/
 [6]: https://github.com/1wheel/film-strips
