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

// players = _.sortBy(players, 'start').reverse()

var c = d3.conventions({height: 250, parentSel: d3.select('#lines')})
c.x.domain([1950, 2015])
c.y.domain([0, players.length])

c.yAxis
    .tickFormat(function(d){ return players[d].name })
    .tickValues(d3.range(players.length))

c.drawAxis()

c.svg.dataAppend(players, 'g.player')
    .translate(function(d, i){ return [0, c.y(i)] })
  .append('line')
    .attr('x1', ƒ('start', c.x))
    .attr('x2', ƒ('stop' , c.x))
    .style({stroke: 'steelblue', 'stroke-width': 4})


players = _.sortBy(players, 'start')
players.forEach(function(d){ d.years = [] })


d3.range(1950, 2016).forEach(function(year){
  var currentHeight = 0
  players.forEach(function(d){
    if (d.start <= year && year <= d.stop){
      d.years.push({year: year, height: ++currentHeight})
      if (d.stop  == year) d.stopHeight  = currentHeight
      if (d.start == year) d.startHeight = currentHeight

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
    .y(ƒ('height', c.y))

c.svg.dataAppend(players, 'path.player')
    .attr('d', ƒ('years', line))

c.svg.dataAppend(players, 'circle.start')
    .attr({cx: ƒ('stop', c.x), cy: ƒ('stopHeight', c.y)})
    .attr({r: 3, fill: 'white'})

c.svg.dataAppend(players, 'circle.stop')
    .attr({cx: ƒ('start', c.x), cy: ƒ('startHeight', c.y)})
    .attr({r: 3, fill: 'steelblue'})

c.svg.dataAppend(players, 'text.name')
    .attr({x: ƒ('start', c.x), y: ƒ('startHeight', c.y)})
    .text(ƒ('name'))
    .attr({'text-anchor': 'end', 'dy': '.33em', 'dx': '-.5em'})


