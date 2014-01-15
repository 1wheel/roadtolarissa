---
title: Redditgraphs Retrospective
author: admin
layout: post
permalink: /redditgraphs-retrospective
categories:
  - Uncategorized
---
It's been nearly a month since my last post, about a comment visualizer I created for reddit. Since then, I've mostly been polishing the application and trying to share it with people. After posting the basic demo on /r/javascript, I was encouraged make improvements and host the project on its own domain. Registering &#8220;[redditgraphs.com][1]&#8221; for a year only cost $5 and it seemed more memorable and easier to access than &#8220;roadtolarissa.com/javascript/reddit-comment-visualizer&#8220;. I spent another week adding functionality &#8211; hourly trends, weekly trends, direct linking to user names &#8211; and making the UI prettier.

Improving the UI was harder than adding functionality. I don't think I've ever created anything particularly visually beautiful before in my life. The previous UI was definitely not pretty but since I was using the default radio button and drop down menus, it didn't feel like I was exposing part of myself or actively making something bad or mockable. Still, several changes were necessary to improve usability. Most importantly, the previous graph picker was too small and did not attract enough attention:

[<img class="aligncenter size-full wp-image-114" title="Old Graph Type" src="http://www.roadtolarissa.com/wp-content/uploads/2012/11/overview3.png" alt="" width="180" height="130" />][2]

One of the biggest difficulties in creating this type of interactive display is leading the user to interesting interactions. After posting this version, I received several requests to add histograms and karma plotting &#8211; features already included, but buried in ambigously titled drop down menus. I had thought putting the options in the upper left hand corner would make them impossible to miss. Since that wasn't the case, I used large, tile-like icons to draw even more attention to the different graph types in the redesign:

[<img class="aligncenter size-full wp-image-115" title="New Graph Types" src="http://www.roadtolarissa.com/wp-content/uploads/2012/11/overview4.png" alt="" width="221" height="410" />][3]

By making the icons the largest, most colorful non graph item on the page, it is much clearer that they are supposed to be clicked on and played with. Additionally, convanying the opitions in a less textual manner allowed me to move away from the confusing &#8220;Graph Settings: Graph Type: Type&#8221; formulation. I think there is still a lot of room for improvement, especially on the data icons, but I'm not sure how to do it without learning a lot more or paying something. The pile of books and the ruler look like clip art because that's what they are.

The rest of the redesign followed a similar pattern. All the radios and spinboxes were replaced by more clickable and colorful buttons and sliders. I added a banner and logo at the top, which took much longer than I excepted to get just right.

This was the result:

[<img class="aligncenter size-large wp-image-109" title="Changes to redditgraphs" src="http://www.roadtolarissa.com/wp-content/uploads/2012/11/overview-1024x717.png" alt="" width="640" height="448" />][4]

&nbsp;

Satisfied with both the look and functionality, I posted a link and a description to /r/dataisbeautiful. The surprising amount of the feedback was almost entirely positive and several thousand people visited the site. This was very exciting &#8211; I'm don't think anything else I've done has ever been used by so many people in so short a time. I also tweeted links  to several tech journalists and one ended up writing a short article.

Afterwords, I spent a few days making some of the suggested improvements &#8211; viewing submissions as well as comments, adding the option to log scale some of the axes, and direct linking to different graph types. Around this time, working with the code started to become much more unpleasant. The main culprit was (and is) the function that takes raw data download from reddit and transforms it into a graph. Since I hadn't anticipated having so many options, features were added one at a time until the thing started to resemble a huge knot.

Encouraged by the suggestions to share the site with more people, I posted links on some of the default subreddits. Unfortunately, the reception wasn't nearly as positive. Some of the time, my posts were basically ignored (/r/WTF, /r/YouShouldKnow) without many people seeing them. More often, they would would start doing well and than get removed by a moderator for being off topic (/r/askreddit, /r/technology, /r/LifeProTips, /r/offbeat).

When a post or a comment did do moderately well and directed thousands of more people to the site, it wasn't nearly as exciting as it was the first time &#8211; it had already happened before  and since it seemed almost achievable to get 100,000+ or 1,000,000 people to the site, I was always disappointed when that didn't happen. Additionally, while the feedback was still positive, it became more and more inane. After getting over a dozen of comments about the lack of axis labels (including three people who sent [the same xkcd][5]), I added them against my better judgement (they take up valuable space and don't add any valuable information &#8211; the graph title and selected image very clearly shows what is being graph; is it really necessary to clarify that a series of dates along the bottom of a graph refer to &#8216;time'?).  I tried using more playful, [Cracked][6] like titles: &#8220;Your Reddit Comments Show When You Sleep&#8221; and the majority of the comments made the same joke about how the comments really showed when they were at work.

I also tried sending the site to more journalists and bloggers. Reddit adds a nofollow attribute to all links submitted, so getting more organic traffic from people searching for &#8216;reddit comment history' required posts on separate sites. Aside from the first success, I didn't have any success. After reading [Trust Me, I'm Lying][7], I thought it would be, if not easy, at least doable to get story starved bloggers to write a post about redditgraphs. Based on the limited experience I had, I'd recommend anyone trying the same to find an actual person's email address rather than using a contact form or tips@website.com email Some of the [sites I tried submitting to][8] seemed kind of &#8230; sleezy:

[<img class="aligncenter size-full wp-image-121" title="MakeUseOf" src="http://www.roadtolarissa.com/wp-content/uploads/2012/11/makeusof.png" alt="" width="599" height="155" />][9]

During most of the this time, I wasn't really doing anything productive. It was super easy to write up a post or an email and then sit around writing responses and browsing reddit for a few too many hours. To avoid this problem without giving up hope on getting more users, I spent a few days learning python and [wrote a bot][10] to scan recent comments for mentions of &#8216;your comment history' or &#8216;my comment history' and reply with a link to the mentioned person's redditgraph. Initially, I manually copied/pasted the comments and only posted a few per day. Seeing that 75% of the replies to the &#8216;bot' were positive, I decided to totally automate its posting and expand the number of terms it searched for. The maker of the the [statit][11] contacted me on gtalk, telling me that I should throttle or turn off the bot or the admins would ban it. I knew he was probably right, I couldn't bring myself to disable to continuous stream of comments I was creating. The thrill I got from redditgraphs came primarily from the idea that thousands of people around the world were using their computers to simultaneously automate a process that I had shared with them; with the commenting bot the sharing itself was automated.

[<img class="aligncenter size-full wp-image-123" title="redditbot comment" src="http://www.roadtolarissa.com/wp-content/uploads/2012/11/makeusof2.png" alt="" width="852" height="88" />][12]

The next morning, the bot was banned.

Getting responses and posting wasn't fun anymore, so I've decided to stop posting on reddit. While I did learn more about reddit and communicated with admins, moderators, and bloggers more than I had before, I don't think it is the most useful topic to learn about and I didn't need to spend weeks on it. I definitely don't need to need more time making the greenlines on this graph go up higher:

<p style="text-align: center;">
  <a href="http://www.roadtolarissa.com/wp-content/uploads/2012/11/bwgraph.png"><img class="aligncenter  wp-image-127" title="Traffic graph for redditgraphs" src="http://www.roadtolarissa.com/wp-content/uploads/2012/11/bwgraph.png" alt="" width="800" height="400" /></a>
</p>

One more generally applicable thing I found out: feedback isn't helpful in terms of adding features. Before the redesign no one was asking for large icons instead of drop down menu, but from all the comments asking about different graph types I inferred that they needed to be added. One of the more useful features I came up with allowed for searching for specific phrases in the comment history. This didn't get added to the live version mainly because I wasn't sure how to add it to the UI &#8211; should there be a user name text box and a search text box right on top of each other? Requiring people to typing in a regex didn't seem feasible, but where would the rules of a simpler syntax be communicated? I assumed that someone would ask for searching and I would have a reason to add it, but no one did and I never got around to it.

A small proportion of the comments were useful, maybe 10 or 20 out out of the ~250 that I received. That number is even more miniscule compared to the total number number of people who have viewed the site:

[<img class="aligncenter size-full wp-image-129" title="makeusof" src="http://www.roadtolarissa.com/wp-content/uploads/2012/11/makeusof3.png" alt="" width="508" height="123" />][13]

It makes sense that most people wouldn't send feedback &#8211; I look at lots of things people have made on the internet and I write something back to the creator far less than 1% of the time. This highlights the importance of having a clear idea of what you'd like to make and generating and refining your own work towards that idea. Getting feedback in the form of a conversation with someone you actually know before sharing widely is also extremely valuable. Unlike your actual friends, internet commenters don't have any incentive to engage deeply with your idea and most don't end up doing so.

I've been working on a few smaller projects since. Nothing is super finished, but I should have a post about the works in progress up later today.

 [1]: www.redditgraphs.com
 [2]: http://www.roadtolarissa.com/wp-content/uploads/2012/11/overview3.png
 [3]: http://www.roadtolarissa.com/wp-content/uploads/2012/11/overview4.png
 [4]: http://www.roadtolarissa.com/wp-content/uploads/2012/11/overview.png
 [5]: http://xkcd.com/833/
 [6]: http://www.cracked.com/
 [7]: http://www.onthemedia.org/2012/jul/27/trust-me-im-lying/transcript/
 [8]: http://www.makeuseof.com/contact/
 [9]: http://www.roadtolarissa.com/wp-content/uploads/2012/11/makeusof.png
 [10]: https://github.com/1wheel/reddit-comment-visualizer/blob/master/commentbot.py
 [11]: http://stattit.com/
 [12]: http://www.roadtolarissa.com/wp-content/uploads/2012/11/makeusof2.png
 [13]: http://www.roadtolarissa.com/wp-content/uploads/2012/11/makeusof3.png
