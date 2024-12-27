window.visState = window.visState || {
}

var ttSel = d3.select('.tooltip')


window.init = function(){
  console.clear()

  window.byDay = d3.nestBy(tidy, d => d.day)

  var prevInnerWidth = -1
  function drawDays(){
    if (prevInnerWidth == window.innerWidth) return 
    prevInnerWidth = window.innerWidth

    d3.select('.graph').html('')
      .appendMany('div.day', byDay)
      .each(drawDate)

    byDay.forEach(day => day.setName(util.params.get('name')))
    window.initSwoopy(window.annotations, byDay[0].c)
  }
  drawDays()
  d3.select(window).on('resize', _.throttle(drawDays, 200))


  // stats
  console.log('<30s & year < 22', tidy.filter(d => d.seconds < 30 && d.part == 1 && d.year < 2022).length)
  console.log('<30s & year = 24', tidy.filter(d => d.seconds < 30 && d.part == 1 && d.year == 2024).length)
  console.log('<20s & year = 24', tidy.filter(d => d.seconds < 20 && d.part == 1 && d.year == 2024).length)
  console.log('<10s & year = 24', tidy.filter(d => d.seconds < 10 && d.part == 1 && d.year == 2024).length)

  console.log('fastest solves')
  console.table(tidy.filter(d => d.seconds < 30 && d.part == 1))

  // '2024_12' 3 numBoth — avg is 64.3
  var byProblem = d3.nestBy(tidy, d => d.year + '_' + d.day)
  byProblem.forEach(problem => {
    problem.numBoth = d3.nestBy(problem, d => d.name).filter(d => d.length == 2).length

    var p1 = problem.filter(d => d.part == 1)
    var p2 = problem.filter(d => d.part == 2)
    problem.ratio = d3.max(problem, d => d.seconds)/d3.min(problem, d => d.seconds)
    problem.ratiop1 = d3.max(p1, d => d.seconds)/d3.min(p1, d => d.seconds)
    problem.ratiop2 = d3.max(p2, d => d.seconds)/d3.min(p2, d => d.seconds)
    problem.diffp1 = d3.max(p1, d => d.seconds) - d3.min(p1, d => d.seconds)
    problem.ratiop1_12 = p1[1].seconds/p1[0].seconds
    problem.diffp1_12 = p1[1].seconds - p1[0].seconds
  })
  console.log('daily summary stats')
  console.table(byProblem.map(({key, numBoth, ratio, ratiop1, ratiop2, diffp1, ratiop1_12, diffp1_12}) => ({key, numBoth, ratio, ratiop1, ratiop2, diffp1, ratiop1_12, diffp1_12})))
  // console.log(d3.mean(byProblem, d => d.numBoth))
  console.log('Reloaded with the dev tools open to see more data tables')
  // http://localhost:3989/advent-of-code/?name=Adam%2520Pearce
}

function drawDate(dayData){
  var c = d3.conventions({
    sel: d3.select(this).append('div').classed('day-' + dayData.key, 1),
    height: 200,
    layers: 'scs',
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

  c.x.interpolate(d3.interpolate)
  c.y.interpolate(d3.interpolate)

  c.svg.append('text.day-label').text('Day ' + dayData.key)
    .at({fill: '#999', fontSize: 9, x: c.width - 5, textAnchor: 'end', dy: 14})

  d3.nestBy(dayData, d => d.part + '_' + d.year)
    .forEach(part => part.forEach((d, i) => d.rank = i))

  var yw = c.x(2016) - c.x(2015) 
  var s = 1.1
  dayData.forEach(d => {
    d.px = c.x(d.year)     + d.rank/100*yw/2
    d.py = c.y(d.seconds)
  })

  var ctx = c.layers[1]
  // d3.nestBy(dayData, d => d.name + '_' + d.year)
  //   .filter(d => d.length == 2)
  //   .forEach(([a, b]) => {
  //     ctx.beginPath()
  //     ctx.strokeStyle = 'rgba(255,255,255,.04)'
  //     ctx.strokeWidth = .01
  //     ctx.moveTo(a.px, a.py)
  //     ctx.lineTo(b.px, b.py)
  //     ctx.stroke()
  //   })

  dayData.forEach(d =>{
    ctx.beginPath()
    ctx.fillStyle = d.part == 1 ? '#9999cc' : '#ffff66'
    ctx.moveTo(d.px + s, d.py)
    ctx.arc(d.px, d.py, s, 0, 2 * Math.PI)
    ctx.fill()
  })

  c.sel.select('canvas').st({pointerEvents: 'none'})
  c.layers[2].parent().st({pointerEvents: 'none'})

  var nameSel = c.layers[2].appendMany('circle.glow', d3.range(20))
    .st({r: 3, stroke: '#0c0', fill: 'none', display: 'none'})

  function findMatch([px, py]){
    function calcDist(d){
      var dx = d.px - px
      var dy = d.py - py
      return dx*dx + dy*dy
    }

    var match = _.minBy(dayData, calcDist)
    var dist = calcDist(match)
    return {match, dist}
  }

  c.svg
    .st({cursor: 'pointer'})
    .on('mousemove', function(){
      if (d3.event.shiftKey) return
      var {match, dist} = findMatch(d3.mouse(this))
      setActive(dist < 400 ? match : null)
    })
    .on('click', function(){
      if (d3.event.shiftKey) return
      var {match, dist} = findMatch(d3.mouse(this))
      window.open(`https://adventofcode.com/${match.year}/day/${match.day}`, '_blank')
    })
    .on('mouseleave', () => {
      if (d3.event.shiftKey) return
      setActive(null)
    })
    .call(d3.attachTooltip)
    .on('mouseover.attachTooltip', _ => null)

  function setActive(d){
    byDay.forEach(day => day.setName(d?.name))
    util.params.set('name', d?.name)

    if (!d) return ttSel.classed('tooltip-hidden', 1)
    // console.log(d)
    ttSel.classed('tooltip-hidden', 0)
      .html(`
        <div>${d.year} Day ${d.day} Part ${d.part}</div>
        <div>solved in ${d.seconds}s by</div>
        <div class='glow'>${d.name}</div>
      `)
  }

  dayData.setName = name => {
    var zeros = d3.range(20).map(_ => 0)
    var nameData = dayData.filter(d => d.name == name).concat(zeros).slice(0, 20)
    nameSel.data(nameData)
      .st({display: d => d ? '' : 'none'})
      .filter(d => d)
      .translate(d => [d.px, d.py])
  }
  dayData.c = c
}



if (!window.tidy){
  d3.loadData('https://roadtolarissa.com/data/2024-advent-of-code-tidy.tsv', (err, res) => {
    window.tidy = res[0]

    tidy.forEach(d => {
      d.part = +d.part
      d.seconds = +d.seconds
      d.year = +d.year
      d.day = +d.day
    })
    init()
  })
} else{
  init()
}

