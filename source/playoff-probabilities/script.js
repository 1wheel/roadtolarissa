console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

// https://teamcolorcodes.com/nba-team-color-codes/
var abv2color = {
  "GS": "#FDB927",
  "LAC": "#1D428A",
  "HOU": "#CE1141",
  "UTA": "#F9A01B",
  "POR": "#000000",
  "OKC": "#007AC1",
  "DEN": "#0E2240",
  "SA" : "#C4CED4",
  "MIL": "#EEE1C6",
  "DET": "#C8102E",
  "BOS": "#007A33",
  "IND": "#FDBB30",
  "PHI": "#002D62",
  "BKN": "#000000",
  "TOR": "#753BBD",
  "ORL": "#0077C0",
  "DAL": "#B8C4CA",
  "MIA": "#98002E",
  "LAL": "#FDB927",
}

var abv2Index = {
  "MIL": 0,
  "ORL": 1,
  "IND": 2,
  "MIA": 3,
  "BOS": 4,
  "PHI": 5,
  "TOR": 6,
  "BKN": 7,
  "LAL": 8,
  "POR": 9,
  "HOU": 10,
  "OKC": 11,
  "DEN": 12,
  "UTA": 13,
  "LAC": 14,
  "DAL": 15
}

function saturate(color, k) {
  var {l, c, h} = d3.lch(color)
  return d3.lch(l, c + 18 * k, h)
}

function lighten(color){
  return d3.interpolate(color, '#fff')(.25)
}

var abv2lcolor = {}
d3.entries(abv2color).forEach(d => abv2lcolor[d.key] = lighten(d.value))

var isMobile = innerWidth < 450
var white = '#fff' //'#f5f5f5'

d3.loadData(
  'https://roadtolarissa.com/data/538-2020-nba-forecasts.json', 
  'https://roadtolarissa.com/data/538-2020-nba-games.json', (err, res) => {
  forecasts = _.sortBy(res[0], d => d.last_updated)

  forecasts.forEach(d => {
    d.date = d.last_updated.split('T')[0].split('-').slice(1).join('/')

    d.playoff_losses = d3.sum(d.types.carmelo, d => d.playoff_losses)
  })

  forecasts = forecasts
    .filter(d => d.playoff_losses > 0)
    .filter(d => d.last_updated > '2020-08-15')

  forecasts = d3.nestBy(forecasts, d => d.last_updated).map(_.last)

  snapshots = []
  forecasts.forEach((forecast, index) => {
    forecast.index  = index

    var teams = forecast.types.carmelo
      .map(d => {
        var conf = d.conference[0]
        var seed = 0
        d3.range(9).forEach(i => seed = d['seed_' + i] ? i : seed)

        var abv = d.name

        var gamesPlayed = 'q s c f'.split(' ')
          .map(str => +d[str + '_wins'] + d[str + '_losses'])

        var gamesWon = 'q s c f'.split(' ')
          .map(str => Math.max(+d[str + '_wins'], d[str + '_losses']))

        var team = {conf, seed, abv, gamesPlayed, gamesWon}

        team.levels = [
          d.make_conf_semis,
          d.make_conf_finals,
          d.make_finals,
          d.win_finals,
        ].map((prob, level) => 
          ({prob, level, team, forecast, gamesPlayed: gamesPlayed[level], gamesWon: gamesWon[level]}))

        return team
      })
      .filter(d => d.seed)

      var order = [1, 8, 4, 5, 3, 6, 2, 7]
      teams = _.sortBy(teams, d => order.indexOf(d.seed) + (d.conf == 'W' ? 8 : 0))

      teams.forEach((d, i) => d.index = i)
      window.teamAbv2Index = {}
      teams.forEach(d => teamAbv2Index[d.abv] = d.index)

      d3.range(4).forEach(levelIndex => {
        var prev = 0
        var mult = Math.pow(2, levelIndex + 1)/16

        teams.forEach(team => {
          var l = team.levels[levelIndex]

          l.val = l.prob*mult
          l.prev = prev
          prev += l.val

          snapshots.push({
            abv: team.abv,
            val: l.val,
            prev: l.prev,
            mult,
            levelIndex,
            l,
          })
        })
      })

      forecast.teams = teams
  })

  uniqSnaps = d3.nestBy(snapshots, d => [d.abv, d.l.level])
  uniqSnaps.forEach(teamLevel => {
    teamLevel.games = d3.range(7).map(gameIndex => {
      var prevLevel = teamLevel[0]

      return teamLevel.map(curLevel => {
        var isPlayed = curLevel.l.gamesPlayed <= gameIndex
        prevLevel = isPlayed ? curLevel : prevLevel

        var isFluid = isPlayed && curLevel.l.gamesWon < 4

        return {tl: prevLevel, gameIndex, isPlayed, isFluid}
      })
    })
  })
  flatSnapGames = _.flatten(uniqSnaps.map(d => d.games))

  flatSnapGames.forEach(d => {
    d.abv = d[0].tl.abv
    d.gameIndex = d[0].gameIndex
    d.levelIndex = d[0].tl.levelIndex
  })
  flatSnapGames.abvGameLevelLookup = Object.fromEntries(flatSnapGames.map(d => [[d.abv, d.gameIndex, d.levelIndex], d]))

  games = res[1].filter(d => d.playoff).filter(d => d.status == 'post').filter(d => d.playoff != 'p')
  games.forEach(d => {
    d.teams = _.sortBy([d.team1, d.team2], d => abv2Index[d])
  })
  d3.nestBy(games, d => d.teams).forEach(series => {
    series.forEach((game, gameIndex) => {
      game.levelIndex = 'q s c f'.split(' ').indexOf(game.playoff)

      game.gameIndex = gameIndex
      var isTeam1 = game.teams[0] == game.team1
      var isTeam1Winner = game.score1 > game.score2

      game.isTopWin = isTeam1 == isTeam1Winner
      game.char = !game.isTopWin ? '↑' : '↓'
      // game.char = isTeam1 == isTeam1Winner ? '▲' : '▾'
      // game.char = isTeam1 == isTeam1Winner ? '▲' : '▼'

      var key = [game.teams[0], gameIndex, game.levelIndex]
      var m = flatSnapGames.abvGameLevelLookup[key]
      if (!m) return console.log(key)
      m.game = game
    })

    series.teams = series[0].teams
    var key = [series[0].teams[0], 6, series[0].levelIndex]
    var m = flatSnapGames.abvGameLevelLookup[key]
    if (!m) return console.log(key)
    m.series = series
  })

  var renders = [initRects(), initTimeline()]
  initFinalsWP()

  window.curForecast = null

  window.startPlayback = () => {
    var stepDuration = 300
    window.renderForecast = function(forecast, dur=stepDuration){
      window.curForecast = forecast
      renders.forEach(d => d(forecast, dur))
    }

    function step(){
      var forecast = forecasts[window.curForecast ? curForecast.index + 1 : 0]
      if (!forecast){
        stepInterval.end()
        forecast = curForecast
      } 
      renderForecast(forecast, stepDuration)
    }

    if (window.stepInterval) window.stepInterval.end()
    window.stepInterval = d3.interval(step, stepDuration)
    stepInterval.isPlaying = true
    stepInterval.end = () => {
      stepInterval.stop()
      stepInterval.isPlaying = false
    }
    step()
  }
  startPlayback()
})

function initRects(){
  var sel = d3.select('#graph').html('')
  var c = d3.conventions({sel, margin: {left: 100, right: 0, bottom: 40, top: 50}, height: 16*32, layers: 'sd'})

  c.y.domain([0, 1]).range([0, c.height])
  c.x.domain([0, 4])

  updateFlatSnapGames(forecasts[0])

  var rectSel = c.svg.appendMany('rect', flatSnapGames)
    .at({
      x: d => c.x(d.tl.l.level + d.gameIndex/7),
      width: c.x(1)/7 + 1,
      y: d => c.y(d.tl.prev),
      height: d => c.y(d.tl.val),
      fill: d => abv2color[d.tl.l.team.abv],
      opacity: 1, 
    })
    .call(d3.attachTooltip)


  updateFlatSnapGames(_.last(forecasts))

  var vSel = c.svg.appendMany('text.v', flatSnapGames.filter(d => d.game))
    .at({
      x: d => c.x(d.tl.l.level + (d.gameIndex + .5)/7),
      y: d => c.y(d.tl.prev + d.tl.mult/2) + (d.game.isTopWin ? -8 : 8),
      dy: '.33em',
      textAnchor: 'middle',
    })
    .text(d => d.game.char)

  var seriesSel = addLabels()

  updateFlatSnapGames(forecasts[0])


  function addLabels(){
    c.svg.appendMany('g', forecasts[0].teams)
      .translate(d => [-c.margin.left, c.y(d.index/16) + 1])
      .append('rect')
      .at({width: c.margin.left, fill: d => abv2color[d.abv]})
      .at({y: d => d.index == 0 ? -1 : 0, height: d => c.y(1/16) + (d.index == 0 ? 0 : d.index ==15 ? -.5 : -1)})
      .parent().append('text.team-abv')
      .text(d => d.abv)
      .translate([c.margin.left/2, c.y(.5/16)])
      .st({pointEvents: 'none'})
      .at({textAnchor: 'middle', dy: '.33em'})

    c.svg.appendMany('line', d3.range(4))
      .translate(d => Math.round(c.x(d)) - .5, 0)
      .at({
        y2: c.height,
        stroke: white,
        strokeWidth: 3,
      })

    var seriesSel = c.svg.appendMany('path.series', flatSnapGames.filter(d => d.series))
      .translate(d => c.x(d.tl.l.level + 1) -1.5, 0)
      .at({
        stroke: d => abv2color[d.tl.val > 0 ? d.series.teams[0] : d.series.teams[1]],
        strokeWidth: 1,
        // strokeDasharray: '2 1',
        d: d => ['M 0', c.y(d.tl.prev), 'V' + c.y(d.tl.prev + d.tl.mult)].join(' ')
      })

    c.svg.appendMany('line', d3.range(1, 8))
      .translate(d => Math.round(c.y(d/8)) + .5, 1)
      .at({
        x1: d => {
          var v = 0
          while (d % Math.pow(2, v) == 0) v++
          return c.x(v)
        }, 
        stroke: white, 
        strokeWidth: 1
      })

    c.svg.appendMany('text', isMobile ? ['RND 1', 'RND 2', 'RND 3', 'FINALS'] : ['ROUND 1', 'CONF SEMIS', 'CONF FINALS', 'FINALS'])
      .translate((d,i) => [c.x(i + .5), -28])
      .text(d => d)
      .at({
        textAnchor: 'middle',
        dy: -2,
        fontSize: isMobile ? 14 : '',
      })

    c.layers[1].append('div')
      .translate([-c.margin.left -2, -25])
      .html('<a style="text-decoration: none" href="https://projects.fivethirtyeight.com/2020-nba-predictions">538 Advance Pct</a> Before Game #')
      .st({fontSize: 10, width: c.margin.left, textAlign: 'right'})

    c.svg.appendMany('text', d3.range(28))
      .translate(d => [c.x(d/7 + 1/14), isMobile ? -6 : -5])
      .text(d => d % 7 + 1)
      .st({fontSize: isMobile ? 9 : 10, textAnchor: 'middle'})

    return seriesSel
  }

  return (forecast, dur) => {
    updateFlatSnapGames(forecast)

    rectSel
      .at({
        fill: d => (d.isFluid ? abv2lcolor : abv2color)[d.tl.l.team.abv],
        // fill: d => (abv2color)[d.tl.l.team.abv],
        // opacity: d => d.isFluid ? .7 : 1,
      })
      .transition().duration(dur)
      .at({
        y: d => c.y(d.tl.prev),
        height: d => c.y(d.tl.val),
      })

    vSel
      // .st({opacity: d => d.tl.isPlayed})
      .st({opacity: d => d.isPlayed ? 0 : 1})

    seriesSel
      .st({opacity: d => d.isFluid ? 0 : 1})
  }

  function updateFlatSnapGames(forecast){
    flatSnapGames.forEach(d => {
      d.isFluid = d[forecast.index].isFluid
      d.isPlayed = d[forecast.index].isPlayed
      d.tl = d[forecast.index].tl
      d.gameIndex = d[0].gameIndex
    })
  }

}


function initTimeline(){
  var c = d3.conventions({
    sel: d3.select('#timeline').html('').append('div'),
    height: 50,
    margin: {left: 50, top: 0},
    layers: 'sd',
  })

  c.x.domain([0, forecasts.length - 1]).clamp(1)

  timelineSel = c.svg.append('g')
    .st({cursor: 'pointer'})
    .on('click', function(){
      window.stepInterval.end()
      renderForecast(forecasts[Math.round(c.x.invert(d3.mouse(this)[0]))])
    })
    .on('mousemove', function(d){
      window.stepInterval.end()
      renderForecast(forecasts[Math.round(c.x.invert(d3.mouse(this)[0]))], 0)
    })


  timelineSel.append('rect')
    .at({width: c.width + 20, x: -10, height: 60, y: -20, opacity: 0})


  var space = c.x(1)
  var dateSel = timelineSel.appendMany('text.date', forecasts)
    .translate((d, i) => c.x(i), 0)
    .text(d => d.date)
    .at({fontSize: 12, y: 30, textAnchor: 'middle', 
      opacity: (d, i) => i % (space < 20 ? 6 : space < 30 ? 3 : space < 45 ? 2 : 1) == 0 ? 1 : 0})

  var rh = 5
  var r = rh + (space < 30 ? -1 : 2)

  timelineSel.append('path')
    .at({d: `M ${c.x(0)} 0 H ${c.x(forecasts.length - 1)}`, stroke: '#000', strokeWidth: rh})
  timelineSel.appendMany('circle', forecasts)
    .translate((d, i) => c.x(i), 0)
    .at({r, fill: '#fff', stroke: '#000'})
  timelineSel.append('path')
    .at({d: `M 0 0 H ${c.width}`, stroke: '#fff', strokeWidth: rh - 2})

  var maskSel = timelineSel.append('mask#timeline-mask')
  maskSel.appendMany('circle', forecasts)
    .translate((d, i) => c.x(i), 0)
    .at({r, fill: '#fff', stroke: '#000'})
  maskSel.append('path')
    .at({d: `M 0 0 H ${c.width}`, stroke: '#fff', strokeWidth: rh - 2})

  var fillSel = timelineSel.append('rect')
    .at({y: -r, height: r*2, x: -r, fill: '#000', mask: 'url(#timeline-mask)'})

  var buttonSel = c.layers[1]
    .st({width: 20})
    .append('div')
    .translate([-c.margin.left + 10, -10])
    .append('div')
    .st({fontSize: 40, verticalAlign: 'middle', display: 'inline-block', cursor: 'pointer'})
    .text('▶')
    .on('click', () => {
      if (stepInterval.isPlaying){
        window.stepInterval.end()
        renderForecast(curForecast)
      } else {
        if (curForecast == _.last(forecasts)) curForecast = null
        startPlayback()
      }
    })

  return (forecast, dur) => {
    fillSel
      .transition().duration(dur)
      .at({width: c.x(forecast.index) + r*2})

    setTimeout(() => {
      dateSel
        .classed('active', 0)
        .filter(d => d == forecast)
        .classed('active', 1)
        .raise()
      }, dur/2)

    if (window.stepInterval?.isPlaying){
      buttonSel
        .text('=')
        .st({transform: 'rotate(90deg) translate(3px, 5px)'})
    } else {
      buttonSel
        .text('▶')
        .st({transform: 'translate(-2px, 0px)'})
    }
  }
}

function initFinalsWP(){
  var c = d3.conventions({
    sel: d3.select('#finals-wp').html('').append('div'),
    height: 160,
    margin: {left: 50, top: 30, bottom: 45},
    layers: 's',
  })

  c.x.domain([0, forecasts.length - 1]).interpolate(d3.interpolateRound)
  c.y.domain([0, 1]).range([0, c.height])

  var space = c.x(1)

  var dateSel = c.svg.appendMany('text.date', forecasts)
    .translate((d, i) => [c.x(i), c.height])
    .text(d => d.date)
    .at({fontSize: 12, y: 15, textAnchor: 'middle', 
      opacity: (d, i) => i % (space < 20 ? 6 : space < 30 ? 3 : space < 45 ? 2 : 1) == 0 ? 1 : 0})

  forecasts.forEach((forecast) => {
    forecast.teams.forEach(d => d.forecastIndex = forecast.index)
  })

  var forecastSel = c.svg.appendMany('g', forecasts)
    .translate(d => c.x(d.index), 0)
    .on('mouseover', function(d){
      window.stepInterval.end()
      renderForecast(forecasts[d.index], 0)
    })

  forecastSel
    .appendMany('rect', d => d.teams.filter(d => d.levels[3].val))
    .at({
      width: space + 1,
      x: -space/2,
      y: d => c.y(d.levels[3].prev),
      height: d => c.y(d.levels[3].val),
      fill: d => abv2color[d.abv],
    })

  forecastSel.append('path')
    .translate(-space/2, 0)
    .at({stroke: '#fff', d: 'M 0 0 V ' + c.height, strokeWidth: .2})

  c.svg.appendMany('text', [25, 50, 75])
    .text(d => d + '%')
    .at({
      y: d => c.y(1 - d/100),
      x: -space/2 - (isMobile || innerWidth > 1280 ? 12 : 1),
      dy: '.33em',
      fontSize: 10,
      textAnchor: 'end',
      fill: '#999',
    })
    .st({fontSize: 10})

  c.svg.append('text')
    .text('538 Chance of Winning Finals')
    .translate([-space/2, -4])
    .st({fontSize: 10, width: c.margin.left, textAlign: 'right'})
}































