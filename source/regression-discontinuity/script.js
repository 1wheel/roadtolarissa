
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var maxDate = 100

days.forEach((d, i) => {
  d.date = d3.timeParse('%m/%d/%Y')(d.DATE)
  d.cases = d.cases || +d.POSITIVE_TESTS || 0
  d.i = i
})

days = days
  .filter(d => d.i <= maxDate)
  .map(d => {
    var rv = [d.i, d.cases] // fmt for simple stats
    rv.DATE = d.DATE
    rv.cases = d.cases
    rv.dateStr = d3.timeFormat('%b %e')(d.date)
    rv.i = d.i
    return rv
  })

var sel = d3.select('#graph').html('')

var bars = [
  {i: 23},
  {i: 47},
  {i: 69},
]

var lines = [
  {i: bars[0].i, j: bars[1].i, color: d3.color('darkorange').darker(.2) + ''},
  {i: bars[1].i, j: bars[2].i, color: 'green'},
]
lines.forEach(d => d.days = days.map(d => ({i: d.i})))

d3.selectAll('.underline').data(lines)
  .st({borderBottom: d => `2px ${d3.color(d.color).brighter(.3)} dotted`})


function initCases(){
  var c = d3.conventions({
    sel: sel.append('div').st({position: 'relative', zIndex: 1}), 
    margin: {left: 40},
    totalHeight: 250,
    totalWidth: 960,
  })

  c.x.domain([0, maxDate])
  c.y.domain([0, 6500])

  c.xAxis.tickSizeOuter(0).tickValues(d3.range(0, maxDate, 7)).tickFormat(d => days[d].dateStr)  
  c.yAxis.ticks(5)
  d3.drawAxis(c)

  c.svg.select('.y .tick:last-child text')
    .select(function() { return this.parentNode.insertBefore(this.cloneNode(0), this.nextSibling) })
    .text('New Cases in NYC')
    .at({textAnchor: 'start', x: -6})
    .parent().select('line').remove()


  var barWidth = Math.floor(c.x(1)) - 1
  var barPathFn = d => ['M', d.x || Math.round(c.x(d.i)), c.y(d.cases), 'V', c.height].join(' ')
  c.svg.appendMany('path', days)
    .at({
      d: barPathFn,
      stroke: '#ddd',
      strokeWidth: barWidth,
    })

  bars.forEach(d => {
    d.x = c.x(d.i)
    d.cases = c.y.domain()[1]
  })

  var drag = d3.drag()
    .on('start', d => {
      bars.forEach(e => e.isDragging = e == d)
      sel.st({cursor: 'pointer'})
      __timer.stop()
    })
    .on('drag', d => {
      d.x = d3.clamp(0, d3.event.x, c.x.range()[1])
      d.i = d3.clamp(0, Math.round(c.x.invert(d.x)), maxDate)
      render()
    })
    .on('end', d => {
      d.x = c.x(d.i)
      barSel.filter(d => d.isDragging).transition().duration(300)
        .at({d: barPathFn})
      sel.st({cursor: 'auto'})
    })

  var barSel = c.svg.appendMany('path', bars)
    .at({
      d: barPathFn,
      strokeWidth: barWidth + 10,
      opacity: .5,
      stroke: 'steelblue',
      cursor: 'pointer',
    })
    .call(drag)

  c.svg.appendMany('path', lines)
    .at({
      stroke: d => d.color,
      strokeDasharray: '2 2',
      strokeWidth: 2, 
    })
    .each(function(d){ d.pathSel = d3.select(this) })

  c.svg.appendMany('path', lines)
    .at({id: d => d.color})
    .each(function(d){ d.pathSel2 = d3.select(this) })

  c.svg.appendMany('text', lines)
    .at({dy: '-.33em'})
    .append('textPath')
    .at({fill: d => d.color, href: d => '#' + d.color, dy: '1em', textAnchor: 'middle'})
    .attr('startOffset', '50%')
    .each(function(d){ d.textSel = d3.select(this) })

  var dropSel = c.svg.append('path')
    .at({stroke: '#000', d: ['M .5 ', c.height, 'v', 250].join(' ')})
    .st({pointerEvents: 'none'})

  // c.svg.append('text').text('😷')
  //   .translate([c.x(47), c.height])
  //   .at({dy: '.33em', fontSize: 10, textAnchor: 'middle'})

  window.annos = [
  {
    "path": "M -35,37 A 33.857 33.857 0 0 0 -1,3",
    "text": "Mandatory 😷",
    "textOffset": [
      -125,
      41
    ]
  }
]
  var swoopy = d3.swoopyDrag()
      .draggable(1)
      .draggable(0)
      .x(d => c.x(47))
      .y(d => c.height)
      .annotations(annos)

  var swoopySel = c.svg.append('g.annotations')
  swoopySel.call(swoopy)
  swoopySel.selectAll('path').attr('marker-end', 'url(#arrowhead)')
  // swoopySel.selectAll('text')
  //     .each(function(d){
  //       d3.select(this)
  //           .text('')                        //clear existing text
  //           .tspans(d3.wordwrap(d.text)) //wrap after 20 char
  //     })  


  return () => {
    bars.forEach(d => {
      if (d.isDragging) d.i = d3.clamp(0, Math.round(c.x.invert(d.x)), maxDate)
    })

    barSel.filter(d => d.isDragging).transition().duration(0)
      .at({d: barPathFn})

    var [min, mid, max] = _.sortBy(bars.map(d => d.i))
    bars.mid = mid

    dropSel.translate(c.x(mid), 0)

    days.forEach((day) => {
      var [i, j, k] = _.sortBy([min, day.i, max])

      updateLine(i, j, lines[0])
      updateLine(j, k, lines[1])
      function updateLine(i, j, line){
        var d = line.days[day.i]
        d.i = i
        d.j = j
        d.reg = ss.linearRegression(days.slice(i, j + 1))
      }
    })

    lines.forEach(line => {
      var {i, j, reg} = line.days[mid]
      var rl = ss.linearRegressionLine(reg)

      line.pathSel.at({d: [
        'M', c.x(i), c.y(rl(i)),
        'L', c.x(j), c.y(rl(j)),
        ].join(' ')
      })

      line.pathSel2.at({d: [
        'M', c.x(i - 10), c.y(rl(i - 10)),
        'L', c.x(j + 10), c.y(rl(j + 10)),
        ].join(' ')
      })

      var midX = (i + j)/2
      line.textSel
        .at({opacity: i != midX ? 1 : 0})
        .text(d3.format('+')(Math.round(reg.m)) + ' New Cases/Day')
    })
  }
}


function initSlope(){
  var c = d3.conventions({
    sel: sel.append('div').st({position: 'relative', zIndex: 0}), 
    margin: {left: 40, top: 40, bottom: 100},
    height: 190,
    totalWidth: 960,
  })

  c.svg.append('rect').at({width: c.width, height: c.height, fillOpacity: 0})
  c.svg
    .on('click', function(){
      __timer.stop()
      var mid = _.sortBy(bars, d => d.i)[1]
      mid.isDragging = true
      mid.x = d3.mouse(this)[0]
      render()
    })
    .st({cursor: 'pointer'})

  c.svg.parent().st({overflow: 'hidden'})

  c.x.domain([0, maxDate])
  c.y.domain([-150, 150]).interpolate(d3.interpolateRound)

  var line = d3.line()
    .x((d, i) => c.x(i))
    .y(d => c.y(d.reg.m))
    .curve(d3.curveStep)

  var lineSel = c.svg.appendMany('path', lines)
    .st({
      stroke: d => d.color,
      fill: 'none',
      strokeWidth: 2,
      pointerEvents: 'none',
    })

  var circleSel = c.svg.appendMany('circle', lines)
    .at({
      r: 4,
      fill: d => d.color,
      pointerEvents: 'none',
    })

  c.svg.append('linearGradient')
    .at({id: 'top', y2: 1, x1: 0, x2: 0, y1: 0})
    .append('stop')
    .at({offset: '0%', stopColor: 'rgba(245,245,245,1)'})
    .parent().append('stop')
    .at({offset: '100%', stopColor: 'rgba(245,245,245,.1)'})
  c.svg.append('rect')
    .at({width: c.width, height: c.margin.top, y: -c.margin.top, fill: 'url(#top)'})

  c.svg.append('linearGradient')
    .at({id: 'bot', y2: 0, x1: 0, x2: 0, y1: 1})
    .append('stop')
    .at({offset: '0%', stopColor: 'rgba(245,245,245,1)'})
    .parent().append('stop')
    .at({offset: '100%', stopColor: 'rgba(245,245,245,.1)'})
  c.svg.append('rect')
    .at({width: c.width, height: c.margin.bottom, y: c.height, fill: 'url(#bot)'})


  c.xAxis.tickSizeOuter(0).tickValues(d3.range(0, maxDate, 7)).tickFormat(d => days[d].dateStr)
  c.yAxis.ticks(5).tickFormat(d3.format('+'))

  d3.drawAxis(c)
  c.svg.select('.y .tick:last-child text')
    .select(function() { return this.parentNode.insertBefore(this.cloneNode(0), this.nextSibling) })
    .text('New Cases/Day')
    .at({textAnchor: 'start', x: -6})
    .parent().select('line').remove()

  return () => {
    lineSel.at({d: d => line(d.days)})

    circleSel.translate(d => [c.x(bars.mid), c.y(d.days[bars.mid].reg.m)])
  }

}



var renderCases = initCases()
var renderSlope = initSlope()

function render(){
  renderCases()
  renderSlope()
}
render()



if (window.__timer) window.__timer.stop()
window.__timer = d3.timer(t => {
  var s = (Math.sin(Math.PI*2*t/10000))/2 + .5

  var scale = d3.scaleLinear().range([420 - 70, 420 + 70])
  bars[1].x = scale(s)
  bars[1].isDragging = true
  render()
})

function resize(){
  var width = innerWidth > 960 ? 960 : d3.select('p').node().offsetWidth
  var r = width/960
  var isMobile = r != 1
  d3.select('#graph')
    .st({
      transform: `scale(${r})`, 
      transformOrigin: 0 + 'px ' + 0 + 'px', 
      height: isMobile ? r*500 : '',
      marginLeft: isMobile ? 0 : '',
      marginBottom: isMobile ? 20 : ''
    })
    .classed('mobile', isMobile)
}

d3.select(window).on('resize', _.debounce(resize, 250))
resize()






