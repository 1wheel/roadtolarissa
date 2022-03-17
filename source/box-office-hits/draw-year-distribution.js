
window.drawYearDistribution = function({byMovie}){
  var byReleaseYear = d3.nestBy(_.sortBy(_.sortBy(byMovie, d => -d.gross), d => d.year), d => d.year)
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
    margin: {left: 25, bottom: 40, top: 10}
  })

  c.x.domain([1982, 2022])

  c.xAxis.tickFormat(d => d)//.ticks(5)
  c.yAxis.tickFormat(d3.format('.0%')).tickValues([.25, .5, .75])
  d3.drawAxis(c)
  util.ggPlot(c, false)

  c.svg.selectAll('.axis path').at({strokeWidth: 1, stroke: '#ddd', strokeDasharray: '1 2'})
  c.svg.selectAll('.x.axis path').remove()
  c.svg.selectAll('.x text').at({x: (c.x(1) - c.x(0))/2})


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
    .st({pointerEvents: 'none'})


  c.svg.select('.bg-rect').lower()
    .at({fill: '#000', x: .3, width: c.width, height: c.height - .1})
    // .at({fill: color(1000)})

  c.svg.append('text.annotation')
    .text('E.T. →')
    .translate([c.x(1982) - 5, c.y(.07)])
    .at({textAnchor: 'end'})

  c.svg.append('text.annotation')
    .text('← No Way Home')
    .translate([c.x(2022) + 5, c.y(.07)])
    .at({textAnchor: 'start'})

}

if (window.init) window.init()
