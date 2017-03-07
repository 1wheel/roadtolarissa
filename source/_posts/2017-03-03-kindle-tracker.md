---
template: post.html
title: "Kindle Tracker"
permalink: /kindle-tracker
shareimg: http://roadtolarissa.com/images/posts/kindle-tracker.png
---

<link rel="stylesheet" type="text/css" href="/kindle-tracker/style.css">

<script src="/kindle-tracker/d3v4.js"></script>
<script src="/kindle-tracker/lodash.js"></script>
<script src="/kindle-tracker/script.js"></script>


Curious about how much and when I read on my kindle, I decided to try make some charts. Unfortunately while Amazon [tracks](http://www.npr.org/2010/12/15/132058735/is-your-e-book-reading-up-on-you) your kindle page turns, it doesn't allow you to see your own reading data. 

There are a couple of existing workarounds, none of which really do what I was looking for. [David Shackefold](http://www.dshack.net/2014/11/04/tracking-reading-statistics-on-the-kindle/) points out that the "Kindle FreeTime" program for managing children's electronics usage displays some rudimentary tracking information. The stats only include cumulative progress and time read though and aren't exportable. 

[Matthew Suozzo](https://github.com/msuozzo/Lector) wrote a scraper for Kindle Cloud Reader that can look up your currently reading progress for books purchased from Amazon. Since Cloud Reader doesn't support PDF or epub uploads and requires that your kindle be online to update reading progress, I decided not to use it.

I even briefly considered taking [screen shots](http://lifehacker.com/take-screenshots-on-almost-any-kindle-device-1522639097) and OCRing the images, but that seemed a little too hacky even for me. 

I found a solutions poking around the file systems on my kindle (using `diff -rq kindle-dump-a kindle-dump-b`). The `/Volumes/Kindle/system/userannotlogsDir/` has files that contain json blobs: 

```
-1196427217={"annotationData":{"readingStartTime":"1487899696790","readingStartPosition":"40394"},"modificationDate":"2017-02-24T01:28:24Z","contentReference":{"format":"Mobi8","guid":"CR!T3V6D4070H58D8YGEY5BYTNYXBV8:F1A7EE2F","asin":"B00H7WPC4S","type":"EBOK","version":0},"action":"Create","position":{"pos":110998,"state":"0001b196","begin":110998},"type":"LastPositionReadAnnotation"}
-710224237={"annotationData":{"readingStartTime":"1487899696790","readingStartPosition":"40394"},"modificationDate":"2017-02-24T01:28:31Z","contentReference":{"format":"Mobi8","guid":"CR!T3V6D4070H58D8YGEY5BYTNYXBV8:F1A7EE2F","asin":"B00H7WPC4S","type":"EBOK","version":0},"action":"Create","position":{"pos":110998,"state":"0001b196","begin":110998},"type":"LastPositionReadAnnotation"}

...
```

After reading a few pages and plugging the kindle in, another line with the current time and reading position gets added to the log file. Files are removed after connecting the kindle to the internet. To collect the files before they're deleted, I set up a cron job to copy them to my computer: 

```
cp -R /Volumes/Kindle/system/userannotlogsDir/* /Users/adam/kindle-tracker/logs/
```

Since these files aren't quite JSON, they need a little bit parsing to be usable: 

```{js}
var data = file.split('\n')
  .filter(d => d)   // remove trailing lines
  .map(function(d){
    var obj = JSON.parse(d.split('=')[1])

    obj.date = d3.isoParse(obj.modificationDate)
    obj.pos  = obj.position.pos
    obj.isbn = obj.contentReference.asin

    obj.key = d.split('=')[0].trim()
    return obj
  })
```

Slap on a bit of d3, and we're good to go: 

<div id='kindle-slope'></div>

I've only got a couple of days of logs and it looks like checking footnotes can mess up the position tracking, but hopefully in a few months I'll have enough data to make something interesting.





