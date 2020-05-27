var {jp, d3, _, request, fs} = require('scrape-stl')


var topProjects = `
subway-crisis
spoofing
vegas-guns
who-marries-whom
race-class-white-and-black
houston-cries-for-help
what-is-code
some-trains-dont-run-at-all
2017-chart-diary
tax-calculator
twisters
you-draw-obama-legacy
new-geography-of-prisons
nba-win-loss
hot-reload
dumb-lawyer
uk-splatter
nba-minutes
nine-percent-of-america
europe-right-wing
2018-chart-diary
hurricane-how-to
uncertainty-over-space
`.split('\n')



var templateHTML = `<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel='shortcut icon' href=''>

  <title>roadtolarissa</title>
  <meta name="Description" content="Charts by Adam Pearce">


  <link rel="stylesheet" type="text/css" href="/style.css">
  <link href='https://fonts.googleapis.com/css?family=Roboto+Slab:400,700|Roboto:700,300' rel='stylesheet' type='text/css'> 

  <link rel="stylesheet" type="text/css" href="/homepage/list.css">
</head>

<body>
<main>
  <div class='header'>
    <div class='header-left'>
      <a href='http://roadtolarissa.com'>roadtolarissa</a>
    </div>
    <div class='header-right'>
      <span>Adam Pearce</span>
      <a href='http://github.com/1wheel'>
        <img alt='github' src='/images/github.svg'></img>
      </a>
      <a href='http://twitter.com/adamrpearce'>
        <img alt='twitter' src='/images/twitter.svg'></img>
      </a>
      <a href='mailto:1wheel@gmail.com'>
        <img alt='email' src='/images/mail.svg'></img>
      </a>
      <a href='https://roadtolarissa.com/rss.xml'>
        <img alt='rss' src='/images/rss.svg'></img>
      </a>
    </div>
  </div>

  <div id='boring' class='skip-link'>boringHTML</div>
</body>
</main>
</html>`



d3.csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vTGqTVxJ_yfhMaRRRQ1BjvmbCEFrw57kAC5d6iK9gdEiaL_MKEAi1r6eMQ_9QRN6xpDdO-MAbbFKqqQ/pub?output=csv', (err, res) => {
  var projects = res

  projects.forEach(d => {
    d.year = d.date.split('-')[0]
    d.isTop = topProjects.includes(d.slug)
    d.img = `https://roadtolarissa.com/homepage-list/thumb-img/${d.slug}.jpg`
  })


  updateHTML(projects)

  
})


function updateHTML(projects){

  projects.sort((a, b) => a.date > b.date ? -1 : 1)

  var boringHTML = jp.nestBy(projects, d => d.year).map(year => {
    return `
    <div class='year'>
      <div class='year-label'>${year.key}</div>
      ${year.map(d => `
        <a class='row${d.isTop ? ' is-top' : ''}' href='${d.url}'>
          <div class='thumbnail' style='background-image: url(${d.img})'></div>
          <span class='slug'>${d.slug.toLowerCase().replace(/-/g, ' ').trim()}</span>
        </a>
      `).join('')}
    </div>
    `
  }).join('')

  fs.writeFileSync(__dirname + '/../index.html', templateHTML.replace('boringHTML', boringHTML))

}




