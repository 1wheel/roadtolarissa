console.clear()
var ttSel = d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var teams = 'KZ FW RNG FNC EVS TL'.split(' ')
// var teams = 'FW'.split(' ')

// array of functions that get called when match selections are updated
var highlightFns = []
var mouseoverFns = []
var scrollFns = []

var activeTeam = 'FW'

var highlightScenarios = '000000000000'.split('').map(d => +d)
var mouseover = [64, 64]


var colors = {t: '#4CAF50', f: '#F44336', m: '#FF9800'}
d3.entries(colors).forEach(({key, value}) => {
  var c = d3.color(value)
  c.opacity = .2
  colors[key + '0'] = c + ''
})

function color(d, team){
  return colors[d[team] + (d.active ? '' : '0')]
}


d3.loadData('matches.tsv', 'scenarios.tsv', (err, res) => {
  [games, scenarios] = res

  games.forEach((d, i) =>{
    d.i = i
    d.j = i - 18
    d[d.t1] = '1'
    d[d.t2] = '2'
  })

  ngames = games.slice(-12)

  scenarios.forEach(d => {
    d.active = true
  })

  drawGames()

  var teamSel = d3.select('#graph').html('')
    .appendMany('div.team-container', teams.concat('All Teams'))
    .each(drawTeam)

  var actualTeamSel = teamSel.filter((d, i) => i < 6)

  gs = d3.graphScroll()
    .eventId('lol-scroll')
    .on('active', function(i){
      activeTeam = teams[i] || 'All Teams'
      console.log(activeTeam)

      var allTeamT = (d, i) => {
        var yi = Math.floor(i/2)
        var xi = i % 2

        return `translate(
          ${-120 + xi*300}px, 
          ${692*(6 - i) - 90 + yi*660/2}px) 
          scale(.5)`
      }
      var defaultT = `translate(0px, 0px) scale(1)`

      actualTeamSel
        // .transition().duration(1000)
        .st({transform: activeTeam == 'All Teams' ? allTeamT : defaultT})

      scrollFns.forEach(d => d(activeTeam))

      d3.selectAll('.team-name')
        .classed('active-team', d => d == activeTeam)
      d3.selectAll('.team')
        .classed('active-team', d => d.team == activeTeam)

    })
    .container(d3.select('#container'))
    .sections(teamSel)


})


function drawTeam(team){
  teamGames = games
    .filter(d => d.t1 == team || d.t2 == team)
    .slice(-4)

  var teamV = team + 'v' 

  teamGames.forEach(d => {
    d[teamV] = d.t1 == team ? d.t2 : d.t1
  })

  gameOrder = _.uniq(teamGames.map(d => d.j).concat(d3.range(12)))

  scenarios.forEach(d => {
    d.ogstr = []
    d.nStr = gameOrder.map((e, i) => {
      var c = d.str[e]
      d.ogstr.push(c)

      if (teamGames[i] && teamGames[i].t2 == team){
        c = c == 1 ? 2 : 1
      }
      return c
    }).join('')

    d.ogstr = d.ogstr.map(d => d - 1).join('')
    d.games = d.nStr.split('').map(d => d - 1)
    d.nStr = d.games.join('')

    d[team + 'x'] = d3.sum(
      d.games.filter((d, i) => i % 2 == 0), 
      (d, i) => { return d ? 1 << (5 - i) : 0 }
    )

    d[team + 'y'] = d3.sum(
      d.games.filter((d, i) => i % 2 == 1), 
      (d, i) => d ? 1 << (5 - i) : 0
    )
  })


  var sel = d3.select(this).html('')

  sel.append('div.team-name').text(team)
  var c = d3.conventions({
    sel, 
    margin: {left: 50, top: 50, bottom: 50}, 
    width: 512, 
    height: 512,
    layers: 'cs'
  })

  if (team == 'All Teams'){
    return
  }

  var {width, height, svg, layers: [ctx]}  = c


  c.x.domain([0, 64])
  c.y.domain([0, 64]).domain([64, 0])

  var s = c.x(1)

  function drawCanvas(){
    ctx.clearRect(0, 0, width, height)

    scenarios.forEach(d => {
      ctx.beginPath()
      ctx.fillStyle = color(d, team)
      ctx.rect(
        c.x(d[team + 'x']), 
        c.y(d[team + 'y']), 
        s - .1, 
        s - .1
      )
      ctx.fill()
    })
  }
  drawCanvas()
  highlightFns.push(drawCanvas)



  addAxisLabels(c, teamGames, team, teamV)
  var labelSel = svg.selectAll('.label')

  var mouseoverRect = c.svg.append('rect.hover-rect')
    .at({width: s, height: s, fillOpacity: 0, stroke: '#000', opacity: 0})

  mouseoverFns.push(m => {
    mouseoverRect
      .translate([c.x(m[0]), c.y(m[1])])
      .classed('underline', 1)

    labelSel.classed('underline', d => m.scenario.str[d.game.j] == d.teamNum)
  })

  highlightFns.push(() => {
    labelSel
      .classed('active', d => {
        var hs = highlightScenarios[d.game.j]
        return hs == 0 ? 1 : hs == d.teamNum
      })
      .classed('picked', d => highlightScenarios[d.game.j])
  })

  c.svg.append('rect')
    .at({width, height, fillOpacity: 0})
    .call(d3.attachTooltip)

    .on('mousemove mouseover', function(){
      var [xp, yp] = d3.mouse(this)

      var x = d3.clamp(0, Math.floor(c.x.invert(xp)), 63)
      var y = d3.clamp(0, Math.floor(c.y.invert(yp)), 63)

      var searchObj = {}
      searchObj[team + 'x'] = x
      searchObj[team + 'y'] = y
      var d = _.find(scenarios, searchObj)
      // console.log(d)
      ttSel.html([d.ogstr, d.nStr, d[team],d.str, d.x, d.y].join('<br>'))

      ttSel.html('')
      ttSel.appendMany('div.team-result', teams)
        .text(d => d)
        .st({background: e => colors[d[e]]})

      mouseover = [x, y]
      mouseover.scenario = d
      mouseoverFns.forEach(d => d(mouseover))
    })
    .on('mouseout', () => {
      d3.selectAll('.underline').classed('underline', false)
    })
}

function drawGames(){
  var sel = d3.select('#games').html('')

  sel.append('div.day-label').text('Day 4')

  var gameSel = sel.appendMany('div.game', ngames)

  sel.insert('div.day-label', ':nth-child(8n)').text('Day 5')

  var t1Sel = gameSel.append('span.team').text(d => d.t1)
  gameSel.append('span.v-span').text(d => ' v ')
  var t2Sel = gameSel.append('span.team').text(d => d.t2)

  var teamSel = gameSel.selectAll('.team')
    .each(function(d, i){
      d3.select(this).datum({game: d, teamNum: i + 1, team: d['t' + (i + 1)]})
    })
    .on('click', function(d){
      var cur = highlightScenarios[d.game.j]
      highlightScenarios[d.game.j] = cur == d.teamNum ? 0 : d.teamNum

      scenarios.forEach(s => {
        s.active = highlightScenarios.every((g, i) =>
          g == 0 ? true : s.str[i] == g)
      })

      highlightFns.forEach(d => d())

      teamSel
        .classed('active', d => {
          var hs = highlightScenarios[d.game.j]
          return hs == 0 ? 1 : hs == d.teamNum
        })

      gameSel.classed('active', d => highlightScenarios[d.j] != 0)

      setTimeout(updateLines, 20)
    })
    .classed('active', true)

  var width = 112
  var lineScale = d3.scaleLinear().range([0, width*1.3])
  var lineSel = gameSel.append('svg')
    .at({height: 6, width})
    .st({marginTop: -6, position: 'relative', top: -11})
    .appendMany(
      'path.outcome-line', 
      game => [{game, type: 't'}, {game, type: 'm'}, {game, type: 'f'}]
    )
    .translate((d, i) => [width/2, i*3])
    .at({stroke: d => colors[d.type], d: 'M 0 0 H 0'})

  function updateLines(){
    // console.time('linecalc')
    ngames.forEach(game => {
      var outcomeArray = highlightScenarios.join('').split('')
      
      outcomeArray[game.j] = 1
      game.t1Win = calcPercents(outcomeArray)

      outcomeArray[game.j] = 2
      game.t2Win = calcPercents(outcomeArray)

      game.dif = {
        t: game.t2Win.pt - game.t1Win.pt,
        m: game.t2Win.pm - game.t1Win.pm,
        f: game.t2Win.pf - game.t1Win.pf,
      }

      if (activeTeam == 'All Teams') game.dif = {t: 0, m: 0, f: 0}

      // console.log(game.dif)
    })
    // console.timeEnd('linecalc')

    lineSel.transition()
      .at({d: d => 'M 0 0 H ' + lineScale(d.game.dif[d.type])})
  }
  updateLines()
  scrollFns.push(updateLines)

  mouseoverFns.push(m => {
    teamSel.classed('underline', d => {
      return m.scenario.str[d.game.j] == d.teamNum
    })


  })
}

function calcPercents(highlightScenarios){
  var rv = {t: 0, f: 0, m: 0}

  scenarios.forEach(s => {
    var active = highlightScenarios.every((g, i) =>
      g == 0 ? true : s.str[i] == g)

    if (!active) return

    rv[s[activeTeam]] ++
  })

  rv.total = rv.t + rv.m + rv.f

  rv.pt = rv.t/rv.total
  rv.pm = rv.m/rv.total
  rv.pf = rv.f/rv.total

  return rv
}







function addAxisLabels(c, teamGames, team, teamV){
  var {width, height} = c

  var axisSel = c.svg.append('g').appendMany('g', d3.range(16, 16*4, 16))
  axisSel.append('path')
    .at({d: d => `M 0 ${c.x(d)} H ${c.height}`, stroke: '#fff'})
  axisSel.append('path')
    .at({d: d => `M ${c.y(d)} 0 V ${c.width}`, stroke: '#fff'})

  var axisLabelSel = c.svg.append('g.axis')

  var rxPath = ['M', 10, -14, 'H', c.x(16) - 10, 'V', 4, 'H', 10, 'Z'].join(' ')
  var longTriPath = ['M', c.x(-8), 15, 'L', c.x(8), 4, 'L', c.x(24), 15].join(' ')
  var shortTriPath = ['M', 1, -30, 'L', c.x(8), -15, 'L', c.x(16), -30].join(' ')

  var game = teamGames[0]
  axisLabelSel.appendMany('g', [2])
    .translate(d => [width/4*d, -15])
    .appendMany('g.label', [
      {game, teamNum: game[team], text: 'Beat ' + game[teamV]},
      {game, teamNum: game[team] == 1 ? 2 : 1, text: 'Lose To ' + game[teamV]},
    ])
    .translate((d, i) => i ? c.x(8) : -c.x(24), 0)
    .append('text')
    .text(d => d.text).at({textAnchor: 'middle', x: c.x(8)})
    .parent().append('path').at({d: longTriPath})
    .parent().append('path.rect').at({d: rxPath})

  var game = teamGames[1]
  axisLabelSel.appendMany('g', [2])
    .at('transform', d => `rotate(-90) translate(${width*-.5}, -15)`)
    .appendMany('g.label', [
      {game, teamNum: game[team] == 1 ? 2 : 1, text: 'Lose To ' + game[teamV]},
      {game, teamNum: game[team], text: 'Beat ' + game[teamV]},
    ])
    .translate((d, i) => i ? c.x(8) : -c.x(24), 0)
    .append('text')
    .text(d => d.text).at({textAnchor: 'middle', x: c.x(8)})
    .parent().append('path').at({d: longTriPath})
    .parent().append('path.rect').at({d: rxPath})

  var game = teamGames[2]
  axisLabelSel.appendMany('g', [0, 2])
    .translate(d => [width/4*d, height + 30])
    .appendMany('g.label', [
        {game, teamNum: game[team], text: 'Beat ' + game[teamV]},
        {game, teamNum: game[team] == 1 ? 2 : 1, text: 'Lose To ' + game[teamV]},
      ])
    .translate((d, i) => i ? c.x(16) : 0, 0)
    .append('text')
    .text(d => d.text).at({textAnchor: 'middle', x: c.x(8)})
    .parent().append('path').at({d: shortTriPath})
    .parent().append('path.rect').at({d: rxPath})


  var game = teamGames[3]
  axisLabelSel.appendMany('g', [0, 2])
    .at('transform', d => `rotate(-90) translate(${width*-.5 -width/4*d}, ${width*1 + 30})`)
    .appendMany('g.label', [
        {game, teamNum: game[team] == 1 ? 2 : 1, text: 'Lose To ' + game[teamV]},
        {game, teamNum: game[team], text: 'Beat ' + game[teamV]},
      ])
    .translate((d, i) => i ? c.x(16) : 0, 0)
    .append('text')
    .at('transform',`rotate(180) translate(${-c.x(16)}, 10)`)
    .text(d => d.text).at({textAnchor: 'middle', x: c.x(8)})
    .parent().append('path').at({d: shortTriPath})
    .parent().append('path.rect').at({d: rxPath})
}


