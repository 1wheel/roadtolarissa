---
template: post.html
title: Why The Box Office Hits
title: Why Best Picture Winners Aren't Hits Anymore
date: 2021-05-06
permalink: /box-office-hits
draft: true
---

<link rel='stylesheet' type='text/css' href='style.css'>
Last year, I read a [statistic](https://www.nytimes.com/2021/12/26/business/movies-stars-hollywood.html) in the NYT that was so surprising I thought it was a typo:

> “Spider-Man: No Way Home” collected $260 million in the United States and Canada on its opening weekend. Total ticket sales for the two countries totaled $283 million, according to Comscore. **That means “No Way Home” made up 92 percent of the market.** “Nightmare Alley,” which was released on the same weekend, played to virtually empty auditoriums. It took in $2.7 million.

Did all the other movies in theaters really split just 8% of the audience? Scraping domestic box office numbers, it turns out to be both surprising and true: 

<!-- <div class='full-width no-min-height'>
<h3></h3>
</div>
 -->
 ### “No Way Home” Is the First to Collect Over 90% of a Weekend Box Office

<div class='weekly-top-percent full-width'></div>

This continued beyond opening weekend: over the next three weekends, “No Way Home” continued to take in over half of the box office.

Looking at the superhero sequels at the top of the scatter plot, I initially thought this trend was being driven by Hollywood trying to engineer bigger returns from the biggest blockbusters.

But the pattern is a little more complicated:

### Yearly Distribution of Domestic Box Office Receipts by Year

<div class='year-distribution full-width'></div>
<div class='year-distribution-legend'></div>

While the top grossing movies have taken a larger share of ticket sales of the last decade, there hasn't been a smooth increase in top-heaviness over the last 30 years. In 2021, the top five grossing movies took more than a quarter of the year's total box office — the first time that's happened since the 80s, when it happened regularly.  

What has changed more smoothly that's caused more weekends to be dominated by a single movie? Extended runs have slowly stopped earning a significant amount of money.

### The Biggest Movies Are Making More of Their Money Opening Week

<div class='best-week-scatter full-width'></div>

There's been a bigger change in how media is consumed, beyond the control of Hollywood execs' green-lighting decisions. Television, streaming and TikTok are increasingly good [substitutes](https://www.nytimes.com/2022/03/25/opinion/oscars-movies-end.html) for theater going; people don't "go the movies" anymore, they go to see a specific movie. Superhero movies — which are engineered to create urgency around opening weekend with their franchises, familiar faces, spoilers and massive marketing budgets — have the only formula that can consistently still fill seats. 

This change in consumption has also created a <x>best picture Oscar winner</x> sized hole in the bottom right of the chart (adjust the minimum gross slider to see more recent winners). 

With other genres playing to mostly empty theaters, there's no longer a broad audience that can build up word of mouth momentum for an original movie over several weeks. Best picture winners are still slow burning, but they're no longer hits; even on [streaming](https://www.nytimes.com/2022/03/26/business/media/academy-awards-streaming-services.html), Oscar-favorite CODA has been viewed less than a [million times](https://deadline.com/2022/03/oscar-best-picture-nomiees-box-office-boost-streaming-viewership-1234985202/).


<!-- <div class='year-sm'></div> -->

<!-- <h3>Box office percentage, by week of release</h3> -->

<!-- <div class='by-movie'></div> -->


<!-- > “Spider-Man: No Way Home” collected $260 million in the United States and Canada on its opening weekend. Total ticket sales for the two countries totaled $283 million, according to Comscore. **That means “No Way Home” made up 92 percent of the market.** “Nightmare Alley,” which was released on the same weekend, played to virtually empty auditoriums. It took in $2.7 million.

There's no longer a broad audience that can create slower burning hit. The type of middlebrow Oscar movie the builds up word of mouth momentum over several weeks doesn't exist in box offices anymore. and it doesn't seem to be replaced streaming platforms; CODA has been streamed less than a [million times](https://deadline.com/2022/03/oscar-best-picture-nomiees-box-office-boost-streaming-viewership-1234985202/).


There's no longer a broad audience that can sustain the type of slower burning hit building

There's no longer a broad audience that can create slower burning hit. The type of middlebrow Oscar movie the builds up word of mouth momentum over several weeks doesn't exist in box offices anymore. and it doesn't seem to be replaced streaming platforms; .

Everything else plays to empty theaters.



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