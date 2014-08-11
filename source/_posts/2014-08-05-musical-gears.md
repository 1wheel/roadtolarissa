---
layout: post
title: "215 teeth / 1008 beats"
comments: true
categories: 
---

`content here`

Finishing up the circular synth, I got a little frustrated by its inability to save more than 4 measures of music. While there was a clear connection between the interface and the music, there wasn't any way to communicate its most enjoyable aspect - changing a few notes every cycle, creating a composition.

With these gears, I've tried to visually represent this process of change. The orange gear functions like the first circular synth. Each arc is a note -- the distance from the center corresponds to its pitch; the column to one of eight beats. When the beat passes the left-hand side of the circle, it's highlighted yellow and the filled in notes are played.

The large orange and green gears each have 72 teeth, the small green gear has 8 and the pink gear has 63. Every 7 beats the orange and green gears make 7/8ths of one revolution. This turns the small green gear 7 teeth ahead, while also turning the pink gear 7 teeth or 1/9th of a revolution (7/63 teeth). Since the pink gear has 9 beats, this progression of 7 orange beats advances the pink gear exactly one beat. When a pink beat passes the left side of the circle, it flashes blue and any of its filled in notes invert the fill-state of the orange notes across from them.

Every 63 (7*9) orange beats, the pink gear completes one rotation while the orange gear rotates 7 and 7/8th times. After 8 rotations of the pink gear or 504 (7*8*9) beats, each gear returns to its original orientation. Many of the notes on the orange gear have had their fill-states changed several times; during the next 504 beats, the same pink notes that flipped the orange beats' fill-state will flip it again till everything returns to exactly how it started, 1008 beats earlier.

While (I think) this is nicely elegant exploitation of 7, 8 and 9's relative primalitity and does visualize an entire composition at once, there are a number of limitations. The graphic isn't self explanatory --  the accompanying text should be adding context; not a requirement for understanding. Watching at a slow speed shows off the aesthetically pleasing gear animation, but the inversion of notes occurs too slowly to hear. Speeding up makes the inversions more audible, but the gears start to blur and turn backwards like a fan. Adding another gear or two in the chain of updating notes a la (MIT GEAR THINGER) would provide a good variety of speeds but at the cost of adding more complexity. The biggest limitation is that it's difficult to make something that sounds good throughout the cycle of 1008 beats. Since the filled-in notes constantly invert and uninvert, there are lots of dissonant chords, making it difficult to predict how changing one note will effect the entire song.

LINK TO PIOANO thing impressed me.