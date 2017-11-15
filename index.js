// based on
// http://ashkenas.com/journo/docs/journo.html
// https://github.com/sveltejs/svelte.technology/blob/master/scripts/prep/build-blog.js

var fs = require('fs')
var { exec, execSync } = require('child_process')
var hljs = require('highlight.js')
var marked = require('marked')
marked.setOptions({
  highlight: (code, lang) => hljs.highlight(lang, code).value
})

var public = `${__dirname}/public`
var source = `${__dirname}/source`

// copy everything but _template and _post to public/
function rsyncStatic(){
  exec('rsync -a --exclude _post/ --exclude _templates/ source/ public/')
}
rsyncStatic()

// convert _templates dir into functions
var templates = {}
fs.readdirSync(`${source}/_templates`).forEach(path => {
  var str = fs.readFileSync(`${source}/_templates/${path}`, 'utf8')
  templates[path] = d => eval('`' + str + '`')
})

var posts = fs.readdirSync(`${source}/_posts`).map(parsePost)
fs.writeFileSync(public + '/rss.xml', templates['rss.xml'](posts))
fs.writeFileSync(public + '/sitemap.xml', templates['sitemap.xml'](posts))

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

  // convert markdown to html
  var html = marked(content)
  var post = {slug, date, meta, html}

  var dir = public + meta.permalink
  if (!fs.existsSync(dir)) execSync(`mkdir -p ${dir}`)
  fs.writeFileSync(`${dir}/index.html`, templates[post.meta.template](post))

  return post
}

// copy files on change
if (process.argv.join('').includes('--watch')){
  var chokidar = require('chokidar')
  chokidar.watch([source]).on('change', (event, path) => {
    if (path.includes('_posts/')) parsePost(path.split('_posts/')[1])
    rsyncStatic()
  })
}