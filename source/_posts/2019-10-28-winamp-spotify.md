---
template: post.html
title: Winampify 
date: 2019-10-28
permalink: /winampify
draft: true
---

<link rel="stylesheet" href="https://roadtolarissa.com/slinks/winamp-spotify/style.css">

<style>
html, a, .header{
  color: #0f0;
}

.header-right{
  display: none;
}

#lib{
  position: relative;
  margin-top: -20px;
}

p> img{
  width: 100%;
}
</style>

<div id='lib'>
  <div class='search'></div>
  <div id='auth-button'></div>
  
  <div class='table' id='artists'></div>
  <div class='table' id='albums'></div>
  <div class='table' id='songs'></div>
</div>

<!-- In addition to nostalgia for the songs of my youth, I also miss the interfaces--songs downloaded from limewire just sounded better, you know? 

The Spotify interface has a remarkable about of white space. 1000+ pixels to show three songs!

![](https://i.imgur.com/GqsKRjD.png)

With millions of tracks, it isn't possible to show everything, so it all sort of floats in an amourphus blob. 

By limiting the universe of songs to the discograph of artists that I've liked, it is possible to fit everythign into a more human sized thing.

45k songs don't fit on a single screen, but they do

Sadly, as the tools to remix culture have gotten more expressive. 

![](https://imgur.com/vXKYY0j.png)
 -->

Spotify has strict rate limits. To view your own songs checkout the [code](https://github.com/chart-code/winampify).

<script>
  window.dataPathOverride = 'https://roadtolarissa.com/slinks/spotify-winamp/'
</script>

<script src='https://roadtolarissa.com/slinks/winamp-spotify/d3_.js'></script>
<script src='https://roadtolarissa.com/slinks/winamp-spotify/grant.js'></script>
<script src='https://roadtolarissa.com/slinks/winamp-spotify/script.js'></script>



