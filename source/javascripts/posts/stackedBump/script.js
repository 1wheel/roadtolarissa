var players = [
  {name: 'Kareem',    start: 1970,  stop: 1989},
  {name: 'Jordan',    start: 1985,  stop: 2003},
  {name: 'Russell',   start: 1957,  stop: 1969},
  {name: 'Wilt',      start: 1959,  stop: 1969},
  {name: 'Kobe',      start: 1997,  stop: 2015},
  {name: 'Duncan',    start: 1998,  stop: 2015},
  {name: 'Shaq',      start: 1993,  stop: 2011},
  {name: 'Cousy',     start: 1951,  stop: 1963},
  {name: 'Garnett',   start: 1995,  stop: 2015},
  {name: 'West',      start: 1961,  stop: 1974},
  {name: 'Magic',     start: 1980,  stop: 1996},
  {name: 'K. Malone', start: 1986,  stop: 2004},
  {name: 'LeBron',    start: 2004,  stop: 2015},
  {name: 'Olajuwon',  start: 1985,  stop: 2002},
  {name: 'Bird',      start: 1980,  stop: 1982},
  {name: 'Hayes',     start: 1969,  stop: 1984},
  {name: 'Robertson', start: 1975,  stop: 1995},
  {name: 'M. Malone', start: 1975,  stop: 1995},
  {name: 'Schayes',   start: 1950,  stop: 1964},
  {name: 'Dirk',      start: 1999,  stop: 2015},
  {name: 'Stockton',  start: 1961,  stop: 1974},
  {name: 'Pettit',    start: 1955,  stop: 1965},
  {name: 'Isiah',     start: 1982,  stop: 1994},
]

players = _.sortBy(players, 'start').reverse()

var c = d3.conventions({height: 250, parentSel: d3.select('#lines')})
c.x.domain([1950, 2015])
c.y.domain([0, players.length - 1])

c.yAxis
    .tickFormat(function(d){ return players[d].name })
    .tickValues(d3.range(players.length))

c.drawAxis()

c.svg.dataAppend(players, 'line.player')
    .attr('x1', ƒ('start', c.x))
    .attr('x2', ƒ('stop' , c.x))
    .translate(function(d, i){ return [0, c.y(i)] })
    .style({stroke: 'steelblue', 'stroke-width': 4})




var players = [
  {name: 'Kareem',    start: 1970,  stop: 1989},
  {name: 'Jordan',    start: 1985,  stop: 2003},
  {name: 'Russell',   start: 1957,  stop: 1969},
  {name: 'Wilt',      start: 1959,  stop: 1969},
  {name: 'Kobe',      start: 1997,  stop: 2015},
  {name: 'Duncan',    start: 1998,  stop: 2015},
  {name: 'Shaq',      start: 1993,  stop: 2011},
  {name: 'Cousy',     start: 1951,  stop: 1963},
  {name: 'Garnett',   start: 1995,  stop: 2015},
  {name: 'West',      start: 1961,  stop: 1974},
  {name: 'Magic',     start: 1980,  stop: 1996},
  {name: 'K. Malone', start: 1986,  stop: 2004},
  {name: 'LeBron',    start: 2004,  stop: 2015},
  {name: 'Olajuwon',  start: 1985,  stop: 2002},
  {name: 'Bird',      start: 1980,  stop: 1992},
  {name: 'Hayes',     start: 1969,  stop: 1984},
  {name: 'Robertson', start: 1975,  stop: 1995},
  {name: 'M. Malone', start: 1975,  stop: 1995},
  {name: 'Schayes',   start: 1950,  stop: 1964},
  {name: 'Dirk',      start: 1999,  stop: 2015},
  {name: 'Stockton',  start: 1961,  stop: 1974},
  {name: 'Pettit',    start: 1955,  stop: 1965},
  {name: 'Isiah',     start: 1982,  stop: 1994},
]


players = _.sortBy(players, 'start')
players.forEach(function(d){ d.years = [] })


d3.range(1950, 2016).forEach(function(year){
  var numActiveBefore = 0
  players.forEach(function(d){
    if (d.start <= year && year <= d.stop){
      if (d.stop  == year) d.stopHeight  = numActiveBefore
      if (d.start == year) d.startHeight = numActiveBefore
      d.years.push({year: year, numActiveBefore: numActiveBefore++})
    }
  })
})


var c = d3.conventions({height: 120, parentSel: d3.select('#bump')})

c.x.domain([1950, 2015])
c.y.domain([0, 10])

c.yAxis.ticks(2)

c.drawAxis()

var line = d3.svg.line()
    .x(ƒ('year', c.x))
    .y(ƒ('numActiveBefore', c.y))

c.svg.dataAppend(players, 'path.player')
    .attr('d', ƒ('years', line))





var c = d3.conventions({height: 120, parentSel: d3.select('#bump-circles')})

c.x.domain([1950, 2015])
c.y.domain([0, 10])

c.yAxis.ticks(2)

c.drawAxis()

var line = d3.svg.line()
    .x(ƒ('year', c.x))
    .y(ƒ('numActiveBefore', c.y))

c.svg.dataAppend(players, 'path.player')
    .attr('d', ƒ('years', line))

c.svg.dataAppend(players, 'circle.start')
    .attr({cx: ƒ('stop', c.x), cy: ƒ('stopHeight', c.y)})
    .attr({r: 3, fill: 'white'})

c.svg.dataAppend(players, 'circle.stop')
    .attr({cx: ƒ('start', c.x), cy: ƒ('startHeight', c.y)})
    .attr({r: 3, fill: 'steelblue'})

c.svg.dataAppend(players, 'text.name')
    .attr('x', ƒ('start', c.x))
    .attr('y', ƒ('years', 0, 'numActiveBefore', c.y))
    .text(ƒ('name'))
    .attr({'text-anchor': 'end', 'dy': '.33em', 'dx': '-.5em'})





var playersLabelOffsets = {
  "Russell": [
    -2,
    0
  ],
  "Wilt": [
    -3,
    0
  ],
  "Kareem": [
    31,
    -10
  ],
  "M. Malone": [
    22,
    -10
  ],
  "K. Malone": [
    1,
    -11
  ],
  "Hayes": [
    0,
    0
  ],
  "Stockton": [
    -2,
    -1
  ],
  "Robertson": [
    53,
    -1
  ],
  "Olajuwon": [
    -2,
    -10
  ],
  "Jordan": [
    -3,
    -9
  ],
  "LeBron": [
    44,
    -2
  ],
  "Kobe": [
    32,
    -1
  ],
  "Duncan": [
    43,
    -1
  ],
  "Dirk": [
    25,
    -9
  ],
  "Garnett": [
    21,
    -11
  ],
  "Shaq": [
    2,
    -9
  ],
  "Cousy": [
    -2,
    -2
  ],
  "Schayes": [
    -4,
    -1
  ],
  "Pettit": [
    -3,
    0
  ],
  "Isiah": [
    -3,
    -1
  ],
  "Bird": [
    -1,
    0
  ],
  "Magic": [
    -2,
    0
  ],
  "West": [
    -1,
    0
  ]
}





var c = d3.conventions({height: 120, parentSel: d3.select('#bump-drag')})

c.x.domain([1950, 2015])
c.y.domain([0, 10])

c.yAxis.ticks(2)

c.drawAxis()

var line = d3.svg.line()
    .x(ƒ('year', c.x))
    .y(ƒ('numActiveBefore', c.y))

c.svg.dataAppend(players, 'path.player')
    .attr('d', ƒ('years', line))

c.svg.dataAppend(players, 'circle.start')
    .attr({cx: ƒ('stop', c.x), cy: ƒ('stopHeight', c.y)})
    .attr({r: 3, fill: 'white'})

c.svg.dataAppend(players, 'circle.stop')
    .attr({cx: ƒ('start', c.x), cy: ƒ('startHeight', c.y)})
    .attr({r: 3, fill: 'steelblue'})




var posText = c.svg.append('text')
    .translate([50, 10])
    .style('font-size', '150%')
    .style('font-family', 'monospace')

var drag = d3.behavior.drag()
  .on('drag', function(d){
    var pos = d3.mouse(c.svg.node())
    var x = pos[0] - d3.select(this).attr('x') + 5
    var y = pos[1] - d3.select(this).attr('y') + 259
    var offset = [x, y].map(Math.round)
    
    playersLabelOffsets[d.name] = offset
    d3.select(this).translate(offset)

    posText.text('offset: ' + offset)
  })
  .on('dragstart', function(){ posText.style('opacity', 1) })
  .on('dragend',   function(){ posText.style('opacity', 0) })




c.svg.dataAppend(players, 'text.name')
    .attr('x', ƒ('start', c.x))
    .attr('y', ƒ('years', 0, 'numActiveBefore', c.y))
    .translate(function(d){ return playersLabelOffsets[d.name] || [0, 0] })
    .text(ƒ('name'))
    .attr({'text-anchor': 'end', 'dy': '.33em', 'dx': '-.5em'})
    .call(drag)
    .style('cursor', 'pointer')








var playerSegments = [
  {name: 'Kareem',    start: 1970,  stop: 1989},
  {name: 'Jordan',    start: 1985,  stop: 1993},
  {name: 'Jordan',    start: 1994,  stop: 1998},
  {name: 'Jordan',    start: 2002,  stop: 2003},
  {name: 'Russell',   start: 1957,  stop: 1969},
  {name: 'Wilt',      start: 1959,  stop: 1969},
  {name: 'Kobe',      start: 1997,  stop: 2015},
  {name: 'Duncan',    start: 1998,  stop: 2015},
  {name: 'Shaq',      start: 1993,  stop: 2011},
  {name: 'Cousy',     start: 1951,  stop: 1963},
  {name: 'Garnett',   start: 1995,  stop: 2015},
  {name: 'West',      start: 1961,  stop: 1974},
  {name: 'Magic',     start: 1980,  stop: 1991},
  {name: 'Magic',     start: 1996,  stop: 1996},
  {name: 'K. Malone', start: 1986,  stop: 2004},
  {name: 'LeBron',    start: 2004,  stop: 2015},
  {name: 'Olajuwon',  start: 1985,  stop: 2002},
  {name: 'Bird',      start: 1980,  stop: 1992},
  {name: 'Hayes',     start: 1969,  stop: 1984},
  {name: 'Robertson', start: 1975,  stop: 1995},
  {name: 'M. Malone', start: 1975,  stop: 1995},
  {name: 'Schayes',   start: 1950,  stop: 1964},
  {name: 'Dirk',      start: 1999,  stop: 2015},
  {name: 'Stockton',  start: 1961,  stop: 1974},
  {name: 'Pettit',    start: 1955,  stop: 1965},
  {name: 'Isiah',     start: 1982,  stop: 1994},
]

playerSegments = _.sortBy(playerSegments, 'start')


var players = d3.nest().key(ƒ('name')).entries(playerSegments)
players.forEach(function(d){
  d.start = d.values[0].start
  d.stop  = _.last(d.values).stop
  d.name  = d.key
  d.years = []
})

d3.range(1950, 2016).forEach(function(year){
  var numActiveBefore = 0
  players.forEach(function(d){
    if (d.start <= year && year <= d.stop){
      if (d.stop  == year) d.stopHeight  = numActiveBefore
      if (d.start == year) d.startHeight = numActiveBefore
      d.years.push({year: year, numActiveBefore: numActiveBefore++})
    }
  })
})


players.forEach(function(player){
  player.values.forEach(function(segment){
    segment.years = player.years.filter(function(year){
      return segment.start <= year.year && year.year <= segment.stop
    })
  })
})


var c = d3.conventions({height: 120, parentSel: d3.select('#bump-thin')})

c.x.domain([1950, 2015])
c.y.domain([0, 10])

c.yAxis.ticks(2)

c.drawAxis()

var line = d3.svg.line()
    .x(ƒ('year', c.x))
    .y(ƒ('numActiveBefore', c.y))

c.svg.dataAppend(players, 'path.player')
    .attr('d', ƒ('years', line))
    .style('stroke-width', 1)

c.svg.dataAppend(players, 'circle.start')
    .attr({cx: ƒ('stop', c.x), cy: ƒ('stopHeight', c.y)})
    .attr({r: 3, fill: 'white'})

c.svg.dataAppend(players, 'circle.stop')
    .attr({cx: ƒ('start', c.x), cy: ƒ('startHeight', c.y)})
    .attr({r: 3, fill: 'steelblue'})




c.svg.dataAppend(players, 'text.name')
    .attr('x', ƒ('start', c.x))
    .attr('y', ƒ('years', 0, 'numActiveBefore', c.y))
    .translate(function(d){ return playersLabelOffsets[d.name] || [0, 0] })
    .text(ƒ('name'))
    .attr({'text-anchor': 'end', 'dy': '.33em', 'dx': '-.5em'})










var c = d3.conventions({height: 120, parentSel: d3.select('#bump-break')})

c.x.domain([1950, 2015])
c.y.domain([0, 10])

c.yAxis.ticks(2)

c.drawAxis()

var line = d3.svg.line()
    .x(ƒ('year', c.x))
    .y(ƒ('numActiveBefore', c.y))

c.svg.dataAppend(players, 'path.player')
    .attr('d', ƒ('years', line))
    .style('stroke-width', 1)
c.svg.dataAppend(playerSegments, 'path.player')
    .attr('d', ƒ('years', line))

c.svg.dataAppend(players, 'circle.start')
    .attr({cx: ƒ('stop', c.x), cy: ƒ('stopHeight', c.y)})
    .attr({r: 3, fill: 'white'})

c.svg.dataAppend(players, 'circle.stop')
    .attr({cx: ƒ('start', c.x), cy: ƒ('startHeight', c.y)})
    .attr({r: 3, fill: 'steelblue'})




c.svg.dataAppend(players, 'text.name')
    .attr('x', ƒ('start', c.x))
    .attr('y', ƒ('years', 0, 'numActiveBefore', c.y))
    .translate(function(d){ return playersLabelOffsets[d.name] || [0, 0] })
    .text(ƒ('name'))
    .attr({'text-anchor': 'end', 'dy': '.33em', 'dx': '-.5em'})


// d3.selectAll('svg')
//     .style('display', 'none')
//   .transition()
//   .duration(10)
//   .delay(function(d, i){ return i*1000 })
//     .style('display', 'block')
//   .transition()
//   .delay(function(d, i){ return i*1000 + 1000})
//   .duration(0)
//     .style('display', function(d, i){ return i == 5 ? 'block' : 'none' })
