---
template: post.html
title: Box Office Hits
date: 2021-05-06
permalink: /box-office-hits
draft: true
---

<link rel='stylesheet' type='text/css' href='style.css'>
Last year, I read a statistic in the NYT that was so surprising I thought it was a typo:

> “Spider-Man: No Way Home” collected $260 million in the United States and Canada on its opening weekend. Total ticket sales for the two countries totaled $283 million, according to Comscore. **That means “No Way Home” made up 92 percent of the market.** “Nightmare Alley,” which was released on the same weekend, played to virtually empty auditoriums. It took in $2.7 million.

Did all the other movies in theaters really split just 8% of the audience? Scraping domestic box office numbers, it turns out to be both surprising and true: 

### “No Way Home” Is the First to Collect Over 90% Of a Weekend Box Office

<div class='weekly-top-percent full-width'></div>

Looking at the superhero sequels at the top of the scatter plot, I initially thought this trend was being driven caused by Hollywood trying to engineer bigger and bigger returns from hit blockbusters.

But the pattern is a little more complicated:

### Yearly Distribution of Domestic Box Office Receipts by Year

<div class='year-distribution full-width'></div>

While the biggest movies have taken a larger share of ticket sales of the last decade, there hasn't been a smooth increase in top-heaviness over the last 30 years. 

In 2021, the top five grossing movies took more than a quarter of the year's total box office — the first time that's happened since the 80s, when it happen regularly.  

What has changed more smoothly over time? Movies are making less and less money during extended runs.

### Movies Are Making More of Their Money Opening Week

<div class='best-week-scatter full-width'></div>

This suggests a larger trend, beyond the control of Hollywood execs' green-lighting decisions. 

Television and the internet are substitutes for movie going; people don't "go the movies" anymore, they go to see specific movie. 
Superhero movies, with their franchises, familiar faces and spoilers, 

There's no longer a broad audience that can create slower burning hit. The type of middlebrow Oscar movie the builds up word of mouth momentum over several weeks doesn't exist in box offices anymore. and it doesn't seem to be replaced streaming platforms; CODA has been streamed less than a [million](https://deadline.com/2022/03/oscar-best-picture-nomiees-box-office-boost-streaming-viewership-1234985202/ times).



<!-- <div class='year-sm'></div> -->

<!-- <h3>Box office percentage, by week of release</h3> -->

<!-- <div class='by-movie'></div> -->


<!-- > “Spider-Man: No Way Home” collected $260 million in the United States and Canada on its opening weekend. Total ticket sales for the two countries totaled $283 million, according to Comscore. **That means “No Way Home” made up 92 percent of the market.** “Nightmare Alley,” which was released on the same weekend, played to virtually empty auditoriums. It took in $2.7 million. 


-->



<div id='notes'>
<br>

<p>[Inflation adjusted](https://help.imdb.com/article/imdbpro/industry-research/box-office-mojo-by-imdbpro-faq/GCWTV4MQKGWRAUAP?ref_=mojo_cso_md#inflation) data [scraped](https://github.com/1wheel/scraping-2018/tree/master/box-office-mojo) from Box Office Mojo // [chart code](https://github.com/1wheel/roadtolarissa/tree/master/source/box-office-hits)

</div>

<script src='https://roadtolarissa.com/slinks/static-rss/d3_.js'></script>

<script src='util.js'></script>
<script src='draw-weekly-top-percent.js'></script>
<script src='draw-best-week-scatter.js'></script>
<script src='draw-year-distribution.js'></script>
<script src='init.js'></script>

<!-- 

https://www.boxofficemojo.com/weekend/2021W51/

https://www.nytimes.com/2021/12/26/business/movies-stars-hollywood.html


Less than a million people have streamed CODA 



-->