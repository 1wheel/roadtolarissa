d3.loadData('states.csv', 'https://roadtolarissa.com/data/fox-2020-wp.csv', (err, res) => {
  window.states = res[0]
  window.tidy = res[1]

  tidy.forEach(d => {
    d.date = new Date(d.last_update)
  })

  window.timeScale = d3.scaleTime()
    .domain(d3.extent(tidy, d => d.date))
    .interpolate(d3.interpolateRound)

  var byState = _.sortBy(d3.nestBy(tidy, d => d.state), d => d.key)


  var stateSel = d3.select('.state-sm').html('')
    .appendMany('div.state', byState.concat([0,0,0,0,0,0]))
    .each(drawState)
})


function drawState(state){
  if (!state) return;
  var sel = d3.select(this)
  // sel.append('div.name').text(state.key)

  var c = d3.conventions({
    sel: sel.append('div'),
    height: 100,
    margin: {bottom: 30, right: 20}
  })

  var m = _.find(states, {abv: state.key})
  c.svg.append('g.axis').append('text').text(m.name)
    .at({x: c.width/2, textAnchor: 'middle', y: -5})
    .st({fill: '#000'})

  timeScale.range(c.x.range())

  c.x = timeScale
  c.y.interpolate(d3.interpolateRound)
  c.xAxis.scale(c.x).ticks(3)
  c.yAxis.ticks(4).tickFormat(d3.format('.0%')).tickSize(c.width)

  d3.drawAxis(c)
  var yAxisSel = c.svg.select('.y').translate(c.width, 0)

  var line = d3.line()
    .x(d => c.x(d.date))
    .y(d => c.y(d.rProb))
    .curve(d3.curveStepAfter)


  c.svg.append('path.wp-line')
    .at({
      d: line(state),
      stroke: '#B4152A',
    })

  c.svg.append('path.wp-line')
    .at({
      d: line.y(d => c.y(1 - d.rProb))(state),
      stroke: '#1F3664',
    })


}