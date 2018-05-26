var topProjects = `
subway-crisis-mta-decisions-signals-rules
hurricane-harvey-texas
spoofing
vegas-guns
race-class-white-and-black-men
houston-flood-rescue-cries-for-help
what-is-code
new-yorks-subways-are-not-just-delayed-some-trains-dont-run-at-all
new-geography-of-prisons
2017-chart-diary
who-marries-whom
tax-calculator
twisters
you-draw-obama-legacy
more-frequent-extreme-summer-heat
nba-win-loss
golden-state-warriors-post-season
hurricane-irma-records
hot-reload
affirmative-action
nba-minutes
lebron-career-playoff-points-record
uk-splatter
game-of-thrones-chart
wannacry-ransomware-map
debate-moments
lyric-type
nine-percent-of-america-selected-trump-and-clinton
forecast-president
every-tax-cut-in-the-house-tax-bill
british-general-election-results-analysis
trump-climate-change
trading-analysis
europe-right-wing-austria-hungary
lebron-james-nba-finals-streak
what-separates-voters-and-nonvoters
BASEBALL-LAUNCH-ANGLE
euro-2016-how-teams-can-advance-to-the-next-round
hurricane-irma-map
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
`

var isBoring = false


nytProjects.forEach(d => d.isNYT = true)
var projects = nytProjects.concat(otherProjects)
projects.forEach((d, i) => {
  if (!d.img) d.img = '/images/thumbnails/' + d.slug + '.png'
})


projects = _.sortBy(projects, d => {
  var i = topProjects.indexOf(d.slug)
  d.forceIndex = i

  return i == -1 ? 10000000 : i
})
projects = projects.filter(d => !d.isNYT || d.forceIndex != -1)



var numProjects = projects.length
projects = projects.concat(projects)


console.clear()
var phi = 1.618033988749895
var cx = 0.7236067977499789
var cy = 0.4472135954999579

var initS = Math.min(innerWidth, 750)/phi
var s = initS
var x = 0
var y = 0


var imgs = projects.map(d =>'url("' + d.img + '")')

var links = projects.map(d => d.url)
var colors = projects.map(d => d.color)

var sel = d3.select('#spiral').html('')
  .st({
    width: s*phi, 
    height: s,
    transformOrigin: `${s*phi*cx}px ${s*cx}px`,
    top: `calc(50vh - ${s/2}px)`,
  })

d3.range(innerWidth < 700 ? 13 : 18).forEach((d, i) => {
  sel.append('div.step')
    .st({
      transform: `translate(${x}px, ${y}px) scale(${s/initS})`,
      transformOrigin: 'left top',
      width: initS,
      height: initS
    })
    .append('div.img-container')
    .classed('index-' + i % 4, 1)

  var [dx, dy] = [
    [s,           0],
    [s/phi/phi,   s],
    [-s/phi,      s - s/phi],
    [0,           -s/phi],
  ][i % 4]

  x += dx
  y += dy

  s = s/phi
})

var stepSel = sel.selectAll('.step')
var imgSel = sel.selectAll('.img-container')

updateImg()

var timerY = 0

function updateZoom(){
  if (isBoring) return

  var scale = (pageYOffset)/500 + 1

  if (pageYOffset > (numProjects + 6)*500){
    window.scrollTo(0, pageYOffset - numProjects*500)
  }

  var drawScale = Math.min(5, scale) 
  if (drawScale == 5){ 
    drawScale += scale % 1
  } 

  updateImg(Math.floor(scale - drawScale) )
  sel.st({
    transform: `
      scale(${Math.pow(phi, drawScale)/phi}) 
      rotate(${-90*drawScale + 90}deg
    )`,
  })

  if (timerY != pageYOffset && window.scrollTimer && pageYOffset) scrollTimer.stop()
}

function updateImg(offset){
  imgSel
    .st({backgroundImage: (d, i) => imgs[i + offset]})
    .on('click', (d, i) => {
      if (!links[i + offset]) return
      window.open(links[i + offset], '_blank');
    })
}

updateZoom()
d3.select(window).on('scroll', updateZoom)

setTimeout(startAutoScroll, 50)
setTimeout(startAutoScroll, 500)
setTimeout(startAutoScroll, 1000)

function startAutoScroll(){
  if (isBoring) return

  var initY = pageYOffset

  if (window.scrollTimer) window.scrollTimer.stop()
  scrollTimer = d3.timer(t => {
    timerY = Math.round(t/12) + initY
    window.scrollTo(0, timerY)
  })
}



// boring
!(function(){
  boringProjects = nytProjects.concat(otherProjects)

  boringProjects.forEach(d => {
    d.year = d.date.split('-')[0]
    d.month = d.date.split('-')[1]
  })

  boringProjects = _.orderBy(boringProjects, d => d.date, 'desc')

  // d3.nestBy(boringProjects.slice().reverse(), d => d.year).forEach(years => {
  d3.nestBy(boringProjects, d => d.year).forEach(years => {
    years[0].isYear = true
    d3.nestBy(years, d => d.month).forEach(months => {
      months[0].isMonth = true
    })
  })

  var sel = d3.select('#boring').html('')

  var linkSel = sel.appendMany('div', boringProjects)
    

  linkSel.append('span.year')
    .text(d => d.year + '-')
    .st({opacity: d => d.isYear ? 1 : 0})
  linkSel.append('span.month')
    .text(d => d.month)
    .st({opacity: d => d.isMonth ? 1 : 0})

  linkSel.append('a.slug')
    .text(d => d.slug.toLowerCase())
    .at({href: d => d.url})


})()

var buttonSel = d3.select('html')
  .append('div.button').text('list')
  .on('click', toggleBoring)


function toggleBoring(){
  isBoring = !isBoring
  d3.select('html').classed('is-boring', isBoring)
  
  window.scrollTo(0, 0)
  buttonSel.text(isBoring ? 'spiral' : 'list')

  if (isBoring){
    if (window.scrollTimer) window.scrollTimer.stop()
  } else{
    startAutoScroll()
  }

}

// toggleBoring()



;`
todo
https://bl.ocks.org/1wheel/68073eeba4d19c454a8c25fcd6e9e68a
jetpack hot-server?
`