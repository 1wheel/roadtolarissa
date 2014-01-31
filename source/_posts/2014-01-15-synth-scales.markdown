---
layout: post
title: "Making Music with d3"
published: false
permalink: /circular-synth-scales
---

<svg id='synth'></svg>
<div id='synthSliders'></div>

*Click to add a note, requires firefox or chrome. Remake of [my remake](http://www.roadtolarissa.com/synth-scales/) of [tonematrix](http://tonematrix.audiotool.com/).*

Polar coordinates are pretty cool for displaying looping music! The music actually loops and larger boxes produce lower pitches, just like they do in real life. Other, smaller improvements:

- Log scaled sliders allow for finer control of large and small values. Going up or down an octave sound like the same distance to our ears, but on a linear scale 220 Hz is four times closer to 440 Hz than 880 Hz.  
- Double and triple clicking produce replaces the default square waveform with saw and triangle ones. And adds more color!
- I've lowered the gain. Previously playing more than two notes would create an awful screech; not maxing out the sound card avoids this problem.
- Cleaner code! 

cleaner code

mousedown draw, better flicker, generate share link, embedable

Change number of beats, group by measure and change time signature.
History

<script src="/javascripts/libs/d3.3.13.js" type="text/javascript"></script>
<script src="/javascripts/posts/synthScale.js" type="text/javascript"></script>
