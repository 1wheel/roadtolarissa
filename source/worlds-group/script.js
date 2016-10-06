var ƒ = d3.f

d3.loadData(['matches.csv'], function(err, res){
  matches = res[0]
  matches.forEach(function(d){
    d.winner = +d.winner
    d.completed = !(d.winner === 0)
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

// alert('asdf')
function drawGroup(gMatches){
  var sel = d3.select('#group-' + gMatches.key.toLowerCase()).html('')

  var completed = gMatches.filter(ƒ('winner'))
  var incomplete = gMatches.filter(function(d){ return !d.completed })

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
  })

  sel.appendMany(teams, 'div.team')
    .each(function(d){ drawResults(d3.select(this), scenarios, d.name) })

  incomplete.forEach(function(d){ d.clicked = 0 })
  // sel.append('h3').text('Select winners: ').st({opacity: .5, marginLeft: 20})
  var gameSel = sel.append('div.matches')
    .st({marginTop: 50})
    .appendMany(incomplete, 'div.game')
    .on('click', function(d){
      d.clicked = (d.clicked + 1) % 3
      d3.select(this).selectAll('.teamabv').classed('won', function(e, i){ return i + 1 == d.clicked })
      d3.select(this).classed('active', d.clicked)

      var str = incomplete.map(ƒ('clicked')).join('')
      sel.selectAll('circle').classed('hidden', function(d){
        return d.incomplete.some(function(d, i){
          return str[i] != '0' && str[i] != d.winner
        })
      })
    })
  gameSel.append('span.teamabv').text(ƒ('t1'))
  gameSel.append('span').text(' v. ')
  gameSel.append('span.teamabv').text(ƒ('t2'))
}


function drawResults(sel, scenarios, name){
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

  svg.append('text').text(name).translate([10*3.5 + 100, -40]).at({textAnchor: 'middle', fontSize: 20})


  var winsSel = svg.appendMany(byWins.sort(d3.descendingKey('key')), 'g')
    .translate(function(d, i){ return [0, i*80 + (i == 3 ? -15*2 : i > 0 ? -8 : 0)] })

  winsSel.append('text')
    .text(function(d, i){ return i == 1 ? 'Only Lose To...' : i == 2 ? 'Only Beat...' : '' })
    .at({textAnchor: 'middle', x: 10*3.5 + 100, y: -30, opacity: .6})

  var recordSel = winsSel.appendMany(ƒ('byRecordStr'), 'g')
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

  recordSel.appendMany(ƒ(), 'circle')
    .at({r: 5, fill: ƒ('team', color), cx: function(d, i){ return i*10} })
    .call(d3.attachTooltip)
    .on('mouseout', function(){ gSel.selectAll('circle').classed('active', false).at('r', 5) })
    .on('mouseover', function(d){
      gSel.selectAll('circle')
        .classed('active', 0)
        .attr('r', 5)
        .filter(function(e){ return d.str == e.str })
        .classed('active', 1)
        .attr('r', 8)
        .raise()

      var tt = d3.select('.tooltip').html('')
      var gameSel = tt.appendMany(incomplete, 'div.game')
      gameSel.append('span').text(ƒ('t1')).classed('won', function(e, i){ return d.str[i] == 1 })
      gameSel.append('span').text(' v. ')
      gameSel.append('span').text(ƒ('t2')).classed('won', function(e, i){ return d.str[i] == 2 })

      var byAdvanceSel = tt.appendMany(d3.nestBy(d.teams, ƒ('advance')).sort(d3.descendingKey('key')), 'div.advance')
        .text(function(d){
          return d.map(ƒ('name')).join(' and ') + {t: ' advance', m: ' tie', f: (d.length > 1 ? ' are' : ' is') + ' eliminated'}[d.key]
        })
    })

}


function color(d){ return {t: '#4CAF50', m: '#FF9800', f: '#F44336'}[d.advance] }

d3.select('html').selectAppend('div.tooltip').classed('tooltip-hidden', 1)