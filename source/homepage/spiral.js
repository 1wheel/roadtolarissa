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


var isBoring = false


nytProjects.forEach(d => d.isNYT = true)
var projects = nytProjects.concat(otherProjects)
projects.forEach((d, i) => {
  if (!d.img) d.img = '/images/thumbnails/' + d.slug + '.png'
})

projects = _.orderBy(projects, d => d.date, 'desc')
projects = _.sortBy(projects, d => {
  var i = topProjects.indexOf(d.slug)
  d.forceIndex = i
  d.isTop = i > -1 && i < 30 

  return i == -1 ? 10000000 : (i < 30 ? i : 10000000)
})



var numProjects = projects.length
projects = projects.concat(projects)


console.clear()
var phi = 1.618033988749895
var cx = 0.7236067977499789

var initS = Math.min(innerWidth, 750)/phi
var s = initS
var x = 0
var y = 0


var imgs = projects.map(d =>'url("' + d.img + '")')

var links = projects.map(d => d.url)

var UA = navigator.userAgent
var isFF = UA.includes('Firefox') && !UA.includes('Chrome/')
var isSF = UA.includes('Safari') && !UA.includes('Chrome/')
isSF = true

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
      rotate(${-90*drawScale + 90}deg)
    `,
  })

  if (timerY != pageYOffset && window.scrollTimer && pageYOffset) scrollTimer.stop()
}

function updateImg(offset){
  imgSel
    .st({backgroundImage: (d, i) => imgs[i + offset]})
    .on('click', (d, i) => {
      console.log(imgs[i + offset])
      if (!links[i + offset]) return
      window.open(links[i + offset], '_blank');
    })
}

updateZoom()
d3.select(window).on('scroll', updateZoom)

setTimeout(startAutoScroll, 50)
setTimeout(startAutoScroll, 250)
setTimeout(startAutoScroll, 500)
setTimeout(startAutoScroll, 750)
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

if (isFF){
  setTimeout(() => {
    d3.select(window).on('mousemove', () => {
      window.scrollTimer.stop()
    })
  }, 2000)
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
  var byYear = d3.nestBy(boringProjects, d => d.year)
  byYear.forEach(years => {
    years[0].isYear = true
    d3.nestBy(years, d => d.month).forEach(months => {
      months[0].isMonth = true
    })
  })

  var sel = d3.select('#boring').html('')

  var yearSel = sel.appendMany('div.year', byYear)
    .st({width: '100%'})

  yearSel.append('div.year-label')
    .text(d => d.key)

  var linkSel = yearSel.appendMany('a.row', d => d)
    .attr('href', d => d.url)
    .attr('target', '_blank')
    .classed('is-top', d => d.isTop)

  // linkSel.append('span.year')
  //   .text(d => d.year)
  //   .st({opacity: d => d.isYear ? 1 : 0})
  // linkSel.append('span.month')
  //   .text(d => '-' + d.month)
  //   .st({opacity: d => d.isMonth ? 0 : 0})

  linkSel.append('div.thumbnail')
    .st({
      backgroundImage: d => `url(${d.img})`,
    })

  linkSel.append('a.slug')
    .text(d => d.slug.toLowerCase().replace(/-/g, ' ').trim())
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

if (isSF) toggleBoring()



// todo
// https://bl.ocks.org/1wheel/68073eeba4d19c454a8c25fcd6e9e68a
// jetpack hot-server?
