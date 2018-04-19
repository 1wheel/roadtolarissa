---
template: post.html
title: Hacking Hot Reloading
permalink: /hot-reload
draft: true
shareimg: http://roadtolarissa.com/images/posts/tktk.png
---

Ever since seeing Brett Victor rewire a platformer, I've wanted to write code more interactively. 

<iframe src="https://player.vimeo.com/video/36579366#t=695s&autoplay=0&background=1" width="720"  frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" crossorigin=""></script>
<script src="//f.vimeocdn.com/js/froogaloop2.min.js"></script>
<script>
document.querySelector("iframe")
  .setAttribute('height', 410/720*Math.min(innerWidth - 20, 720))

var player = $f($('iframe')[0])
player.addEvent('ready', () => player.api('setVolume', 0))
</script>


I dabbled with programming languages that facilated this, like [clojure's REPL](https://github.com/bhauman/lein-figwheel) or [R notebooks](https://rmarkdown.rstudio.com/r_notebooks.html). But most of my work is with javascript and I was stuck pressing `⌘+S ⌘+Tab ⌘+R` over and over again to save my changes, tab over to the browser and reload the page.

This gets pretty tedious. 

<div class='editor manual'></div>

[Live reload](http://livereload.com/) is also nice, but that flash of white is just about the worst thing you can do when working with before and after comparisons. 

<div class='editor live'></div>

Eventually, I figured out a simple solution combining to bits of technology: file watching and websockets. 

<div class='editor hot'></div>

And sometimes, direct manipulation is better:

<!-- <div class='editor drag'></div> -->


## Other options

observable

webpack flow chart

this is nice. it feels magical, but there's just 50 lines of code powering it.

you don't need something this fancy to experminent.


## Todo

link to clojure repl
nice job! text
fix hit box math - take into account particle size
more workds
breaks if you type in var (on va, not v? check for errors with when function runs before updating wrapper)

<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.32.0/codemirror.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.32.0/mode/javascript/javascript.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.32.0/codemirror.min.css" />

<link rel="stylesheet" type="text/css" href="style.css">
<script src='../worlds-group-2017/d3_.js'></script>
<script src='../worlds-group-2017/swoopy-drag.js'></script>
<script src='visible-timer.js'></script>
<script src='script.js'></script>
