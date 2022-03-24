---
template: post.html
title: Box Office Hits
date: 2021-05-06
permalink: /box-office-hits
draft: true
---

<link rel='stylesheet' type='text/css' href='style.css'>


Last year, I read statistic in the NYT that was so surprising I thought it was a typo:

> “Spider-Man: No Way Home” collected $260 million in the United States and Canada on its opening weekend. Total ticket sales for the two countries totaled $283 million, according to Comscore. **That means “No Way Home” made up 92 percent of the market.** “Nightmare Alley,” which was released on the same weekend, played to virtually empty auditoriums. It took in $2.7 million.

Did all the other movies in theaters really split just 8% of the audience? Scraping domestic box office numbers, it turns out to be both surprising and true: 

### “No Way Home” Is The First To Collect Over 90% Of A Weekend Box Office

<div class='weekly-top-percent'></div>

Looking at the super hero sequels at the top of the scatter plot, I initially thought this trend was being driven caused by Hollywood becoming increasingly hit driven.

But the pattern is actually a little more complicated:

### Yearly distribution of box office receipts by year

<div class='year-distribution'></div>

While the biggest movies have taken a larger share of ticket sales of the last decade, 

2021 was the first time since 1985 that that top five grossing movies took more than a quarter of the year's total box office.

### Movies are making more of their money opening week

<div class='best-week-scatter'></div>


- People don't "go the movies" anymore, they go to see specific movie
- Go early to avoid spoilers
- Smaller, slow burning hits don't have a chance


<!-- <div class='year-sm'></div> -->

<!-- <h3>Box office percentage, by week of release</h3> -->

<!-- <div class='by-movie'></div> -->


<!-- > “Spider-Man: No Way Home” collected $260 million in the United States and Canada on its opening weekend. Total ticket sales for the two countries totaled $283 million, according to Comscore. **That means “No Way Home” made up 92 percent of the market.** “Nightmare Alley,” which was released on the same weekend, played to virtually empty auditoriums. It took in $2.7 million. -->





<script src='https://roadtolarissa.com/slinks/static-rss/d3_.js'></script>

<script src='util.js'></script>
<script src='draw-weekly-top-percent.js'></script>
<script src='draw-best-week-scatter.js'></script>
<script src='draw-year-distribution.js'></script>
<script src='init.js'></script>



https://www.boxofficemojo.com/weekend/2021W51/

https://www.nytimes.com/2021/12/26/business/movies-stars-hollywood.html