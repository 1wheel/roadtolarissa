---
layout: post
title: "Making Music with d3"
published: true
permalink: /synth
---

<svg id='synth'></svg>
<div id='synthSliders'></div>

*Click to add a note; requires firefox or chrome. Remake of [my remake](http://www.roadtolarissa.com/synth-scales/) of [tonematrix](http://tonematrix.audiotool.com/).*

Polar coordinates are pretty cool for displaying looping music! The music actually loops and larger boxes produce lower pitches, just like they do in real life. Other, smaller improvements:

- Log scaled sliders allow for finer control of large and small values. Going up or down an octave sound like the same distance to our ears, but on a linear scale 220 Hz is four times closer to 440 Hz than 880 Hz. With a bigger ranges, more and more of the smaller interesting values cluster together on a linear slider.
- Double and triple clicking produce replaces the default square waveform with saw and triangle waveforms. And adds more color!
- I've lowered the gain. Previously playing more than two notes would create an awful screech; not maxing out the sound card avoids this problem.
- [Cleaner code.](https://github.com/1wheel/roadtolarissa/blob/master/source/javascripts/posts/synthScale.js) After over a year of d3 and javascript, I think I'm really starting get a handle on writing clearly and idiomatically. Bit too much post here, but it is amazing what 150 lines can when built on top of the right abstractions.

Still todo:

- Customizable beats - both the raw number and their duration to allow for swinging and different time signatures.
- More scales and some sort of visualization of half and whole steps. It would also be interesting to explore explicitly educational interactive demonstrations of music theory.
- Saving/sharing state and more ambitiously, saving/sharing history to playback the process of making a song.  

<script src="/javascripts/libs/d3.3.13.js" type="text/javascript"></script>
<script src="/javascripts/posts/synthScale.js" type="text/javascript"></script>
