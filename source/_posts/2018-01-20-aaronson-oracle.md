---
template: post.html
title: Aaronson Oracle
permalink: /oracle
shareimg: https://i.imgur.com/rfwNaUx.png
---

<span class='flashing'>Press the left and right arrow keys randomly, as fast as you can!</span>

<div class='fixed'>
  <div class='score'>50%</div>
  <div class='log'>
  	<div class='labels'>
  		<div>Guess: </div>
  		<div>Actual: </div>
  	</div>
  	<div class='log-entries'>
  		<div></div>
  	</div>
  </div>
  <div class='button'></div>
</div>

 The computer will analyze the patterns in your key strokes and predict your next input. Typically it is correct around 70% of the time—humans have a hard time acting randomly.

## How does it work?

Each of your key strokes is recorded. The computer finds all the times you entered your last four key strokes <span class='keypress'></span> and compares the number of times the next key stroke was a <span class='arrow-inline'>←</span> to the number of times the next key stroke was a <span class='arrow-inline'>→</span>. It guesses whichever has happened more often. 

The diagram below shows how many times you've entered each five character sequence, with more common sequences drawn with thicker paths. The last four characters you've entered are highlighted <b style="color: #f0f; position: relative; top: -5px; z-index: -100;">▂</b>. You can see the computer's guess by looking at which of the lines branching off your last character is thickest.  

<div class='tree'></div>

Knowing what the computer will guess, you can guarantee that it is always wrong by picking the other direction. Doing the *opposite* of what a computer tells you isn't quite free will though!

## More reading

Inspired by [Nick Merrill's](http://people.ischool.berkeley.edu/~nick/aaronson-oracle/index.html) implementation of [Scott Aaronson's program](https://github.com/elsehow/aaronson-oracle).

A similar approach works for [Rock-Paper-Scissors](http://www.nytimes.com/interactive/science/rock-paper-scissors.html). Each level of the tree branches three times instead of two. 

Human-generated random inputs are distinguishable from true random noise along a variety of statistical measures; with practice, humans can produce inputs closer to [random noise](https://www.researchgate.net/profile/Allen_Neuringer/publication/232494603_Can_People_Behave_Randomly_The_Role_of_Feedback/links/02e7e51fec79d7ff8c000000.pdf).

We also [detect patterns in random noise](https://cocosci.berkeley.edu/tom/papers/hard.pdf).

[Code](https://github.com/1wheel/roadtolarissa/blob/master/source/oracle/script.js) for this page. The computer doesn't cheat!


<link rel="stylesheet" type="text/css" href="style.css">
<script src='../worlds-group-2017/d3_.js'></script>
<script src='../oracle/script.js'></script>
