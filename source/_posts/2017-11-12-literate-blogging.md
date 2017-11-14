---
title: Literate Blogging
template: post.html
permalink: /literate-blogging
draft: true
---

Run with: 
```bash
lit-node source/_posts/2017-11-12-literate-blogging.md --watch
```


This is that post on every blog about how the blog is set up

http://ashkenas.com/journo/docs/journo.html

and

https://github.com/sveltejs/svelte.technology/blob/master/scripts/prep/build-blog.js

tk tk literate comments, more words

```javascript
var fs = require('fs')
var { exec, execSync } = require('child_process')

var marked = require('marked')
var hljs = require('highlight.js')
var unescape = require('unescape')
var chokidar = require('chokidar')

var public = `${__dirname}/../../public`
var source = `${__dirname}/../../source`

// convert _templates dir into functions
var templates = {}
fs.readdirSync(`${source}/_templates`).forEach(path => {
  var str = fs.readFileSync(`${source}/_templates/${path}`, 'utf8')
  templates[path] = d => eval('`' + str + '`')
})

// build site
rsyncStatic()
var posts = fs.readdirSync(`${source}/_posts`).map(parsePost)
fs.writeFileSync(public + '/rss.xml', templates['rss.xml'](posts))
fs.writeFileSync(public + '/sitemap.xml', templates['sitemap.xml'](posts))

// copy files on change
if (process.argv.join('').includes('--watch')){
  chokidar.watch([source]).on('all', function(event, path){
    if (event != 'change') return
    if (path.includes('_posts/')) parsePost(path.split('_posts/')[1])

    rsyncStatic()
  })
}

// copy everything but _template and _post to public/
function rsyncStatic(){
  exec('rsync -a --exclude _post/ --exclude templates/ source/ public/')
}

// read post path and write to public/
function parsePost(path){
  var slug = path.split('.')[0]
  var date = slug.substr(0, 10)

  var markdown = fs.readFileSync(`${source}/_posts/${path}`, 'utf8')

  // parse metadata from frontmatter
  var [top, content] = markdown.replace('---\n', '').split('\n---\n')
  var meta = {}
  top.split('\n').forEach(line => {
    var [key, val] = line.split(': ')
    meta[key] = val
  })

  // convert markdown from html and highlight code
  var html = marked( content.replace( /^\t+/gm, match => match.split( '\t' ).join( '  ' ) ) )
      .replace( /<pre><code class="lang-(\w+)">([\s\S]+?)<\/code><\/pre>/g, ( match, lang, value ) => {
        const highlighted = hljs.highlight( lang, unescape(value) ).value
        return `<pre class="lang-${lang}"><code class='hljs'>${highlighted}</code></pre>`
      })

  var post = {slug, date, meta, html}

  var dir = public + meta.permalink
  if (!fs.existsSync(dir)) execSync(`mkdir -p ${dir}`)
  fs.writeFileSync(`${dir}/index.html`, templates[post.meta.template](post))

  return post
}
```
