---
template: post.html
title: Hackable Hot Reloading
permalink: /hot-reload
draft: true
shareimg: http://roadtolarissa.com/images/posts/tktk.png
---

Ever since seeing Brett Victor rewire a game live on stage, I've wanted to write code more interactively. 

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

<div class='editor manual'></div>

This gets pretty tedious.

[Live reload](http://livereload.com/) offers an improvement--instead of manually clicking the reload button after you've made a change, the computer does it for you! With the right libraries, this isn't too difficult to get up and running. 

First, set up a [server](https://github.com/1wheel/hot-server/blob/master/index.js) that watches for file changes and broadcast over a websocket when changes happen:

```js
var wss = new SocketServer({server})
chokidar
  .watch('*.js')
  .on('change', path => {
    wss.clients.forEach(d => d.send('reload'))
  })
```

Then, add a bit of javascript to your page that connects to that websocket and reloads the page when it receives a broadcast:

```html
<script>
new WebSocket(location.origin.replace(/^http/, 'ws'))
  .onmessage = () => location.reload()
</script>
```

Now you can make tweaks without risking a RSI flare up.  

<div class='editor live'></div>

Still, clearing the whole page to reload isn't ideal. 

The flash of white is particularly harmful when working visually. Instead of instantly seeing how your changed effected the output, you have to pay c 

<div class='spot-container'>
  <div class='spot'></div>
  <i>
    Toggling between images makes it easy to 
    “<a href='https://en.wikipedia.org/wiki/Spot_the_difference'>spot the difference</a>”, 
    but inserting a blank frame prevents changes from being picked up <a href='http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0042851'>preattentively</a>.
  </i>
</div>



Instead of reloading the whole page, we can just : 

```js
  .on('change', path => {
    var str = fs.readFileSync(path, 'utf8')
    wss.clients.forEach(d => d.send(str))
  })
```

And `eval` that string

```js
new WebSocket(location.origin.replace(/^http/, 'ws'))
  .onmessage = str => eval(str)
```

<div class='editor hot'></div>

I made a lib to this, just takes a couple of lines of code

lots of 

And sometimes, direct manipulation is better:

book of shaders

swoopy drag

<!-- <div class='editor drag'></div> -->


## Other options

observable

webpack flow chart
https://github.com/webpack/docs/wiki/hot-module-replacement-with-webpack

this is nice. it feels magical, but there's just 50 lines of code powering it.

eve

you don't need something this fancy to experminent.


## todo

- link to clojure repl
- nice job! text
x fix hit box math - take into account particle size
- more workds
x breaks if you type in var (on va, not v? check for errors with when function runs before updating wrapper)
- matching vpadding around video, code and img

## mobile
- stack code
x video

<link href="https://fonts.googleapis.com/css?family=Roboto+Mono" rel="stylesheet">

<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.32.0/codemirror.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.32.0/mode/javascript/javascript.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.32.0/codemirror.min.css" />

<link rel="stylesheet" type="text/css" href="style.css">
<script src='../worlds-group-2017/d3_.js'></script>
<script src='../worlds-group-2017/swoopy-drag.js'></script>
<script src='visible-timer.js'></script>
<script src='script.js'></script>
