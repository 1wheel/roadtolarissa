---
title: Literate Blogging With Hot Reloading 
template: post.html
permalink: /literate-blogging
draft: true
---

For five years, I was frustrated by every blogging tools I tried. Wordpress made it difficult to embed inline interactive charts. Octopress came with a bunch of predefined css that was difficult to turn off and pasting Stack Overflow tips on run gems without understanding what `renv` or `rvm` were eventually broke my ruby installing. Metalsmith was easier to use, but I was never able to successfully configure the rss plugin.

And none of alternatives I looked at supported [hot reloading](https://roadtolarissa.com/hot-reload).

Writing my own blogging engine seemed like epitome of yak shaving so I put it off until I came across Jeremy Ashkenas's [Jorno](http://ashkenas.com/journo/docs/journo.html) and Rich Harris's [Svelte blog](https://github.com/sveltejs/svelte.technology/blob/1fc419a37aa47cc54eaa8e65661bd80894a653b0/scripts/prep/build-blog.js) last summer. Using their code as a starting point, I spent a lazy Sunday simplifying my setup. 

<div id='graph'></div>

How does it work? Static files that don't need preprocessing, like images or javascript, are copied from `source/` to `public/` with `rysnc`. Directories with non-static files are skipped over with `--exclude`.

```javascript
var fs = require('fs')
var {exec, execSync} = require('child_process')

var public = `${__dirname}/../../public`
var source = `${__dirname}/../../source`

function rsyncSource(){
  exec(`rsync -a --exclude _posts/ --exclude _templates/ ${source} ${public}`)
}
rsyncSource()
```

Posts are written in markdown, syntax highlighted by [highlight.js]() and converted to HTML by [marked](). 

```javascript
var hljs = require('highlight.js')
var marked = require('marked')
marked.setOptions({
  highlight: (code, lang) => hljs.highlight(lang, code).value,
  smartypants: true
})
```

Files in the `_templates` directory, currently `rss.xml`, `sitemap.xml` and  `post.html`,  are converted to ES6 template strings with `eval`. This would be risky with user entered data, but when you're writting the code and content you can cut corners.

```javascript
var templates = {}
fs.readdirSync(`${source}/_templates`).forEach(path => {
  var str = fs.readFileSync(`${source}/_templates/${path}`, 'utf8')
  templates[path] = d => eval('`' + str + '`')
})
```

Each post is a markdown file in the `_posts` folder.  They're read in with `parsePost`and stored in `posts` array.

Instead of having to install and configure a plugin, setting up an rss feed here just requires passing the array of posts to the `rss.xml` template and writting out a file. 

```javascript
var posts = fs.readdirSync(`${source}/_posts`).map(parsePost)
fs.writeFileSync(public + '/rss.xml',  templates['rss.xml'](posts))
fs.writeFileSync(public + '/sitemap.xml', templates['sitemap.xml'](posts))
```

Read post path and write to `public/`

```javascript
function parsePost(path){
  var [top, content] = fs.readFileSync(`${source}/_posts/${path}`, 'utf8')
    .replace('---\n', '')
    .split('\n---\n')

  var meta = {}
  top.split('\n').forEach(line => {
    var [key, val] = line.split(': ')
    meta[key] = val
  })

  var html = marked(content)
  var slug = path.split('.')[0]
  var date = slug.substr(0, 10)
  var post = {slug, date, meta, html}

  var dir = public + meta.permalink
  if (!fs.existsSync(dir)) execSync(`mkdir -p ${dir}`)
  fs.writeFileSync(`${dir}/index.html`, templates[post.meta.template](post))

  return post
}
```

And that's all the code that's needed to build the blog!

To get it on the internet `npm run publish` runs [lit-node](TKTKT) on this post to regenerate everything locally and uses `rsync` again to copy the `public` directory to a remote folder that's being statically served.

```json
"scripts": {
  "publish": "lit-node source/_posts/2017-11-12-literate-blogging.md && 
    rsync -a public/ demo@roadtolarissa.com:../../usr/share/nginx/html/",
  "start": "lit-node source/_posts/2017-11-12-literate-blogging.md --watch & 
    cd public/ && 
    hot-server"
}
```

`npm run start` runs [hot-server](https://github.com/1wheel/hot-server) in the `public` folder and runs this post with the `--watch` flag. Changes in the `source` directory rerun `rsyncSource`, which copies the the update file to `public`, triggering hot-server's file watch and passing the file to browser along a websocket. A little rube goldberg, but still plenty fast and simpler than rewritting hot-server here.  

Edits to posts are trigger 

```javascript
if (process.argv.includes('--watch')){
  require('chokidar').watch(source).on('change', path => {
    console.log(path)

    if (path.includes('_posts/')) parsePost(path.split('_posts/')[1])
    rsyncSource()
  })
}
```

This is that post on every blog about how the blog is set up
thx everyone

over engineered nicar setup