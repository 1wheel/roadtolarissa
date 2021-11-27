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
fill-in-the-blank
`.split('\n')


var projects = nytProjects.concat(otherProjects)
projects.forEach((d, i) => {
  if (!d.img) d.img = '/images/thumbnails/' + d.slug + '.png'

  d.isTop = topProjects.includes(d.slug)
})


// boring
!(function(){
  projects.forEach(d => {
    d.year = d.date.split('-')[0]
  })

  projects.sort((a, b) => a.date > b.date ? -1 : 1)
  var byYear = d3.nestBy(projects, d => d.year)

  var sel = d3.select('#boring').html('')

  var yearSel = sel.appendMany('div.year', byYear)

  yearSel.append('div.year-label').text(d => d.key)

  var linkSel = yearSel.appendMany('a.row', d => d)
    .attr('href', d => d.url.replace('https://roadtolarissa.com', ''))
    .attr('target', '_blank')
    .classed('is-top', d => d.isTop)

  linkSel.append('div.thumbnail')
    .st({
      backgroundImage: d => `url(${d.img})`,
    })

  linkSel.append('a.slug')
    .text(d => d.slug.toLowerCase().replace(/-/g, ' ').trim())
    .at({href: d => d.url})
})()




