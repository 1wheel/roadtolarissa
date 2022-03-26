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

### “No Way Home” Is The First To Collect Over 90% Of A Weekend Box Office

<div class='weekly-top-percent full-width'></div>

Looking at the superhero sequels at the top of the scatter plot, I initially thought this trend was being driven caused by Hollywood trying to engineer bigger and bigger returns from hit blockbusters.

But the pattern is a little more complicated:

### Yearly distribution of domestic box office receipts by year

<div class='year-distribution full-width'></div>

While the biggest movies have taken a larger share of ticket sales of the last decade, there hasn't been a smooth increase in top-heaviness over the last 30 years. 

In 2021, the top five grossing movies took more than a quarter of the year's total box office — the first time that's happened since the 80s, when it happen regularly.  

What 

### Movies are making more of their money opening week

<div class='best-week-scatter full-width'></div>

This points to a larger trend cause by televison and the inter

People don't "go the movies" anymore, they go to see specific movie. Superhero movies encourage this with huge marketing budgets . 

Smaller, slow burning hits don't have a chance. The type of midbrow Oscar movie the builds up word of mouth momement over several weeks doesn't exist in box offices anymore. 

Will this exist on streaming platforms?



<!-- <div class='year-sm'></div> -->

<!-- <h3>Box office percentage, by week of release</h3> -->

<!-- <div class='by-movie'></div> -->


<!-- > “Spider-Man: No Way Home” collected $260 million in the United States and Canada on its opening weekend. Total ticket sales for the two countries totaled $283 million, according to Comscore. **That means “No Way Home” made up 92 percent of the market.** “Nightmare Alley,” which was released on the same weekend, played to virtually empty auditoriums. It took in $2.7 million. -->



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

https://deadline.com/2022/03/oscar-best-picture-nomiees-box-office-boost-streaming-viewership-1234985202/ 


-->