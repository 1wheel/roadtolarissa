---
template: post.html
title: Kindle Tracker
permalink: /kindle-tracker
shareimg: http://roadtolarissa.com/images/posts/kindle-tracker.png
---

<link rel="stylesheet" type="text/css" href="/kindle-tracker/style.css">

<script src="/kindle-tracker/d3v4.js"></script>
<script src="/kindle-tracker/lodash.js"></script>
<script src="/kindle-tracker/script.js"></script>
<script src="/kindle-tracker/bbox-collide.js"></script>


Curious about how much and when I read on my Kindle, I decided to try and make some charts. Unfortunately while Amazon [tracks](http://www.npr.org/2010/12/15/132058735/is-your-e-book-reading-up-on-you) your Kindle page turns, it doesn't allow you to see your own reading data. 

There are a couple of existing workarounds, none of which really do what I was looking for. [David Shackelford](http://www.dshack.net/2014/11/04/tracking-reading-statistics-on-the-kindle/) points out that the "Kindle FreeTime" program for managing kids' reading displays some rudimentary tracking information. However, the stats only include cumulative progress and time read, and aren't exportable. 

[Matthew Suozzo](https://github.com/msuozzo/Lector) wrote a scraper for Kindle Cloud Reader that can look up your currently reading progress for books purchased from Amazon. Since Cloud Reader doesn't support PDF or epub uploads and requires that your Kindle be online to update reading progress, I decided not to use it.

I even briefly considered taking [screen shots](http://lifehacker.com/take-screenshots-on-almost-any-kindle-device-1522639097) and OCRing the images, but that seemed a little too hacky even for me. 

I found a solution poking around the Kindle file system and using `diff -rq`. The `/Volumes/Kindle/system/userannotlogsDir/` has files that contain jsonish blobs: 

```json
-919642717={"annotationData":{"readingStartTime":"1487899696790","readingStartPosition":"40394"},"modificationDate":"2017-02-24T01:28:24Z","contentReference":{"format":"Mobi8","guid":"CR!T3V6D4070H58D8YGEY5BYTNYXBV8:F1A7EE2F","asin":"B00H7WPC4S","type":"EBOK","version":0},"action":"Create","position":{"pos":110998,"state":"0001b196","begin":110998},"type":"LastPositionReadAnnotation"}
-710224237={"annotationData":{"readingStartTime":"1487899696790","readingStartPosition":"40394"},"modificationDate":"2017-02-24T01:28:31Z","contentReference":{"format":"Mobi8","guid":"CR!T3V6D4070H58D8YGEY5BYTNYXBV8:F1A7EE2F","asin":"B00H7WPC4S","type":"EBOK","version":0},"action":"Create","position":{"pos":110998,"state":"0001b196","begin":110998},"type":"LastPositionReadAnnotation"}
-143412032={"annotationData":{"readingStartTime":"1487899696790","readingStartPosition":"40394"},"modificationDate":"2017-02-24T01:41:05Z","contentReference":{"format":"Mobi8","guid":"CR!T3V6D4070H58D8YGEY5BYTNYXBV8:F1A7EE2F","asin":"B00H7WPC4S","type":"EBOK","version":0},"action":"Create","position":{"pos":113594,"state":"0001bbba","begin":113594},"type":"LastPositionReadAnnotation"}
```


After reading a few pages and plugging the Kindle in, another line with the current time and reading position gets added to the log file. To collect the files before they're deleted, I set up a cron job to copy them to my computer: 

```bash
cp -R /Volumes/Kindle/system/userannotlogsDir/* /Users/adam/kindle-tracker/logs/
```

Since these files aren't quite JSON, they need a little bit parsing to be usable: 

```js
var data = file.split('\n')
  .filter(d => d)   // remove trailing lines
  .map(function(d){
    var obj = JSON.parse(d.split('=')[1])

    obj.date = d3.isoParse(obj.modificationDate)
    obj.pos  = obj.position.pos
    obj.isbn = obj.contentReference.asin

    return obj
  })
```

Slap on a bit of d3, and we're good to go: 

<div id='kindle-slope'></div>

Sadly, connecting to the internet clears the logs so I've only got a couple of days' worth. It looks like checking footnotes can mess up the position tracking, but hopefully in a few months I'll have enough data to make something interesting.

While not nearly as comprehensive, there is one source of historic data that the Kindle doesn't clear: a record of word lookups. `system/vocabulary/vocab.db` contains the book, time and context of each word look up. Lots accidental long presses, but it is fun look to back and see what words I didn't know: 

<div id='kindle-vocab'></div>

Turns out I don't do much reading at 5 AM. Who knew that data visualization could be so informative!

If you're interested in tracking your own reading, checkout the [code on github](https://github.com/1wheel/kindle-tracker).

