---
title: Reddit Comment Visualizer
author: admin
template: post.html
permalink: /reddit-comment-visualizer
categories:
  - redditgraphs
tags:
  - redditgraphs
---
I've spent the last few days working on a [visualizer for reddit comments][1].  Using reddit's API, the program downloads a user's comments and graphs them with [flot][2].

[<img class="aligncenter size-full wp-image-85" title="Scatter Plot Screen Shot" src="http://www.roadtolarissa.com/wp-content/uploads/2012/10/scatter-plot-screen-shot.png" alt="" width="734" height="497" />][3]

The most obvious way to graph a set of data points is with a scatter plot. Since reddit's [user page][4] only displays 20 comments at a time, it is very difficult to get a sense about how time has been spent on the site. On this scatter plot, every one of my comments is represented by a small circle plotted so its length position along the y-axis represents its number of (non-quotation) characters. Mousing over a circle displays the comment it represents on the right panel. I can see that I've spent most of my time talking about League of Legends, that I commented a lot in last July, and that I'm posting less frequently now.

Unfortunately, while it is easy to see that most of my comments are not very long, it isn't very clear exactly how many shorter comments there are since the points cluster together closely at the bottom of the graph. Adding a heat map or [fisheye zoom][5] to the scatter plot could fix this problem, but neither are implemented in flot. Instead, I use a totally different graph type to display the data:

[<img class="aligncenter size-full wp-image-81" title="Histogram of Length" src="http://www.roadtolarissa.com/wp-content/uploads/2012/10/Histogram-of-Length.png" alt="" width="719" height="665" />][6]

flot also does not include histograms, but sorting and grouping the comments then displaying them with the [stacking plugin][7] is simpler than creating a fisheye zoom effect within flot. By removing the time component of the graph, the distribution of comment length becomes much easier to see &#8211; the vast majority of comments I've made are quite short, even more so than the scatter plot shows.

Still, while the distribution of comment's length is apparent in the histogram, the distribution of comment length in each subreddit is difficult to discern. Like with the scatter plot, it is clear that the most commonly element &#8211; this time the League of Legends subreddit instead of short posts &#8211; occurs quite often and others less frequently, but the actual ratio between them is not clear.

[<img class="aligncenter size-full wp-image-83" title="pie chart" src="http://www.roadtolarissa.com/wp-content/uploads/2012/10/pie-chart.png" alt="" width="651" height="662" />][8]

Pie charts [generally don't get a lot of love][9], but I use one to display total karma (and total comment length, and number of comments) by subreddit because it does a decent job of displaying the ratios and is simpler, more immediately understandable graph than the others. The second point is particularly important with the pie chart because mousing over a wedge shows a quantitative breakdown of the comments on a particular subreddit:

[<img class="aligncenter size-full wp-image-84" title="pie details" src="http://www.roadtolarissa.com/wp-content/uploads/2012/10/pie-details.png" alt="" width="207" height="207" />][10]The mouse over detail for all the other, more complicated charts is mostly composed of the text of the comment which is easier to process than sums and averages. The simpler  display of the pie graph allows for comparatively more complicated details.

While removing time from the graph allows for a closer examination of different properties of commenting patterns, it also (obviously) masks how those patterns change over time. One of my initial motivations in undertaking this project was to see if my own habits on Reddit have changed over time, particularly how my commenting on the League of Legends subreddit had changed after I had stopped playing. For that, a sort of  pie chart on a timeline graph was needed, like the histograph from Civilization 3:

[<img class="aligncenter size-full wp-image-88" title="Civ Histograph" src="http://www.roadtolarissa.com/wp-content/uploads/2012/10/Civ-Histograph.png" alt="" width="902" height="690" />][11]

When I tried to find a histograph plugin for though, I ran into a problem:

[<img class="aligncenter size-full wp-image-93" title="Google Search for histograph" src="http://www.roadtolarissa.com/wp-content/uploads/2012/10/Google-Search-for-histograph.png" alt="" width="197" height="32" />][12]Apparently, by &#8216;histograph' Firaxis meant &#8216;history graph', not &#8216;histograph, a term of art describing a type of graph' like I have been assuming they meant for the last 11 years. I've tried finding the actual name for this type of graph, but so haven't been able to unearth one. Undeterred, I implemented a histograph in flot:

[<img class="aligncenter size-full wp-image-94" title="Histograph of Reddit Comments" src="http://www.roadtolarissa.com/wp-content/uploads/2012/10/Histograph-of-Reddit-Comments2.png" alt="" width="634" height="743" />][13]

This graph shows, in a way none of the others would be able to clearly, how rrenaud initially spent most of his time commenting on r/programming but then transitioned to r/gaming, r/MachineLearning, and r/dominion. (Since reddit shows everyone's comments to everyone else, this app can be used to view other user's comment history. Doing so seems a little stalkerish. At the same time, the scatter plot view provides the best, quickest overview of a reddit profile that I've ever seen. By mousing over outliers and fiddling with the plot settings, it is possible to see someone else's most and least popular comments, the posts that they've spent the most time writing and what they wrote when they first started using reddit in seconds. If rrenaud ever comes across this post, hopefully he isn't too weirded out &#8211; the graphs on his excellent [Race to the Galaxy stats page][14] inspired some of my work here and his site preservers [my mediocre rating][15] at the game (In my defense, I lost 10 of my last 11 games; there is probably some sort of connection between the win/loss record and my decision to stop playing))

While the graph is valuable, it need more work. By showing the accumulated number of comments at each time interval instead of the rate of commenting, the start of the graph is extremely sensitive to small changes in commenting patterns while the end doesn’t move near enough. rrenurd essentially doesn’t comment in r/programming anymore but since the graph shows a stock instead of a flow, the graph doesn’t clearly show that information. I’d like a graph of the commenting rate instead, but I’m having trouble creating one which both displays the flow of comments in different subreddits and easily communicates its meaning. Even the current form of the histograph struggles on the communication front – the title of the graph and scale of the y axis need to be changed to better convey the concept of proportions changing over time.

I’ve come a little closer to these goals graphing something similar:[<img class="aligncenter size-full wp-image-103" title="Average Comments per Day" src="http://www.roadtolarissa.com/wp-content/uploads/2012/10/Average-Comments-per-Day.png" alt="" width="898" height="638" />][16]

This graph needs less explanation because “Comments per Day” is an easier idea to communicate than what the histograph is trying to show even though both are reconstructing a flow from discrete points.

I’d still like to improve this graph. In particular, the smoothing algorithm needs more work. Ideally, the leftmost part of the smoother would not have a large gap.  I’ve tried different kernel smoothers and radii but haven’t found anything that is responsive enough to small change in the data without leaving gaps.

Other things to improve:

<ol start="1">
  <li>
    Splitting the graphing code into separate functions based on graph type. I was planning on doing this originally, but as I added more graph types it because less clear which parts of the program were unique to a graph type and which needed to be shared. The code was fairly concise and well organized when the page only showed a scatter plot; now it is a huge mess.
  </li>
  <li>
    I’m really not sure how manage errors that occur when connecting to Reddit’s servers. The console displays a 404 message when the user name doesn’t exist and another message if no connection is made, but I have no idea how to make those events trigger things in my program. Currently, if a valid response isn’t received within 4 seconds an error message is displayed. This isn’t that great of a solution since sometimes Reddit’s servers take more than 4 seconds to reply with a valid response and sometimes they respond with a 404 message is less than 4 seconds. jQuery’s .ajax() has settings to fix this problem, but those callbacks don’t work with JSONP (something else I don’t understand – how does using prevent cross scripting?).
  </li>
  <li>
    The page only uses CSS to position and hide elements. I think everything lines up ok in chrome, but in other browsers it looks pretty bad. Defining the appearance of the buttons and forms so different browsers use the same defined appearance instead of their different defaults would help. I’m hoping I can find a way of making pages look ‘nice’ without having to spend too much time on it; looking into different frameworks is probably a good idea.
  </li>
  <li>
    Watching the graph change as older comments load (Reddit will send a maximum of 100 comments at a time) or slowly increasing the minimum comment length by holding down the button results in a nifty animation. Drawing the graph takes only a few milliseconds, so drawing the graph over and over again with slightly different parameter creates the appearance of motion. All of the graphs could be improved with optional animation. For example, an animated pie chart could show the same information as the histograph while being easier to understand and more engaging to look at. UI issues are preventing me from adding animation to the live version - the page is already getting close to being cluttered and there are huge number of ways to add motion to a graph. I need to figure which animated graphs are best along with a concise way of displaying to option to view them.
  </li>
  <li>
    Allowing users to login with their Reddit information could also improve usability. The Reddit API only exposes friends and voting patterns of the currently logged in user. Displaying a drop down list of those friends would remove the need to copy/paste their strangely spelled names. More interestingly, the same analysis that is performed by the comments could be performed on upvoted content. I think I vote more often and in more places than I comment; that information might provide a better sense of time spent on the site. I suspect that number of votes that Reddit exposes might limit the value of this information. Only the 1000 most recent comments and submissions can be viewed and they same rule probably applies to votes. Since everyone automatically upvotes every comment they make, many of the votes would have to be thrown out. Additionally, votes on comments and submissions should probably be treated separately for everything other than subreddit analysis  which would further reduce number of available data points.
  </li>
  <li>
    There are also comment analytics which are not directly exposed by Reddit. It would be neat to see who replies to you the most and vice versa. Keep track of different commenters on Reddit isn't easy &#8211; I've had several conversations with people I know in person on Reddit and not realized it until they brought it up in real life. Reddit Enhancement Suite helps with this, but I'm still curious  to see how often I actually communicate back and forth with different people. Unfortunately, loading information about each comment's parent and children might take too long to run in a webpage. Assuming 1000 comments each with an average of 1.5 combined parents and children, 1500 requests would take 3000 rate limited seconds to process &#8211; nearly an hour.
  </li>
</ol>

Even considering the above reservations, I'm pretty happy about the current state of this app so I'm going to post it to reddit to get some feedback. I've also been pleasantly surprised about how long this took me to make &#8211; 40 hours of not especially difficult work over a week is still a longish amount of time but it's significantly less than I would have spent a few months ago.

 [1]: http://www.roadtolarissa.com/javascript/reddit-comment-visualizer/
 [2]: http://www.flotcharts.org/
 [3]: http://www.roadtolarissa.com/wp-content/uploads/2012/10/scatter-plot-screen-shot.png
 [4]: http://www.reddit.com/user/1wheel/comments/
 [5]: http://bost.ocks.org/mike/fisheye/
 [6]: http://www.roadtolarissa.com/wp-content/uploads/2012/10/Histogram-of-Length.png
 [7]: http://people.iola.dk/olau/flot/examples/stacking.html
 [8]: http://www.roadtolarissa.com/wp-content/uploads/2012/10/pie-chart.png
 [9]: http://andrewgelman.com/2010/09/thinking_outsid/
 [10]: http://www.roadtolarissa.com/wp-content/uploads/2012/10/pie-details.png
 [11]: http://www.roadtolarissa.com/wp-content/uploads/2012/10/Civ-Histograph.png
 [12]: http://www.roadtolarissa.com/wp-content/uploads/2012/10/Google-Search-for-histograph.png
 [13]: http://www.roadtolarissa.com/wp-content/uploads/2012/10/Histograph-of-Reddit-Comments2.png
 [14]: http://rftgstats.com/
 [15]: http://rftgstats.com/player_1wheel.html
 [16]: http://www.roadtolarissa.com/wp-content/uploads/2012/10/Average-Comments-per-Day.png
