var parentSel = d3.select('#slope').html('')

var bgcolor = '#f5f5f5'


var sel = parentSel.append('div')
var c = d3.conventions({
  sel, 
  margin: {left: 50, right: 70},
  height: 400,
})


c.y.domain([0, 810])
c.x.domain([0, 1])


var data = [
  [217, 328],
  [632, 810]
]

data.forEach((d, i) => d.line = !i ? 'L' : '7')


var line = c.svg.appendMany('g', data)
  .at({class: d => 'line-' + d.line})



line.append('path')
  .at({
    stroke: '#000',
    strokeWidth: 2,
    d: d => 'M' + [c.x(0), c.y(d[0])] + 'L' + [c.x(1), c.y(d[1])]
  })


line.appendMany('circle', d => d)
  .at({
    r: 4,
    strokeWidth: 2,
    cx: (d, i) => c.x(i),
    cy: c.y,
    // strokeDasharray: (d, i) => i ? '' : '2 2 2',
  })
  .st({fill: (d, i) => i ? '' : bgcolor })

line.appendMany('text', d => d)
  .at({
    x: (d, i) => c.x(i),
    y: c.y,
    dy: '.33em',
    textAnchor: (d, i) => i ? 'start' : 'end',
    dx: (d, i) => i ? 7 : -7,
  })
  .text(d => '$' + d + 'M')


var baseSel = c.svg.append('g.axis')
  .translate(c.height, 1)

baseSel.append('line')
  .at({x2: c.width, stroke: '#000'})
baseSel.append('line')
  .at({y2: 5, stroke: '#000'})
baseSel.append('line')
  .translate(c.width, 0)
  .at({y2: 5, stroke: '#000'})

baseSel.append('text')
  .text('Est. Cost')
  .at({
    textAnchor: 'middle',
    dy: 17
  })

baseSel.append('text')
  .text('Final Cost')
  .at({
    textAnchor: 'middle',
    x: c.width,
    dy: 17
  })

















// timeline


var sel = parentSel.append('div')
var c = d3.conventions({
  sel, 
  margin: {left: 50, right: 70},
  height: 400,
})


c.x.domain([0, 1])
c.y.domain([2020, 2000].map(d3.timeParse('%Y')))


c.svg.appendMany('g.axis', d3.range(2000, 2020, 2))
  .translate(d => [c.width/2, c.y(d3.timeParse('%Y')(d))])
  .append('text')
  .text(d => d)
  .at({textAnchor: 'middle', dy: '.33em'})


var color = {'L': '#878787', '7': '#BE00C1'}

var timeline = [
  {line: 'L', type: 0, t0: 'Oct. 1999', t1: 'April 2004'},
  {line: 'L', type: 1, t0: 'Dec. 1999', t1: 'March 2009'},

  {line: '7', type: 0, t0: 'June 2007', t1: 'Dec. 2013'},
  {line: '7', type: 1, t0: 'June 2010', t1: 'Nov. 2018'},
]

timeline.forEach(d => {
  d.d0 = d3.timeParse('%b %Y')(d.t0)
  d.d1 = d3.timeParse('%b %Y')(d.t1)
})


var line = c.svg.appendMany('g', timeline)
  .translate(d => c.x(d.type), 0)

line.append('path')
  .at({
    stroke: '#000',
    strokeWidth: 2,
    d: d => 'M' + [0, c.y(d.d0)] + 'V' + c.y(d.d1)
  })
  .st({
    stroke: d => color[d.line]
  })


line.append('circle')
  .at({
    r: 4,
    strokeWidth: 2,
    cy: d => c.y(d.d0),
  })
  .st({
    stroke: d => color[d.line],
    fill: bgcolor
  })

line.append('circle')
  .at({
    r: 4,
    strokeWidth: 2,
    cy: d => c.y(d.d1),
  })
  .st({
    stroke: d => color[d.line],
    fill: d => color[d.line]
  })



var baseSel = c.svg.append('g.axis')
  .translate(c.height, 1)

baseSel.append('line')
  .at({x2: c.width, stroke: '#000'})
baseSel.append('line')
  .at({y2: 5, stroke: '#000'})
baseSel.append('line')
  .translate(c.width, 0)
  .at({y2: 5, stroke: '#000'})

baseSel.append('text')
  .text('Est. Timeline')
  .at({
    textAnchor: 'middle',
    dy: 17
  })

baseSel.append('text')
  .text('Final Timeline')
  .at({
    textAnchor: 'middle',
    x: c.width,
    dy: 17
  })







window.tlanno = 
[
  {
    "x": 0,
    "y": 0,
    "path": "M -37,294 A 44.321 44.321 0 0 1 -16,228",
    "text": "The MTA planned on starting in 2007 and working for 6.5 years",
    "textOffset": [
      -105,
      310
    ]
  }
]

var swoopy = d3.swoopyDrag()
  .x(d => 0)
  .y(d => 0)
  .draggable(0)
  .annotations(tlanno)

var swoopySel = c.svg.append('g.swoopy').call(swoopy)

swoopySel.selectAll('path')
  .attr('marker-end', 'url(#arrow)')
  .at({fill: 'none', stroke: '#000', strokeWidth: .6})

swoopySel.selectAll('text')
    .each(function(d){
      d3.select(this)
          .text('')                        //clear existing text
          .tspans(d3.wordwrap(d.text, 20)) //wrap after 20 char
    })




