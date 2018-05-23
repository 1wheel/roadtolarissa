var fs = require('fs')
var {_} = require('scrape-stl')

function readdirAbs(dir){ return fs.readdirSync(dir).map(d => dir + '/' + d) }


readdirAbs(__dirname + '/_posts').forEach(path => {
  var date = _.last(path.split('/')).split('.')[0].substr(0, 10)
  var str = fs.readFileSync(path, 'utf8')
    .replace('permalink: ', `date: ${date}\npermalink: `)

  fs.writeFileSync(path, str)
})


