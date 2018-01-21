---
template: post.html
title: Aaronson Oracle
permalink: /oracle
draft: true
---

<span class='flashing'>Press the left and right arrow keys randomly, as fast as you can!</span>

<div class='fixed'>
  <div class='score'>50%</div>
  <div class='log'>
  	<div class='labels'>
  		<div>Guess: </div>
  		<div>Actual: </div>
  	</div>
  </div>
  <div class='button'></div>
</div>

 The computer will analyze the patterns in your key strokes and predict your next input. Typically it is correct around 70% of the time—humans have a hard time acting randomly.

## How does it work?

The looks at ngrams, sequences of four character

<div class='tree'></div>

Knowing what the computer computer will guess, you can guarantee that it is always wrong by picking the other direction. Doing the *opposite* of what a computer tells you isn't quite free will though!

## More reading

Inspired by [Nick Merrill's](http://people.ischool.berkeley.edu/~nick/aaronson-oracle/index.html) implementation of [Scott Aaronson's program](https://github.com/elsehow/aaronson-oracle).

A similar approach works for [Rock-Paper-Scissors](http://www.nytimes.com/interactive/science/rock-paper-scissors.html). Each level of the tree will branch three times instead of two. 

Human generated random inputs are distinguishable from true random noise along a variety of statistical measures; with practice, humans can produce inputs closer to [random noise](https://www.researchgate.net/profile/Allen_Neuringer/publication/232494603_Can_People_Behave_Randomly_The_Role_of_Feedback/links/02e7e51fec79d7ff8c000000.pdf).

[Code](https://github.com/1wheel/roadtolarissa/blob/master/source/oracle/script.js) for this page. The computer doesn't cheat!

<link rel="stylesheet" type="text/css" href="style.css">
<script src='../worlds-group-2017/d3_.js'></script>
<script src='../oracle/script.js'></script>
