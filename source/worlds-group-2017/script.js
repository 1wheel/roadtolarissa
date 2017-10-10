var ƒ = d3.f
console.clear()
d3.loadData('annotations.json', 'matches.tsv', function(err, res){
  d3.selectAll('.group-header').st({opacity: 1})

  annotations = res[0]
  matches = res[1]
  matches.forEach(function(d, i){
    d.winner = +d.winner
    d.actualWinner = !(d.winner === 0) ? d.winner : 3
    d.complete = i < 24
    d.allTeams = d.t1 + '-' + d.t2
    d.wName = d['t' + d.winner]
  })

  byGroup = d3.nestBy(matches, ƒ('group'))
  byGroup.forEach(drawGroup)
})


function scoreMatches(matches){
  var teams = d3.nestBy(matches, ƒ('t1')).map(function(d){
    return {name: d.key, w: 0}
  })
  var nameToTeam = {}
  teams.forEach(function(d){ nameToTeam[d.name] = d })
  matches.forEach(addMatchWins)

  teams.forEach(function(d){ d.wins = d.w })

  d3.nestBy(teams, ƒ('w')).forEach(function(d){
    if (d.length == 1) return

    var tiedTeams = d.map(ƒ('name')).join('-')
    matches
      .filter(function(d){
        return ~tiedTeams.indexOf(d.t1) && ~tiedTeams.indexOf(d.t2) })
      .forEach(addMatchWins)
  })


  var advanceSlots = 2
  d3.nestBy(teams, function(d){ return d.w + d.wins*10 })
    .sort(d3.descendingKey('key'))
    .forEach(function(d){
      if (d.length <= advanceSlots){
        d.forEach(function(d){ d.advance = 't'})
      } else if (advanceSlots > 0){
        d.forEach(function(d){ d.advance = 'm'})
      } else{
        d.forEach(function(d){ d.advance = 'f' })
      }
      advanceSlots -= d.length
    })

  function addMatchWins(d){ nameToTeam[d['t' + d.winner]].w++ }


  return teams
}

function drawGroup(gMatches){
  var sel = d3.select('#group-' + gMatches.key.toLowerCase()).html('')

  var complete = gMatches.filter(ƒ('winner'))
  var incomplete = gMatches.filter(function(d){ return !d.complete })

  scenarios = d3.range(64).map(function(i){
    incomplete.forEach(function(d, j){
      d.winner = (i >> j) % 2 ? 1 : 2 
      d.wName = d['t' + d.winner]
    })

    return {
      str: incomplete.map(ƒ('winner')).join(''),
      teams: scoreMatches(gMatches), 
      incomplete: JSON.parse(JSON.stringify(incomplete))}    
  })

  var teams = d3.nestBy(gMatches, ƒ('t1')).map(function(d){
    return {name: d.key, w: 0}
  }).sort(d3.ascendingKey('name'))

  sel.appendMany('div.team', teams)
    .each(function(d){ drawResults(d3.select(this), scenarios, d.name, complete, incomplete) })

  incomplete.forEach(function(d){ d.clicked = (+d.actualWinner || 3) - 1 })
  var gameSel = sel.append('div.matches')
    .st({marginTop: 50})
    .appendMany('div.game', incomplete)
    .on('click', function(d){
      d.clicked = (d.clicked + 1) % 3

      d3.select(this).selectAll('.teamabv')
        .classed('won', function(e, i){ return i + 1 == d.clicked })
      d3.select(this).classed('active', d.clicked)

      var str = incomplete.map(ƒ('clicked')).join('')
      sel.selectAll('circle.scenario').classed('hidden', function(d){
        return d.incomplete.some(function(d, i){
          return str[i] != '0' && str[i] != d.winner
        })
      })
    })
  gameSel.append('span.teamabv').text(ƒ('t1'))
  gameSel.append('span').text(' v. ')
  gameSel.append('span.teamabv').text(ƒ('t2'))
  gameSel.each(function(d){ d3.select(this).on('click').call(this, d) })
}


function drawResults(sel, scenarios, name, complete, incomplete){
  scenarios.forEach(function(d){
    d.team = d.teams.filter(function(d){ return d.name == name })[0]
    d.wins = d.team.wins

    d.playedIn = d.incomplete.filter(function(d){
      d.currentWon = name == d.wName
      return name == d.t1 || name == d.t2 })
    d.recordStr = d.playedIn.map(function(d){ return +d.currentWon }).join('')
  })

  var against = []
  scenarios[0].playedIn.forEach(function(d){
    var otherTeam = name == d.t1 ? d.t2 : d.t1
    against.push(otherTeam)
  })

  var completeIn = complete.filter(function(d){
    d.currentWon = name == d.wName
    d.otherTeam = name == d.t1 ? d.t2 : d.t1
    return name == d.t1 || name == d.t2 })

  var pBeat = completeIn.filter(ƒ('currentWon'))
  var pLost = completeIn.filter(function(d){ return !d.currentWon })

  var pStr = 'Lost to ' 
  pStr += pLost.map(ƒ('otherTeam')).join(' and ')

  if (pBeat.length){
    pStr += ' // Beat ' + pBeat.map(ƒ('otherTeam')).join(' and ')
  } else{
    pStr = pStr.replace(' and ', ', ')
  }
  if (!pLost.length) pStr = pStr.replace('Lost to  //', '').replace(' and ', ', ')
  // pStr += ' previously'

  var byWins = d3.nestBy(scenarios, ƒ('wins'))
  byWins.forEach(function(d, i){
    d.sort(d3.descendingKey(ƒ('team', 'advance')))
    d.byRecordStr = _.sortBy(d3.nestBy(d, ƒ('recordStr')), 'key')
    if (i == 1) d.byRecordStr.reverse()
  })

  var width = 400, height = 300
  var svg = sel.append('svg').at({width, height}).st({margin: 20})
    .append('g').translate([0, 100])
  var gSel = d3.select(sel.node().parentNode)

  var swoopySel = svg.append('g.annotations')

  svg.append('text').text(name)
    .translate([10*3.5 + 100, -60]).at({textAnchor: 'middle', fontSize: 20})

  svg.append('text').text(pStr)
    .translate([10*3.5 + 100, -45]).at({textAnchor: 'middle', fontSize: 12, fill: '#888'})


  var winsSel = svg.appendMany('g', byWins.sort(d3.descendingKey('key')))
    .translate(function(d, i){ return [0, i*80 + (i == 3 ? -15*2 : i > 0 ? -8 : 0)] })

  winsSel.append('text')
    .text(function(d, i){ return i == 1 ? 'Only Lose To...' : i == 2 ? 'Only Beat...' : '' })
    .at({textAnchor: 'middle', x: 10*3.5 + 100, y: -30, fill: '#888', fontSize: 12})

  var recordSel = winsSel.appendMany('g', ƒ('byRecordStr'))
    .translate(function(d, i){ return [d.key == '000' || d.key == '111' ? 100 : i*100, 0] })

  recordSel.append('text')
    .text(function(d){
      var s
      if (d.key == '111') s = 'Win Next Three'
      if (d.key == '000') s = 'Lose Next Three'
      if (d.key == '001') s = against[2] 
      if (d.key == '010') s = against[1] 
      if (d.key == '100') s = against[0] 
      if (d.key == '011') s = against[0] 
      if (d.key == '101') s = against[1] 
      if (d.key == '110') s = against[2] 
      return s
    })
    .at({textAnchor: 'middle', x: 10*3.5, y: -10})

  recordSel.appendMany('circle.scenario', ƒ())
    .at({r: 5, fill: ƒ('team', color), cx: function(d, i){ return i*10} })
    .call(d3.attachTooltip)
    .on('mouseout', function(){ gSel.selectAll('circle.scenario').classed('active', false).at('r', 5) })
    .on('mouseover', function(d){
      gSel.selectAll('circle.scenario')
        .classed('active', 0)
        .attr('r', 5)
        .filter(function(e){ return d.str == e.str })
        .classed('active', 1)
        .attr('r', 8)
        .raise()

      var tt = d3.select('.tooltip').html('')
      var gameSel = tt.appendMany('div.game', incomplete)
      gameSel.append('span').text(ƒ('t1')).classed('won', function(e, i){ return d.str[i] == 1 })
      gameSel.append('span').text(' v. ')
      gameSel.append('span').text(ƒ('t2')).classed('won', function(e, i){ return d.str[i] == 2 })

      var byAdvanceSel = tt.appendMany('div.advance', d3.nestBy(d.teams, ƒ('advance')).sort(d3.descendingKey('key')))
        .text(function(d){
          return d.map(ƒ('name')).join(' and ') + {t: ' advance', m: ' tie', f: (d.length > 1 ? ' are' : ' is') + ' eliminated'}[d.key]
        })
    })

  var swoopy = d3.swoopyDrag()
      .draggable(1)
      .draggable(0)
      .x(function(){ return 0 })
      .y(function(){ return 0 })
      .annotations(annotations.filter(function(d){ return d.team == name }))

  swoopySel.call(swoopy)
  swoopySel.selectAll('path').attr('marker-end', 'url(#arrow)')
  swoopySel.selectAll('text')
      .each(function(d){
        d3.select(this)
            .text('')                        //clear existing text
            .tspans(d3.wordwrap(d.text, d.lw || 20)) //wrap after 20 char
      })  

}


function color(d){ return {t: '#4CAF50', m: '#FF9800', f: '#F44336'}[d.advance] }

d3.select('html').selectAppend('div.tooltip').classed('tooltip-hidden', 1)

d3.select('html').selectAppend('svg.marker')
  .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '-10 -10 20 20')
    .attr('markerWidth', 20)
    .attr('markerHeight', 20)
    .attr('orient', 'auto')
  .append('path')
    .attr('d', 'M-6.75,-6.75 L 0,0 L -6.75,6.75')
