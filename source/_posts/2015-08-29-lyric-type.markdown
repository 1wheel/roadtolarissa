---
template: post.html
title: Lyric Typing
date: 2015-08-29
permalink: /lyric-type
---

Type the words in time with music!

<div id='buttons'></div>

<div id='player'></div>

Made at [NYC Monthly Music Hack](http://monthlymusichackathon.org/). Code on [github](https://github.com/1wheel/roadtolarissa/tree/master/source/javascripts/posts/lyricType).

Hearing lyrics while typing them creates an interesting [synesthesia](https://en.wikipedia.org/wiki/Synesthesia) like effect, recontextualizing familiar music. One of my favorite games, [Audiosurf](https://en.wikipedia.org/wiki/Audiosurf), also did this, mixing songs and puzzle matching together. 

I made a [version](https://github.com/1wheel/typing) of this typing game three years ago, one of my first javascript programs. On a day-to-day basis, sometimes it feels like I'm not learning much more about programming, but something must be adding up — this time the code took just a few hours to write instead of a few weeks. 

The previous version was built on the now defunct Spotify desktop app platform and decrypted the also now defunct [TuneWiki](https://en.wikipedia.org/wiki/TuneWiki) internal API for timestamped lyrics. That version had lyrics for millions of songs but was difficult to share - it required installing a Spotify app and leeching off the API seemed like an okay thing to do locally but not publicly. 

This version uses YouTube for the music and I've baked in the lyrics for just 5 songs. It looks like [MusicXmatch](https://developer.musixmatch.com/) has timestamped lyrics, but they don't provide a public API for them. I might come back to this and add the ability to add your own videos and [lyrics](https://en.wikipedia.org/wiki/LRC_(file_format) (maybe saved in localStorage or shared with query parameters?) but until then, you're stuck with Julie Andrews and Carly Rae Jepsen.


<div class='tooltip'></div>



<link rel="stylesheet" type="text/css" href="/javascripts/posts/lyricType/style.css">


<script src="/javascripts/libs/d3.4.11.js" type="text/javascript"></script>
<script src="/javascripts/libs/lodash.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-jetpack-v1.js" type="text/javascript"></script>
<script src="/javascripts/libs/d3-starterkit-v1.js" type="text/javascript"></script>

<script src="https://www.youtube.com/iframe_api" type="text/javascript"></script>
<script src="/javascripts/posts/lyricType/songs.js"></script>
<script src="/javascripts/posts/lyricType/script.js"></script>
