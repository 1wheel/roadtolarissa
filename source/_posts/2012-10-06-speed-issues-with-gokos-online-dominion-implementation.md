---
title: "Speed Issues Goko Dominion"
author: admin
template: post.html
permalink: /speed-issues-with-gokos-online-dominion-implementation
categories:
  - Uncategorized
---
This isn't very scientific, but to get a better sense of how slow playing [Dominion][1] on  [goko][2] is compared to [isotropic][3] and to find out exactly what is making it slower, I spent an hour on both and recorded how the time was spent:

> 2\.17 &#8211; Log in  
> 2\.18 &#8211; Create table  
> 2\.19 &#8211; Game loads  
> 2\.24 &#8211; Try playing a feast to gain a witch. Feast is outlined in blue, but clicking on it does nothing.  
> 2\.25 &#8211; After clicking on feast for some time, it finally leaves my hand and I'm able to get a witch  
> 2\.37 &#8211; Game ends after 22 turns  
> 2\.37 &#8211; Try to join a new game  
> 2\.39 &#8211; Loading bar stuck at 1/10 of the way. Reload Page.  
> 2\.41 &#8211; Log back in, create new table  
> 2\.43 &#8211; Start game  
> 2\.58 &#8211; Game ends after 19 turns  
> 2\.59 &#8211; Create Table  
> 3\.09 &#8211; Finally start game  
> 3\.20 &#8211; &#8220;Internet Connect Lost &#8211; Press Ok to Reload Page&#8221; after 13 turns.

I'm currently streaming music and clicking through google reader, so I'm pretty sure the problem is on their end. Clicking &#8220;Ok&#8221; does not reload the page. Pressing f5 brings up an alert warning me that &#8220;Leaving this page will end any game in progress&#8221; which is a silly warning since the game has already effectively ended. It has been over an hour, so I switch to isotropic:

> 3\.31 Enter isotropic queue and start game  
> 3\.36 Game ends after 16 turns. If cellar is any indication, vault would be awful on goko.  
> 3\.43 Game ends after 16 turns.  
> 3\.48 Game ends after 18 turns. Start a new one  
> 3\.53 19 Turns  
> 4\:07 19 Turns &#8211; The longest game on isotropic used Possession and Platinums and takes as much time as the shortest completed game on goko which used the base set.  
> 4\.13 11 Turns  
> 4\:20 22 Turns  
> 4\.30 21 Turns

So, in an hour I was able to play 8 games on isotropic and (generously) 3 on goko.

Assuming goko implements a quick play button (which they have shown no interest in doing), speeds up game loading (Ads between games will probably make things faster ? Even if you've purchased sets, if you're playing with anyone who hasn't, you'll have to wait&#8230;), and fixes the issues with the game crashing on load (which they are probably working on) so the time it takes to get in a game becomes negligible like it is on isotropic, goko would still be substantially slower:

On isotropic, 60 minutes /8 games = 7.5 minutes per game.  
On goko, (18+15+11) / 2.7 games = 16.3 minutes per game.

Why is goko so slow? Contrary what I initially thought and what I've seen suggested several times on [f.ds][4], the issue isn't animations. The unofficial iOS app has animations and it isn't too difficult to play a game in 4 minutes or less. The problem is with how goko has written their app. Testing with wireshark and a stopwatch both confirm that taking any action requiring server side interaction on goko requires about 3 or 4 seconds before the UI will be ready for the next action. On isotropic, I haven't seen it take more then 600 ms. goko compounds this problem by requiring unnecessary server side interaction. I've [reported][5] this problem, but I don't think they realize how big of a problem it is:

> There isn't any need for the server to know what order I've clicked on the chapel\cellar\vault cards so I'm not sure why the client has to send that information and wait on a response while I'm growing impatient. Isotropic gets around this issue with checkboxes and the iOS dominion app uses check marks on the selected cards. In addition to making the game play faster, their implementation also reduces the impact of miss clicks since checks can be unmarked before confirming the move.

On their own, these delays make playing the bots alone frustrating but are tolerable enough. With multiple players though, the delays start to snowball as each player anticipates the other taking longer and longer until the game isn't playable.

*This was originally a [forum post][6]; since part of the purpose of blog is to collect things I've written instead of having everything float away in comment threads, I'm saving it here. Additionally, the [creator of Dominion replied][7] to me so this is probably the most meaningful thing I've ever done.*

 [1]: http://boardgamegeek.com/boardgame/36218/dominion
 [2]: http://goko.com/games/
 [3]: http://dominion.isotropic.org/play
 [4]: http://forum.dominionstrategy.com/
 [5]: http://forum.dominionstrategy.com/index.php?topic=4738.msg110781#msg110781
 [6]: http://forum.dominionstrategy.com/index.php?topic=4895.msg115584#msg115584
 [7]: http://forum.dominionstrategy.com/index.php?topic=4895.msg115742#msg115742
