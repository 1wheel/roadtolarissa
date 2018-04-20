---
template: post.html
title: Hackable Hot Reloading
permalink: /hot-reload
draft: true
shareimg: http://roadtolarissa.com/images/posts/tktk.png
---

Ever since seeing Brett Victor rewire a game live on stage, I've wanted to write code more interactively. 

<!-- <iframe src="https://player.vimeo.com/video/36579366#t=695s&autoplay=0&background=1" width="720"  frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" crossorigin=""></script>
<script src="//f.vimeocdn.com/js/froogaloop2.min.js"></script>
<script>
document.querySelector("iframe")
  .setAttribute('height', 410/720*Math.min(innerWidth - 20, 720))

var player = $f($('iframe')[0])
player.addEvent('ready', () => player.api('setVolume', 0))
</script>

 -->
I dabbled with programming languages that facilated this, like [clojure's REPL](https://github.com/bhauman/lein-figwheel) or [R notebooks](https://rmarkdown.rstudio.com/r_notebooks.html). But most of my work is with javascript and I was stuck pressing `⌘+S ⌘+Tab ⌘+R` over and over again to save my changes, tab over to the browser and reload the page.

<div class='editor manual'></div>

This gets pretty tedious.

[Live reload](http://livereload.com/) offers an improvement--instead of manually clicking the reload button, is has the computer do it for you. If you combine two tools, websockets and file watching, this isn't too difficult. 

First, set up a server that updates 

```js
var wss = new SocketServer({server})
chokidar
  .watch('*.js')
  .on('change', path => {
    wss.clients.forEach(d => d.send('reload'))
  })
```

Then, add a bit of js to your webpage that listens for these events:

```html
<script>
new WebSocket(location.origin.replace(/^http/, 'ws'))
  .onmessage = () => location.reload()
</script>
```

Much nicer to use now:

<div class='editor live'></div>

Still, that flash of white is just about the worst thing you can do when working with before and after comparisons. 

tktk change blindness gif


```js
  .on('change', path => {
    var str = fs.readFileSync(path, 'utf8')
    wss.clients.forEach(d => d.send(str))
  })
```

And instead of reloading the whole page, just run that string: 

```js
new WebSocket(location.origin.replace(/^http/, 'ws'))
  .onmessage = str => eval(str)
```

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
