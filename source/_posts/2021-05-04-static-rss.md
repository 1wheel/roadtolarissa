---
template: post.html
title: Static RSS Reader
date: 2021-05-06
permalink: /static-rss
draft: false
---

<link rel='manifest' href='manifest.json'>
<link rel='stylesheet' href='https://roadtolarissa.com/slinks/static-rss/style.css'>
<meta name='theme-color' content='#111' />


<style>
html, a{
  color: #fff;
}

.header{
  filter: invert(1);
}
.header a{
  color: #000;
}

h1, .header-left{
  margin-left: 10px;
}

body > p{
  padding-left: 10px;
  padding-right: 10px;
}

.items{
  margin-top: 40px;
}

body{
  padding: 0px !important;
}

p> img{
  /*width: 100%;*/
}
</style>

Ever since the certificate on [Kouio](http://kouio.com/) expired, I've been looking for a replacement RSS reader without fiddly swipping actions or distracting sticky elements. 

Hosting my own application and database seemed like too much work to just to display some text in a column until I saw [osmosfeed](https://github.com/osmoscraft/osmosfeed) this weekend. It's essentially a script that pulls down RSS feeds and bakes them out into a static page once a day—much less maintenance!

osmosfeed's UI wasn't quite what I was looking for either, but just the idea of working with static files made things simple enough to bang out a prototype, shown below, in [200 lines of code](https://github.com/chart-code/static-rss). 

No database imposes significant limitations (read status doesn't sync 😔), but as a [home-cooked app](https://www.robinsloan.com/notes/home-cooked-app/) it's possible to try new ideas* until everything is just right and then trust it won't change for years. 

\* One here that I wish twitter had: only showing the most recent five or ten items per feed so less frequent posters don't get drowned out.

<div class='items'></div>

<script>
  window.datapath = 'https://roadtolarissa.com/slinks/static-rss/'
</script>

<script src='https://roadtolarissa.com/slinks/static-rss/d3_.js'></script>
<script src='https://roadtolarissa.com/slinks/static-rss/script.js'></script>



