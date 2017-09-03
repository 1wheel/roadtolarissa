d3.select('body').selectAppend('div.tooltip')

var data = d3.range(300).map(x => { return {x, y: Math.random()*10 + x/100} })

var c = d3.conventions({parentSel: d3.select('.graph').html(''), margin: {left: 30}})

c.x.domain(d3.extent(data, d => d.x))
c.y.domain(d3.extent(data, d => d.y))

c.drawAxis()

c.svg.appendMany(data, 'circle')
  .at({
    cx: d => c.x(d.x),
    cy: d => c.y(d.y),
    stroke: '#000',
    fillOpacity: .4,
    r: 5
  })
  .call(d3.attachTooltip)