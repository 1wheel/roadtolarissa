
window.drawBestWeekScatter = function({byMovie}){
  var topMovies = byMovie
    .filter(d => d.gross > 200000000)
    .filter(d => 1981 < d.year && d.year < 2022)

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
  util.ggPlot(c)

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


if (window.init) window.init()