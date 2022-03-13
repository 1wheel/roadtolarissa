window.drawWeeklyTopPercent = function({byWeek, byMovie}){
  var sel = d3.select('.weekly-top-percent').html('')

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
  util.ggPlot(c)

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

if (window.init) window.init()
