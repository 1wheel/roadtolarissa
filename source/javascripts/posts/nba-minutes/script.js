var annontations = {
  GSW: {
    text: "GSW has lost by more\n than 13 points twice",
    textAnchor: 'end',
    textPos: [165, 135],
    path: 'M 190,90 C 190,130 190,130 170,133'
  },
  SAS: {
    text: "Spurs have only trailed \n 3 times at the end of the 3rd",
    textAnchor: 'middle',
    textPos: [120, 136],
    path: 'M 139,96 C 139,118 139,118 139,118'
  },
  OKC: {
    text: "OKC won both overtime games",
    textAnchor: 'middle',
    textPos: [100, 150],
    path: 'M 210,80 C 210,147 210,147 190,147'
  },
  ATL: {
    text: "2nd line stuggles at the end of the 1st",
    textAnchor: 'middle',
    textPos: [100, 150],
    path: 'M 210,80 C 210,147 210,147 190,147'
  },
  CHI: {
    text: "After taking the game to 4th 0T \n a loss",
    textAnchor: 'middle',
    textPos: [100, 150],
    path: 'M 210,80 C 210,147 210,147 190,147'
  },
  DET: {
    text: "Largest lead after 3",
    textAnchor: 'middle',
    textPos: [100, 150],
    path: 'M 210,80 C 210,147 210,147 190,147'
  },
  BKN: {
    text: "If games ended after a minute, BKN would have the best record",
    textAnchor: 'middle',
    textPos: [100, 150],
    path: 'M 210,80 C 210,147 210,147 190,147'
  },
  PHI: {
    text: "Despite leading 11 times w/ 7 min left, PHI only has 3 wins",
    textAnchor: 'middle',
    textPos: [100, 150],
    path: 'M 210,80 C 210,147 210,147 190,147'
  },
  WAS: {
    text: "Largest lead after 5",
    textAnchor: 'middle',
    textPos: [100, 150],
    path: 'M 210,80 C 210,147 210,147 190,147'
  },
}


color = d3.scale.threshold()
    .domain([-12, -6, 0, 1, 7, 13])
    // .range(["#b35806","#f1a340","#fee0b6","#f7f7f7","#d8daeb","#998ec3","#542788"])
    .range(["#b35806","#f1a340","#fee0b6","rgba(255,255,255,1)","#d8daeb","#998ec3","#542788"].reverse())

d3.select('#graph').append('div').style('margin-bottom', '20px').dataAppend(d3.range(-18, 19), 'div.key')
    .text(function(d){ return d < 0 ? -d : d == 0 ? '0' : d })
    .style('background', color)
    .filter(function(d){ return !d }).style('color', 'black')

d3.json('games.json', function(res){
  games = res

  teamGames = []
  games.forEach(function(game){
    game.team = game.away
    game.oppTeam = game.home
    teamGames.push(game)

    var flippedGame = {team: game.home, oppTeam: game.away, isFlipped: true, date: game.date}
    flippedGame.minutes = game.minutes.map(function(d){
        d.dif = d.h - d.v
        d.game = game
        return {min: d.min, dif: -d.dif, game: flippedGame, h: d.v, v: d.h}
      })
    teamGames.push(flippedGame)
  })


  byTeam = d3.nest().key(ƒ('team')).entries(teamGames)

  byTeam.forEach(function(team){
    team.byMinute = d3.nest().key(ƒ('min')).entries(_.flatten(team.values.map(ƒ('minutes'))))
    team.byMinute.forEach(function(minute){
      minute.values = _.sortBy(minute.values, 'dif')//.reverse()
      minute.numNeg = minute.values.filter(function(d){ return d.dif <  0 }).length
      minute.numTie = minute.values.filter(function(d){ return d.dif == 0 }).length
      minute.values.forEach(function(d, i){
        d.y = (i - Math.floor(minute.numTie/2) - minute.numNeg)
        d.i = i
      })
    })
    team.wins = team.values.filter(function(d){ return _.last(d.minutes).dif > 0 }).length + (['CHI', 'MEM', 'IND'].indexOf(team.key)/1000) //force CHI to edge
  })

  teamSel = d3.select('#graph').dataAppend(_.sortBy(byTeam, 'wins').reverse(), 'div.game')
  teamSel.append('div').text(ƒ('key'))//.style({'z-index': 3, position: 'relative'})

  teamSel.each(function(d, i){
    // if (i > 4) return
    var c = d3.conventions({
      parentSel: d3.select(this),
      height: 150, width: 190, 
      margin: {left: 10, top: 10, bottom: 10, right: 10}})

    c.x.domain([48, 0])
    c.y.domain([-20, 20])
    c.yAxis.tickValues([-15, 0, 15])
    c.yAxis.tickValues([])
    c.xAxis.tickValues([48, 36, 24, 12, 0])

    c.svg
      .on('mousemove', function(){
        console.log(d3.mouse(this))
      })
        .append('rect').attr({height: c.height, width: c.width, opacity: 0})

    c.drawAxis()

    var botLine = c.svg.append('path.hover-path')

    c.svg.selectAll('.x line').attr('y1', -c.height)
    c.svg.select('.x .tick').append('text').text('min').attr({y: 9, dy: '.71em', x: 10})
    // c.svg.append('path.zero').attr('d', ['M', [0, c.y(0)], 'h', c.width].join(''))


    var minuteSel = c.svg.dataAppend(d.byMinute, 'g.min')
        .translate(function(d){ return [c.x(d.key), c.y(-Math.floor(d.numTie/2) - d.numNeg) - c.y(0)] })
        // .style('opacity', function(d, i){ return d.key != 48 ? 1 : 0 })

    var line = d3.svg.line()
        .x(ƒ('min', c.x))
        .y(function(d){ return c.y(d.y) })
        .interpolate('step')

    var lineSel = c.svg.append('path.hover-path')
    var textG = c.svg.append('g.hover-text')
    var dateText  = textG.append('text').attr('y', '-1.1em')
    var oppText  = textG.append('text').attr('y', '-2.2em')
    var scoreText = textG.append('text')

    var botTextG = c.svg.append('g.hover-text')
    var botScore = botTextG.append('text').attr({'text-anchor': 'middle', 'y': '2.81em'})
    var botTime = botTextG.append('text').attr({'text-anchor': 'middle', 'y': '1.45em'})
    var circleSel = minuteSel.dataAppend(ƒ('values'), 'circle')
        .attr('cy', ƒ('i', c.y))
        .attr('r', 2)
        .attr('fill', ƒ('dif', color))
        .on('mouseover', function(d){
          // console.log(d)
          lineSel.attr('d', line(d.game.minutes))

          circleSel.classed('selected', function(e){ return e.game == d.game })
          
          var finalScore = _.last(d.game.minutes)
          textG.translate([c.width + 3, c.y(finalScore.y) + (d.game.minutes.length > 50 ? -10 : 0)])
          oppText.text((d.game.isFlipped ? ' ' : '@') + d.game.oppTeam)
          dateText.text(d.game.date)
          scoreText.text(finalScore.h + '-' + finalScore.v)


          botTextG.translate([c.x(d.min), c.height])
          botTime.text(d.min)
          botScore.text(d.h + '-' + d.v)
          botLine.attr('d', ['M', c.x(d.min), 0, 'v', c.height].join(' '))

        })
        // .call(d3.attachTooltip)


    var anno = annontations[d.key]
    if (!anno) return

    var annoG = c.svg.append('g.anno') 
    annoG.append('text')
        .attr('text-anchor', anno.textAnchor)
        .translate(anno.textPos)
        .tspans(anno.text.split('\n'))


    annoG.append('path')
        .attr('d', anno.path)

  })

  d3.select(self.frameElement).style("height", 2000 + "px");
})

function clamp(a, b, c){ return Math.max(a, Math.min(b, c)) }
