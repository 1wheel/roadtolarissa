---
template: post.html
title: Winamp Spotify 
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

</style>

<div id='lib'>
  <div class='search'></div>
  
  <div class='table' id='artists'></div>
  <div class='table' id='albums'></div>
  <div class='table' id='songs'></div>

  <div id='auth-button'></div>
</div>


Spotify has strict rate limits. To view your own songs checkout the [code](https://github.com/chart-code/winamp-spotify).

<script src='https://roadtolarissa.com/slinks/winamp-spotify/d3_.js'></script>
<script src='https://roadtolarissa.com/slinks/winamp-spotify/grant.js'></script>
<script src='https://roadtolarissa.com/slinks/winamp-spotify/script.js'></script>



