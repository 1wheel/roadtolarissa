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


I dabbled with programming languages that facilated this, like [clojure's REPL](https://clojure.org/guides/repl/introduction) and [R notebooks](https://rmarkdown.rstudio.com/r_notebooks.html). But most of my work is with javascript and I was stuck pressing `⌘+S ⌘+Tab ⌘+R` over and over again to save my changes, tab over to the browser and reload the page.

<div class='editor manual'></div>

This gets pretty tedious.

[Live reload](http://livereload.com/) offers an improvement--instead of manually clicking the reload button after you've made a change, the computer does it for you! With the right libraries, this isn't too difficult to get up and running. 

First, set up a [server](https://github.com/1wheel/hot-server/blob/master/index.js) that watches for file changes and pings a websocket when they happen:

```js
var wss = new SocketServer({server})
chokidar
  .watch('*.js')
  .on('change', path => {
    wss.clients.forEach(d => d.send('reload'))
  })
```

Then, add a bit of javascript to your page that connects to the websocket and reloads the page when it receives a ping:

```html
<script>
new WebSocket(location.origin.replace(/^http/, 'ws'))
  .onmessage = () => location.reload()
</script>
```

Now you can make tweaks without risking a RSI flare up.  

<div class='editor live'></div>

Still, clearing the whole page to reload isn't ideal. 

The flash of white is particularly harmful when the output of your code is an image. This isn't just an aestictic consideration. Our eyes automatically notice small changes—just what you want when trying to decide between 10 or 15px of padding—but after a hard reload everything looks like it changed.

Even with automatic reloading you can't instantly sense how your tweak effected the output; you have to pay close attention to what you're changing and intentionally remember what it looked like before.  

<div class='spot-container'>
  <div class='spot'></div>
  <i>
    Toggling between images makes it easy to [spot the difference](https://en.wikipedia.org/wiki/Spot_the_difference). Inserting a blank frame prevents changes from being picked up [preattentively](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0042851).
  </i>
</div>

Instead of reloading the whole page, we can use the server pass the changed file through websocket : 

```js
  .on('change', path => {
    var str = fs.readFileSync(path, 'utf8')
    wss.clients.forEach(d => d.send(str))
  })
```

Now the browser only needs to `eval` your program;  it doesn't need to rebuild the entire page or reparse all of the liberies you're using:

```js
new WebSocket(location.origin.replace(/^http/, 'ws'))
  .onmessage = str => eval(str)
```

<div class='editor hot'></div>

Much better! If you want to try this out on your project, I've packaged the ideas here in [hot-server](https://github.com/1wheel/hot-server). It serves a directory statically, like `python -m http.server`. A small `<script>` tag automatiacally gets appended  

<div style='display: none'>`</script>`</div>

Brett's talk suggested a ton of other ideas like [sliders](https://thebookofshaders.com/02/) to control numbers and directly [manipulating](http://1wheel.github.io/swoopy-drag/) elements. I've played around with some of them, but they're trickier to generalize. 

[Eve](http://futureofcoding.org/essays/eve/) explored many of these ideas and [Observable](https://beta.observablehq.com/) bakes in reactive programming

<div class='image-container'>
  <img style='background:#fff' src='https://camo.githubusercontent.com/afdb8057414988ac33b85eb25a225181f9efb7b1/687474703a2f2f7765627061636b2e6769746875622e696f2f6173736574732f484d522e737667'></img>
  <i>[Hot Module Reloading in Webpack](https://github.com/webpack/docs/wiki/hot-module-replacement-with-webpack) parses your dependency tree and figures out how to run your new code.</i>
</div>

This is great if you're building a whole . it feels magical, but there's just 50 lines of code powering it.

eve

you don't need something this fancy to experminent.

http://futureofcoding.org/essays/eve/


## todo

x link to clojure repl
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
