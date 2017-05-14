var ƒ = d3.f
console.clear()

var matches = d3.csvParse(`t1,t2,winner,date,time,vod
SKT,GAM,1,2017-05-11,CET=00:30,shownname=MSI 2017 Main Event|vod1=http://youtu.be/7RYu0DwGk7s?t=2m28s
WE,SKT,2,2017-05-12,CET=01:00,shownname=MSI 2017 Main Event|vod1=http://www.youtube.com/watch?v=tUO9GwgO6KY&t=3m33s
G2,SKT,2,2017-05-10,CET=20:30,shownname=MSI 2017 Main Event|vod1=http://youtu.be/UeVa1lzHa4k?t=6m19s
TSM,WE,1,2017-05-11,CET=01:30,shownname=MSI 2017 Main Event|vod1=http://youtu.be/obGhu3n5QYI?t=6m25s
FW,G2,2,2017-05-10,CET=23:30,shownname=MSI 2017 Main Event|vod1=http://youtu.be/t2ujaiBVhZw?t=4m26s
GAM,TSM,1,2017-05-10,CET=22:30,shownname=MSI 2017 Main Event|vod1=http://youtu.be/1zNAI4DeArc?t=9m19s
WE,FW,1,2017-05-10,CET=21:30,shownname=MSI 2017 Main Event|vod1=http://youtu.be/Qq-aYAo74ss?t=5m24s
SKT,TSM,1,2017-05-11,CET=20:00,shownname=MSI 2017 Main Event|vod1=http://www.youtube.com/watch?v=PBk7pmrYqa0&t=13m10s
GAM,FW,2,2017-05-11,CET=21:00,shownname=MSI 2017 Main Event|vod1=http://www.youtube.com/watch?v=P_Ud3z5c8AU&t=4m50s
G2,WE,2,2017-05-11,CET=22:00,shownname=MSI 2017 Main Event|vod1=http://www.youtube.com/watch?v=7b_KD-OnLAk&t=6m14s
FW,TSM,1,2017-05-11,CET=23:00,shownname=MSI 2017 Main Event|vod1=http://www.youtube.com/watch?v=ITpSsNtAJGQ&t=4m07s
GAM,G2,2,2017-05-12,CET=00:00,shownname=MSI 2017 Main Event|vod1=http://www.youtube.com/watch?v=2CMecuPxmwE&t=3m46s
G2,TSM,2,2017-05-12,CET=20:00,shownname=MSI 2017 Main Event|vod1=http://www.youtube.com/watch?v=4exJouJ6GSg&t=15m28s
SKT,FW,1,2017-05-12,CET=21:00,shownname=MSI 2017 Main Event|vod1=http://www.youtube.com/watch?v=IEZt9-4POZQ&t=2m28s
GAM,WE,1,2017-05-12,CET=22:00,shownname=MSI 2017 Main Event|vod1=http://www.youtube.com/watch?v=o-6KHLCdL8k&t=3m24s
G2,FW,1,2017-05-12,CET=23:00,shownname=MSI 2017 Main Event|vod1=http://www.youtube.com/watch?v=mPfnPGkbWTE&t=1m56s
GAM,SKT,2,2017-05-13,CET=00:00,shownname=MSI 2017 Main Event|vod1=http://www.youtube.com/watch?v=x7ZNK9LmoCA&t=32s
WE,TSM,1,2017-05-13,CET=01:00,shownname=MSI 2017 Main Event|vod1=http://www.youtube.com/watch?v=Fyr3j_uE15I&t=2m57s
WE,G2,1,2017-05-13,CET=20:00,shownname=MSI 2017 Main Event|vod1=
TSM,GAM,1,2017-05-13,CET=21:00,shownname=MSI 2017 Main Event|vod1=
FW,SKT,1,2017-05-13,CET=22:00,shownname=MSI 2017 Main Event|vod1=
G2,GAM,2,2017-05-13,CET=23:00,shownname=MSI 2017 Main Event|vod1=
TSM,SKT,2,2017-05-14,CET=00:00,shownname=MSI 2017 Main Event|vod1=
FW,WE,2,2017-05-14,CET=01:00,shownname=MSI 2017 Main Event|vod1=
SKT,G2,,2017-05-14,CET=20:00,shownname=MSI 2017 Main Event|vod1=
TSM,FW,,2017-05-14,CET=21:00,shownname=MSI 2017 Main Event|vod1=
WE,GAM,,2017-05-14,CET=22:00,shownname=MSI 2017 Main Event|vod1=
TSM,G2,,2017-05-14,CET=23:00,shownname=MSI 2017 Main Event|vod1=
FW,GAM,,2017-05-15,CET=00:00,shownname=MSI 2017 Main Event|vod1=
SKT,WE,,2017-05-15,CET=01:00,shownname=MSI 2017 Main Event|vod1=`)


var isMobile = innerWidth <= 925

matches.forEach(function(d){
  d.winner = +d.winner
  d.completed = !(d.winner === 0)
  d.allTeams = d.t1 + '-' + d.t2
  d.wName = d['t' + d.winner]
})

// completed = A.filter(ƒ('winner'))
var incomplete = matches.filter(function(d){ return !d.completed })

var scenarios = d3.range(64).map(function(i){
  incomplete.forEach(function(d, j){
    d.winner = (i >> j) % 2 ? 1 : 2 
    d.wName = d['t' + d.winner]
  })

  return {
    str: incomplete.map(ƒ('winner')).join(''),
    teams: scoreMatches(matches), 
    incomplete: JSON.parse(JSON.stringify(incomplete)),
    i
  }    
})


scenarios.forEach((s, i) => {
  s.i = i
  s.teams.forEach((t, j) => {
    t.s = s
    t.score = {t: 3, m: 2, f: 1}[t.advance]*10 + (t.rank || 0)
    t.rng = i/100
    t.teamIndex = j
  })
})

var teamResults = d3.nestBy(_.flatten(scenarios.map(ƒ('teams'))), ƒ('name'))

var teams = d3.nestBy(matches, ƒ('t1')).map(function(d){
  return {name: d.key, w: 0}
})


var height = isMobile ? Math.round((document.documentElement.clientHeight - 30)/50 - 3) : Math.round((innerHeight - 55)/33 - 3)
var width = isMobile ? Math.round((document.documentElement.clientWidth - 10)/23) : 23.5
var sel = d3.select('#graph').html('').append('div.scenario-container')

var svg = sel.append('svg')
  .at({height: (height + 3)*32, width: isMobile ? document.documentElement.clientWidth : width*23})

// if (isMobile) svg.st({marginLeft: innerWidth - width*23})
if (isMobile) svg = svg.append('g').translate([(innerWidth - width*23)/2, 0])
var teamNameSel = svg.appendMany(scenarios[0].teams, 'text.name')
  .text(ƒ('name'))
  .at({x: (d, i) => i*width*4 + width*(isMobile ? .5 : 0), dy: -16, dx: height, textAnchor: 'middle'}) 
var scoreSel = svg.appendMany(scenarios[0].teams, 'text')
  .at({x: (d, i) => i*width*4 + width*(isMobile ? .5 : 0), dy: -3, dx: height, textAnchor: 'middle'}) 


var teamSel = svg.appendMany(teamResults, 'g').appendMany(ƒ(), 'g.team-dot')
  .translate((d, i) => [Math.random()*500, d.s.i*height*5])
teamSel.append('rect')
  .at({width: width, height, fill: ƒ(color), x: (d, i) => d.teamIndex*width*4 })

// idk why this works
setTimeout(() => teamSel.call(d3.attachTooltip).on('mouseover', ttText))

incomplete.forEach(function(d){ d.clicked = 0 })
// sel.append('h3').text('Select winners: ').st({opacity: .5, marginLeft: 20})

var wonKey1 = svg.append('g.key')
  .translate([2*width*4.3, (height + 3)*32])
  .at({opacity: 0})
wonKey1.append('text')
  .text('G2 Wins')
  .at({textAnchor: 'end', dy: '2em', x: -7})
wonKey1.append('text')
  .text('⇡')
  .at({textAnchor: 'end', dy: '.66em', x: 3, fontSize: 25})

var wonKey2 = svg.append('g.key')
  .translate([2*width*4.5, (height + 3)*32])
  .at({opacity: 0})
wonKey2.append('text')
  .text('G2 Loses')
  .at({textAnchor: 'start', dy: '2em', x: 14})
wonKey2.append('text')
  .text('⇡')
  .at({textAnchor: 'start', dy: '.66em', x: 3, fontSize: 25})


function compareOutcome(i){
  wonKey1.select('text').text(incomplete[i].t1 + ' wins')
  wonKey2.select('text').text(incomplete[i].t2 + ' wins')

  scenarios.forEach(d => d.isLeft = d.incomplete[i].winner == 1)

  d3.nestBy(scenarios, d => d.isLeft)
    .forEach(d => d.forEach((e, i) => e.i = i))

  d3.nestBy(scenarios, d => d.i).forEach(pair => {
    d3.range(6).forEach(i => {
      var g0 = pair[0].teams[i]
      var g1 = pair[1].teams[i]

      g0.changed = g1.changed = g0.score != g1.score ? g0.advance != g1.advance ? 1000 : 500 : 400
      g0.sort = g1.sort = -g0.changed + -(g0.score*4 + g1.score) + g1.rng
      g0.pair = g1
      g1.pair = g0
    })
  })

  teamResults.forEach(team => {
    _.sortBy(team, 'sort').forEach((d, i) => d.i = Math.floor(i/2))
  })

  teamSel.transition().delay(d => d.i*25).duration(200)
    .translate((d, i) => [d.s.isLeft ? 0 : width, d.i*(height + 3)])
    .st({strokeOpacity: d => d.changed/1000 })
    .st({stroke: d => d.changed == 1000 ? '#000' : d.changed == 500 ? '#333' : '#ccc' })
}


var firstDraw = true
initSort()
function initSort(){
  teamResults.forEach(team => {
    _.sortBy(team, d => -d.score + d.rng).forEach((d, i) => {
      d.i = Math.floor(i/2)
      d.isLeft = !(i % 2)
    })
    
  })

  teamSel.transition().delay(d => firstDraw ? d.i*100 + d.teamIndex*500 + Math.random()*3000 : d.i*50)
    .translate((d, i) => [d.isLeft ? -1 : width + 1, d.i*(height + 3)])
    .st({strokeOpacity: .5, stroke: '#000'})

  firstDraw = false
}




var gs = d3.graphScroll()
  .container(d3.select('#container'))
  .graph(d3.selectAll('#graph'))
  .sections(d3.selectAll('#sections > div'))
  // .offset(innerWidth < 900 ? innerHeight - 30 : 200)
  .eventId('uniqueId1')
  .on('active', function(i){
    i ? compareOutcome(i - 1) : initSort()

    d3.selectAll('.key').st({opacity: +i})
  })

d3.select('.footer')
  .st({'margin-bottom': 100 + 'px', padding: '100px'})




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


  var advanceSlots = 4
  d3.nestBy(teams, function(d){ return d.w + d.wins*10 })
    .sort(d3.descendingKey('key'))
    .forEach(function(d){
      if (d.length <= advanceSlots){
        d.forEach(function(e){ e.advance = 't'; e.rank = advanceSlots - d.length })
      } else if (advanceSlots > 0){
        d.forEach(function(e){ e.advance = 'm'})
      } else{
        d.forEach(function(e){ e.advance = 'f' })
      }
      advanceSlots -= d.length
    })

  function addMatchWins(d){ nameToTeam[d['t' + d.winner]].w++ }


  return teams
}



function color(d){
  var greens = ["#74c476","#41ab5d","#238b45","#005a32"]
  if (d.advance == 't') return greens[d.rank]
  return {t: '#4CAF50', m: '#FF9800', f: '#F44336'}[d.advance] 
}


function ttText(d){
  var tt = d3.select('.tooltip').html('')
  var gameSel = tt.appendMany(incomplete, 'div.game')
  gameSel.append('span').text(ƒ('t1')).classed('won-match', function(e, i){ return d.s.str[i] == 1 })
  gameSel.append('span').text(' v. ')
  gameSel.append('span').text(ƒ('t2')).classed('won-match', function(e, i){ return d.s.str[i] == 2 })

  var byAdvanceSel = tt.appendMany(d3.nestBy(d.s.teams, ƒ('advance')).sort(d3.descendingKey('key')), 'div.advance')
    .text(function(d){
      // if (d.key == 't') return;
      return d.map(ƒ('name')).join(' and ') + {t: ' advance', m: ' tie', f: (d.length > 1 ? ' are' : ' is') + ' eliminated'}[d.key]
    })
    .classed('won', d => d.key == 't')
    .classed('maybe', d => d.key == 'm')
    .classed('eliminate', d => d.key == 'f')

  scoreSel
    .text((e, i) => d.s.teams[i].wins + (i ? '' : ' wins'))
    .classed('won', (e, i) => d.s.teams[i].advance == 't')

  teamNameSel
    .classed('won', (e, i) => d.s.teams[i].advance == 't')
    .classed('maybe', (e, i) => d.s.teams[i].advance == 'm')
    .classed('eliminate', (e, i) => d.s.teams[i].advance == 'f')

  // circleSel.at({
  //   transform: d3.select(this).attr('transform'),
  //   cx: +d3.select(this).attr('x') + height/2
  // })

  d3.selectAll('circle').remove()
  teamSel.filter(e => e.s.str == d.s.str)
    .raise()
      .append('circle')
    .at({r: height/2+3, cx: (d, i) => d.teamIndex*width*4 + width/2, cy: height/2, strokeWidth: 1, stroke: '#000', fill: 'none'})
    .st({pointerEvents: 'none', strokeWidth: 1.5, stroke: '#000', strokeOpacity: 1})

}


// d3.select('#container').selectAppend('div.tooltip')
d3.select('body').selectAppend('div.tooltip')
  .classed('tooltip-hidden', true)