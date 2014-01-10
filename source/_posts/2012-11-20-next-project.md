---
title: Next Project
author: admin
layout: post
permalink: /next-project.html
categories:
  - Uncategorized
---
Finished with redditgraphs, I have a couple of ideas about what I'd like to work on next; I'm posting them to clarify my own thoughts and to get feedback.

**Games  
**

*    *Hangout Boardgames*  
    I hadn't touched this project in about a month until two days when I started working on it again. I added [backgammon][1], fixed some bugs, and made it publicly accessible on [Google+][2] (I think). Before sharing it with more people, the UI common to each game needs some more work. I think the concept is better than all the other hangout apps I've seen &#8211; instead of having the game board take up the entire screen, the game takes place entirely on a small (on most screens) 400&#215;400 tile and the video feed from your opponent fills the rest of the space. The UI to switch teams and change the game is very spartan. I'd to make it better but I'm having trouble finding a solution that doesn't clash individual games differing art styles:  
    [<img class="aligncenter size-full wp-image-140" title="Board Game UI" src="http://www.roadtolarissa.com/wp-content/uploads/2012/11/Board-Game-UI.png" alt="" width="434" height="482" />  
    ][3]Rejoining a hangout also causes a mysterious crash about 20% of the time, which needs to be fixed before release.
*    *Lyric Typing Game*  
    Over the summer, I made a rudimentary typing game for Spotify. Pulling lyrics from tunewiki, it displays the word as they are being sung and the user tries to type them before they finish playing. It'd be really cool to make this app available on spotify, unfortunately licencing lyrics is super expensive (minimum [$20,000][4]). I might try to contact providers of tunewiki to see if they want to include the game in their own spotify application or at the very least make a post about the app and record a video of it working.
*   *Neocolonialism*  
    Over the summer, I exchanged several lengthy emails with Seth Alter, the creator of [Neocolonialism][5]. Playing  the game with my friends was great, but we ran into several nasty bugs. I sent him an email with game play suggestions and an offer to help debug the game. After corresponding for a few days, he took me up on the offer but I got nervous and didn't respond for two weeks. He didn't reply (understandably) and I haven't talked with him since, but I'd still really to help out. I don't think it would be super hard for me to make a demo version of the game for google hangouts. Playing on hangouts would automatically integrate voice and video while avoiding many of the hangups that make it difficult to get the game up and running &#8211;  currently, everyone has to separately install the game, type in the correct IP address, and fix router issues. Before contacting Seth again, I should finish up the the board game app in order to have a solid proof of concept. I'm not sure I'll get a response &#8211; we're still on each other's gtalk friends list, but I've been removed from the &#8216;Thnx' section of the rulebook &#8211; still, trying probably won't hurt anything.

**Visualizations**

*   *Whitehouse Petitions  
    *In response to Obama's reelection, secessionists posted a [petition ][6]requesting &#8220;Peacefully grant the State of Texas to withdraw from the United States of America and create its own NEW government \[sic\].&#8221; By scraping the page for the locations of all the signers, this [graph][7] was generated: [<img class="aligncenter size-large wp-image-151" title="T1NYT" src="http://www.roadtolarissa.com/wp-content/uploads/2012/11/T1NYT1-1024x675.png" alt="" width="640" height="421" />][8]While there are a number of problems with the graph -the locations should be exaggerated by county instead of city and it needs to show density instead of logged total numbers &#8211; the idea is very good. I would like expand both the types of graphs shown &#8211; the rate of signing, the gender of signers, the predicted partisanship of the signers &#8211; and the number of petitions. There are dozens of active petitions and if everything was automated, it would not be hard to rescrape and update the graphs once a day.
*   *More redditgraphs*  
    I'd like to generate more user specific statistics using comment history text pulled from the reddit API. I've read several papers which used text corpora from blogger, twitter,  and youtube to predict user age and gender. Doing the same with reddit comments is feasible, but the lack of a training set (reddit has no user profile page) and structural limitations with the reddit API make the task much more more difficult than it should be. Since I'm taking a break from reddit, I'm putting this idea on hold for a while.
*   *Pitchfork Statistics *  
    Scrape the text, date, score, author and band information from every published review on pitchfork to see the score distribution, what words correlate with better scores, and how word usage has changed during the site's history.

 [1]: http://www.roadtolarissa.com/javascript/hangout-boardgames/
 [2]: https://plus.google.com/hangouts/_?gid=687984412875
 [3]: http://www.roadtolarissa.com/wp-content/uploads/2012/11/Board-Game-UI.png
 [4]: https://developer.musixmatch.com/
 [5]: http://subalterngames.com/
 [6]: https://petitions.whitehouse.gov/petition/peacefully-grant-state-texas-withdraw-united-states-america-and-create-its-own-new-government/BmdWCP8B
 [7]: http://www.reddit.com/r/dataisbeautiful/comments/13853n/texas_secession_petition/
 [8]: http://www.roadtolarissa.com/wp-content/uploads/2012/11/T1NYT1.png
