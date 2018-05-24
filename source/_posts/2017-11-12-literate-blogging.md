---
title: Literate Blogging With Hot Reloading 
template: post.html
date: 2017-11-12
permalink: /literate-blogging
draft: true
---

For five years, I was frustrated by every blogging engine I tried. 

WordPress made it difficult to embed inline interactive charts. Octopress's predefined css was hard to disable and pasting Stack Overflow instructions on installing gems without understanding what `renv` or `rvm` were eventually broke my ruby installation. Metalsmith was easier, but I never managed to successfully configure the rss plugin.

And none of alternatives I looked at supported [hot reloading](https://roadtolarissa.com/hot-reload).

Writing my own blogging software seemed like epitome of yak shaving. I thought it would be difficult, too,  until I came across Jeremy Ashkenas's [Jorno](http://ashkenas.com/journo/docs/journo.html) and Rich Harris's [Svelte blog](https://github.com/sveltejs/svelte.technology/blob/1fc419a37aa47cc54eaa8e65661bd80894a653b0/scripts/prep/build-blog.js) last summer. Using their code as a starting point, I spent a lazy Sunday simplifying my setup. 

Now this site is built with just **60 lines of code**. And they're run directly off of this post.

<div id='graph'></div>

## How It Works

Each post is a markdown file in the `source/_posts` folder. The posts get read in, parsed and written out to `public/` as an HTML file using one of templates from `source/_templates`.

Static files that don't need preprocessing, like images or javascript, are copied directly from `source/` to `public/` with `rysnc` in preperation for publishing. 

```javascript
var fs = require('fs')
var {exec, execSync} = require('child_process')

var public = `${__dirname}/../../public`
var source = `${__dirname}/../../source`

function rsyncSource(){
  exec(`rsync -a --exclude _posts --exclude _templates ${source}/ ${public}/`)
}
rsyncSource()
```

Markdown is converted to HTML with [marked](https://github.com/markedjs/marked) and syntax highlighted by [highlight.js](). 

```javascript
var hljs = require('highlight.js')
var marked = require('marked')
marked.setOptions({
  highlight: (code, lang) => hljs.highlight(lang, code).value,
  smartypants: true
})
```

Files in the `_templates` directory, currently `rss.xml`, `sitemap.xml` and  `post.html`,  are ES6 template strings.  `eval` turns them into functions that can be passed data. This could be risky, but writting both the code and content lets you cut corners.

```javascript
var templates = {}
readdirAbs(`${source}/_templates`).forEach(path => {
  var str = fs.readFileSync(path, 'utf8')
  var templateName = path.split('_templates/')[1]
  templates[templateName] = d => eval('`' + str + '`')
})

function readdirAbs(dir){ return fs.readdirSync(dir).map(d => dir + '/' + d) }
```

Each post file in the `source/_posts` folder is read in with `parsePost` and saved the `posts` array.

Instead of having to install and configure a plugin, I created an rss feed by passing the array of posts to the `rss.xml` template and writting out a file. 

```javascript
var posts = readdirAbs(`${source}/_posts`).map(parsePost)
fs.writeFileSync(public + '/rss.xml',  templates['rss.xml'](posts))
fs.writeFileSync(public + '/sitemap.xml', templates['sitemap.xml'](posts))
```

Passed the path of a post, `parsePost` reads the title, url, date and publish status from [front matter](https://jekyllrb.com/docs/frontmatter/) at the top of the post. The markdown body is converted to a HTML fragrament and an object representing the post is returned.

```javascript
function parsePost(path){
  var [top, body] = fs.readFileSync(path, 'utf8')
    .replace('---\n', '')
    .split('\n---\n')

  var post = {html: marked(body)}
  top.split('\n').forEach(line => {
    var [key, val] = line.split(': ')
    post[key] = val
  })

  return post
}
```

`writePost` takes a post object, creates a folder for it in `public/`, runs it through a template and writen out the post as an HTML file. 

```javascript
function writePost(post){
  var dir = public + post.permalink
  if (!fs.existsSync(dir)) execSync(`mkdir -p ${dir}`)
  fs.writeFileSync(`${dir}/index.html`, templates[post.template](post))
}
posts.forEach(writePost)
```

And that's all the code that's needed to build the blog!

To everything on the internet `npm run publish` runs [lit-node](TKTKT) on this post to regenerate everything locally and uses `rsync` again to copy the `public` directory to a remote folder that's being statically served.

```json
"scripts": {
  "publish": "lit-node source/_posts/2017-11-12-literate-blogging.md && 
    rsync -a public/ demo@roadtolarissa.com:../../usr/share/nginx/html/",
  "start": "lit-node source/_posts/2017-11-12-literate-blogging.md --watch & 
    cd public/ && hot-server"
}
```

`npm run start` runs [hot-server](https://github.com/1wheel/hot-server) in the `public` folder and runs this post with the `--watch` flag. Changes in the `source` directory rerun `rsyncSource`, which copies the the update file to `public`, triggering hot-server's file watch and passing the file to browser along a websocket. A little Rube Goldberg, but still plenty fast and simpler than rewritting hot-server here.  

Edits to a post rebuild just that post, making hot-server trigger a page reload.

```javascript
if (process.argv.includes('--watch')){
  require('chokidar').watch(source).on('change', path => {
    console.log(path)
    rsyncSource()

    if (path.includes('_posts/')) writePost(parsePost(path))
  })
}
```

I don't spend much time looking at `sitemap.xml` or tweaking the templates, so automatically updates aren't hooked up to those. I've tried to only implement exactly what I need without any unnessary abstractation to keep the code easy to work with.

## Make Your Own

I'm not totally sold on literate programming yet. I quite liked the having all the code fit on one screen and [⌘-B](https://www.sublimetext.com/docs/3/build_systems.html) doesn't work out of the box. But I've been asked a couple




<link rel="stylesheet" type="text/css" href="style.css">
<script src='../worlds-group-2017/d3_.js'></script>
<script src='_script.js'></script>
<script src='../worlds-group-2017/swoopy-drag.js'></script>


<!-- This is that post on every blog about how the blog is set up
thx everyone

over engineered nicar setup 



TODO

- sylink atom to rss

-->