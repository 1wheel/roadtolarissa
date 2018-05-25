var data = d3.csvParse(`date,val,source
2012-09,324000,https://www.openhub.net/p/WordPress,
2014-02,7500,https://www.openhub.net/p/Octopress,
2015-07,1250,https://www.openhub.net/p/Metalsmith
2017-08,60,https://www.openhub.net/p/This Post
2018-05,60,https://www.openhub.net/p/custom`)


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
  margin: {left: innerWidth > 820 ? 0 : 55, top: 10, right: 5}
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
  .st({fontWeight: d => d.name == 'This Post' ? 600 : ''})

// c.svg.append('text')
//   .text('No Code Is The Best Code')
//   .text('Marching Towards Nothing')
//   .text('Decreasing The Code Building This Site')
//   .at({x: c.width/2, y: -22, textAnchor: 'middle', fontWeight: 800})
//   .at({x: 0, textAnchor: 'start'})



annotations = 
[
  {
    "path": "M 674,142 A 197.135 197.135 0 0 1 325,-20.000057220458984",
    "textOffset": [
      332,
      -299
    ]
  }
]

var swoopy = d3.swoopyDrag()
    .draggable(0)
    .x(d => 0)
    .y(d => 0)
    .annotations(annotations)

swoopySel = c.svg.append('g.annotations').call(swoopy)
  .st({opacity: innerWidth > 820 ? 1 : 0})
swoopySel.selectAll('path').attr('marker-end', 'url(#arrow)')


