window.visState = window.visState || {
}

window.init = function(){
  console.clear()

  var graphSel = d3.select('.graph').html('')
  util.setFullWidth(graphSel, d3.clamp(1024, window.innerWidth, 1440))
  graphSel
    .appendMany('div.day', d3.nestBy(tidy, d => d.day))
    .each(drawDate)
}

function drawDate(dayData){
  d3.nestBy(dayData, d => d.part + '_' + d.year)
    .forEach(part => part.forEach((d, i) => d.rank = i))

  var c = d3.conventions({
    sel: d3.select(this),
    height: 200,
    layers: 'sc',
    margin: {left: 0, right: 0, top: 0, bottom: 0}
  })

  c.x.domain([2014.9, 2024.9]).interpolate(d3.interpolateRound)
  c.y = d3.scaleLog().domain([3, 4*60*60]).range([c.height, 0]).interpolate(d3.interpolateRound)

  c.xAxis.tickFormat(d => d % 2 ? '' : "'" + (d % 100))
  c.yAxis = d3.axisLeft(c.y)
    .tickValues([6, 60, 6*60, 60*60])
    .tickFormat(d => {
      if (d < 60) return d + 's';
      if (d < 60*60) return d/60 + 'm';
      return d/(60*60) + 'h';
    })  

  d3.drawAxis(c)
  util.ggPlot(c)
  c.svg.select('.x').translate([.5, c.height])

  c.svg.append('text.day-label').text('Day ' + dayData.key)
    .at({fill: '#999', fontSize: 9, x: c.width - 5, textAnchor: 'end', dy: 14})

  var ctx = c.layers[1]
  var yw = c.x(2016) - c.x(2015) 
  var s = 2
  dayData.forEach(d =>{
    ctx.beginPath()
    ctx.fillStyle = d.part == 2 ? '#9999cc' : '#ffff66'
    ctx.rect(
      c.x(d.year)     + d.rank/100*yw/2, 
      c.y(d.seconds)  - s/4, 
      s, 
      s
    )
    ctx.fill()
  })
}



if (!window.tidy){
  d3.loadData('https://roadtolarissa.com/data/2024-advent-of-code-tidy.tsv', (err, res) => {
    window.tidy = res[0]
    init()
  })
} else{
  init()
}

