console.clear()

var data = d3.csvParse(`date,val,source
2012-09,324000,https://www.openhub.net/p/Wordpress,
2014-02,7500,https://www.openhub.net/p/Jekyll,
2015-07,1250,https://www.openhub.net/p/Metalsmith
2017-08,65,https://www.openhub.net/p/Custom
2018-05,65,https://www.openhub.net/p/custom`)


data.forEach((d, i) => {
  var [year, month] = d.date.split('-').map(d => +d)

  d.date = year + (month - 1)/12

  d.next = data[i + 1]
})
data.forEach(d => {
  if (!d.next) return
  d.mid = (d.date + d.next.date)/2
  d.name = d.source.split('p/')[1]
})

var sel = d3.select('#graph').html('')
var c = d3.conventions({
  sel, 
  margin: {left: innerWidth > 900 ? 0 : 55, top: 40, right: 5}
})


c.x.domain(d3.extent(data, d => d.date))
c.y = d3.scaleLog().range(c.y.range()).domain([10, 500000])

var area = d3.area()
  .x(d => c.x(d.date))
  .y1(d => c.y(d.val))
  .y0(c.height)
  .curve(d3.curveStepAfter)

var line = area.lineY1()

c.xAxis.ticks(5).tickFormat(d => d)
var yTicks = [10, 100, 1000, 10000, 100000]
c.yAxis.scale(c.y).tickFormat(d3.format(',')).tickValues(yTicks)

d3.drawAxis(c)

sel.selectAll('.y .tick').filter(d => d == 100000).remove()

sel.select('.y').append('text')
  .translate([-9, c.y(100000) - 8])
  .tspans(['100,000', 'lines of', 'code'], 11)


c.svg.append('path').at({d: area(data), fill: '#f0f', fillOpacity: .2})

c.svg.appendMany('line', yTicks)
  .at({stroke: '#f5f5f5', x2: c.width})
  .translate(c.y, 1)


c.svg.append('path').at({d: line(data), fill: 'none', stroke: '#f0f', strokeWidth: 2})


c.svg.appendMany('text', data.filter(d => d.mid))
  .text(d => d.name)
  .translate(d => [c.x(d.mid), c.y(d.val)])
  .at({textAnchor: 'middle', dy: '-.33em', fontSize: 12})

c.svg.append('text')
  .text('No Code Is The Best Code')
  .text('Marching Towards Nothing')
  .at({x: c.width/2, y: -22, textAnchor: 'middle', fontWeight: 800})
  .at({x: 0, textAnchor: 'start'})



