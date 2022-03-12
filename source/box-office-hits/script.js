console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')


if (window.__datacache){
  init()
} else{
  d3.loadData(
    // 'https://roadtolarissa.com/data/box-office-mojo-tidy.csv', 
    // 'https://roadtolarissa.com/data/box-office-mojo-weekend.csv', 
    'https://roadtolarissa.com/data/box-office-mojo-weekly.csv', 
    'bo_mojo_inflation.csv', 
    (err, res) => {
      window.window.__datacache = res
      init() 
  })
}

function init(){
  if (!window.tidy) parseData()

  drawYearScatter()
  drawBestWeekScatter()
  drawYearDistribution()

}

function parseData(){
  var year2inflation = {}
  window.__datacache[1].forEach(d => year2inflation[+d.year] = +d.price_per_ticket)

  window.tidy = window.__datacache[0]
  tidy.forEach(d => {
    d.yearweek = d.year + d.week

    d.rawGross = +d.gross
    d.year = +d.year
    d.week = +d.week

    d.gross = d.rawGross*year2inflation[2020]/year2inflation[d.year]
  })

  var yearweek2index = {}
  d3.nestBy(tidy, d => d.yearweek).forEach((d, i) => yearweek2index[d.key] = i) 

  tidy.forEach(d => {
    d.weekIndex = yearweek2index[d.yearweek]
  })

  window.byYear = d3.nestBy(tidy, d => d.year)
    .filter(d => d.key > 1981)

  window.byWeek = []
  byYear.forEach(year => {
    year.byWeek = d3.nestBy(year, d => d.week)
      .filter(d => d.length > 1)

    year.byWeek.forEach(week => {
      week.gross = d3.sum(week, d => d.gross)
      week.forEach(d => {
        d.percent = d.gross/week.gross
      })
      week.top = week[0].name
      week[0].isTop = true

      byWeek.push(week)
    })
  })

  byWeek.forEach(d => {
    d.week = d[0].week
    d.year = d[0].year
    // Wonky christmas weekend data
    d.isHidden = d.week == 52 && (d.year == 1988 || d.year ==1989)
  })

  window.byMovie = d3.nestBy(tidy, d => d.id)
  byMovie.idLookup = {}
  byMovie.forEach(movie => {
    movie.name = movie[0].name
    movie.maxPercent = d3.max(movie, d => d.percent)
    byMovie.idLookup[movie.key] = movie

    movie.weekIndex0 = movie[0].weekIndex
    movie.year = movie[0].year
    movie.gross = d3.sum(movie, d => d.gross)
    movie.highestWeeklyGross = d3.sum(_.sortBy(movie, d => -d.gross).slice(0, 1), d => d.gross)
    movie.highestGrossPercent = movie.highestWeeklyGross/movie.gross

    movie.forEach(d => {
      d.weeksSinceRelease = d.weekIndex - movie.weekIndex0
    })

  })

  window.topMovies = byMovie
    // .filter(d => d.some(e => e.isTop))
    .filter(d => d.gross > 200000000)
    .filter(d => 1981 < d.year && d.year < 2022)

}

function drawYearScatter(){
  var sel = d3.select('.year-scatter').html('')

  var c = d3.conventions({
    sel: sel.append('div'),
    width: 800,
    height: 500,
    margin: {left: 30, bottom: 40, top: 10}
  })

  c.x.domain([1982, 2022])

  c.xAxis.tickFormat(d => d)
  c.yAxis.tickFormat(d3.format('.0%'))
  d3.drawAxis(c)
  ggPlot(c)

  var circleSel = c.svg.appendMany('circle', byWeek)
    .translate(d => [c.x(d.year + d.week/52), c.y(d[0].percent)])
    .at({r: 2, fill: 'rgba(0,0,0,0)', stroke: '#000'})
    .st({display: d => d.isHidden ? 'none' : ''})
    .call(d3.attachTooltip)
    .st({opacity: d => d.gross > 10000000 ? 1 : .1})
    .on('mouseover', week => {
      var movie = byMovie.idLookup[week[0].id].filter(d => d.isTop)

      hoverCircleSel
        .at({opacity: 0})
        .filter(i => movie[i])
        .at({opacity: 1})
        .translate(i => [
          c.x(movie[i].year + movie[i].week/52), 
          c.y(movie[i].percent)
        ])
    })

  var hoverCircleSel = c.svg.appendMany('circle', d3.range(60))
    .at({fill: '#f0f', stroke: '#f0f', fillOpacity: .4, opacity: 0, r: 4, pointerEvents: 'none'})
}

function drawBestWeekScatter(){
  var sel = d3.select('.best-week-scatter').html('')

  var c = d3.conventions({
    sel: sel.append('div'),
    width: 800,
    height: 500,
    margin: {left: 30, bottom: 40, top: 10}
  })

  c.x.domain([1982, 2022])
  c.y.domain([0, 1])

  c.xAxis.tickFormat(d => d)
  c.yAxis.tickFormat(d3.format('.0%'))
  d3.drawAxis(c)
  ggPlot(c)

  var rScale = d3.scaleSqrt().domain([0, 1e9]).range([0, 10])
  var circleSel = c.svg.appendMany('circle', topMovies)
    .translate(d => [c.x(d.year + d[0].week/52), c.y(d.highestGrossPercent)])
    .at({
      r: d => rScale(d.gross),
      fill: 'rgba(0,0,0,.2)', 
      stroke: '#000',
    })
    .call(d3.attachTooltip)
    // .st({opacity: d => d.gross > 10000000 ? 1 : .1})

  circleSel
    .filter(d => d.year == 2021)
    .at({strokeDasharray: '2 2'})
}

function drawYearDistribution(){
  window.byReleaseYear = d3.nestBy(_.sortBy(_.sortBy(byMovie, d => -d.gross), d => d.year), d => d.year)
    .filter(d => 1981 < d.key && d.key < 2022)

  byReleaseYear.forEach(year => {
    year.gross = d3.sum(year, d => d.gross)

    var prev = 0
    year.forEach(d => {
      d.prev = prev 
      d.yearPercent = d.gross/year.gross
      prev += d.yearPercent
    })
  })

  var sel = d3.select('.year-distribution').html('')

  var c = d3.conventions({
    sel: sel.append('div'),
    width: 800,
    height: 500,
    margin: {left: 30, bottom: 40, top: 10}
  })

  c.x.domain([1982, 2022])

  c.xAxis.tickFormat(d => d)//.ticks(5)
  c.yAxis.tickFormat(d3.format('.0%')).tickValues([.25, .5, .75])
  d3.drawAxis(c)
  ggPlot(c, false)

  c.svg.selectAll('.axis path').at({strokeWidth: 1, stroke: '#000', strokeDasharray: '2 1'})
  c.svg.selectAll('.x.axis path').remove()

  var yearSel = c.svg
    .append('g').lower()
    .appendMany('g', byReleaseYear)
    .translate(d => c.x(d.key), 0)

  var ramp = d3.interpolateMagma
  var ramp = d3.interpolateViridis

  var domain = [1, 5, 15, 25, 50, 100]
  var color = d3.scaleThreshold()
    .domain(domain)
    .range(d3.range(domain.length + 1).map(i => ramp(i/domain.length)))
    .range(d3.range(domain.length + 1).reverse().map(i => ramp(i/domain.length)))

  yearSel.appendMany('rect', d => d.filter(d => d.yearPercent > .0001))
    .at({
      x: .5, 
      width: c.x(1) - c.x(0) - .2,
      height: (d, i) => i > 100 ? .9 : Math.max(.1, c.height - c.y(d.yearPercent) - .1),
      y: d => Math.round(c.y(d.prev + d.yearPercent)*10)/10,
      fill: (d, i) => color(i),
      // opacity: d => d.year == 2020 ? .3 : 1,
    })
    .call(d3.attachTooltip)

  yearSel.filter(d => d.key == 2020)
    .append('rect')
    .at({
      width: c.x(1) - c.x(0),
      height: c.height,
      fill: '#fff',
      fillOpacity: .6,
    })

  c.svg.select('.bg-rect').lower()
    .at({fill: '#000', x: .3, width: c.width, height: c.height - .1})
    // .at({fill: color(1000)})
}


function addAxisLabel(c, xText, yText, xOffset=40, yOffset=-40){
  c.svg.select('.x').append('g')
    .translate([c.width/2, xOffset])
    .append('text.axis-label')
    .text(xText)
    .at({textAnchor: 'middle'})
    .st({fill: '#000', fontSize: 14})

  c.svg.select('.y')
    .append('g')
    .translate([yOffset, c.height/2])
    .append('text.axis-label')
    .text(yText)
    .at({textAnchor: 'middle', transform: 'rotate(-90)'})
    .st({fill: '#000', fontSize: 14})
}

function ggPlot(c, isBlack=true){
  // if (isBlack){
  c.svg.append('rect.bg-rect')
    .at({width: c.width, height: c.height, fill: '#eee'})
    .lower()
  // }

  c.svg.selectAll('.tick').selectAll('line').remove()
  c.svg.selectAll('.y .tick')
    .append('path').at({d: 'M 0 0 H ' + c.width, stroke: '#fff', strokeWidth: 1})
  c.svg.selectAll('.y text').at({x: -3})
  c.svg.selectAll('.x .tick')
    .append('path').at({d: 'M 0 0 V -' + c.height, stroke: '#fff', strokeWidth: 1})

  // c.svg.selectAll('.y .tick').filter(d => d == 0).remove()
}
