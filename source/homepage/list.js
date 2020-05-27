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




more-extreme-summer-heat


hurricane-harvey-rain


lebron-points-record

hurricane-irma-records

voroni-spiral

golden-state-warriors-post-season
affirmative-action
game-of-thrones-chart
wannacry-ransomware-map
lyric-type
forecast-president
every-tax-cut-in-the-house-tax-bill
british-general-election-results-analysis
trump-climate-change
trading-analysis
lebron-james-nba-finals-streak
what-separates-voters-and-nonvoters
BASEBALL-LAUNCH-ANGLE
euro-2016-how-teams-can-advance-to-the-next-round
hurricane-irma-map
debate-moments
Bush-Rubio-and-Kasich-Donors-give-to-Clinton
how-much-people-in-the-trump-administration-are-worth-financial-disclosure
this-election-highlighted-a-growing-rural-urban-split
growing-divide-between-red-and-blue-america
television-ads
sell-strat

trump-refugees-muslim
where-refugees-come-from
trump-cabinet-opposition
political-firsts
pope-francis-cardinals-shape-church
cabinet-removal

how-britain-voted-brexit-referendum
`.split('\n')


var projects = nytProjects.concat(otherProjects)
projects.forEach((d, i) => {
  if (!d.img) d.img = '/images/thumbnails/' + d.slug + '.png'

  var i = topProjects.indexOf(d.slug)
  d.isTop = i > -1 && i < 30 
})


// boring
!(function(){
  projects.forEach(d => {
    d.year = d.date.split('-')[0]
    d.month = d.date.split('-')[1]
  })

  projects.sort((a, b) => a.date > b.date ? -1 : 1)

  var byYear = d3.nestBy(projects, d => d.year)
  byYear.forEach(years => {
    years[0].isYear = true
  })

  var sel = d3.select('#boring').html('')

  var yearSel = sel.appendMany('div.year', byYear).st({width: '100%'})

  yearSel.append('div.year-label').text(d => d.key)

  var linkSel = yearSel.appendMany('a.row', d => d)
    .attr('href', d => d.url)
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


d3.select('html').classed('is-boring', 1)



