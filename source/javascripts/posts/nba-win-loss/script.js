d3.csv('/javascripts/posts//nba-win-loss/games.csv', function(res){
  games = res.filter(ƒ('tW'))

  byWinLoss = d3.nest().key(function(d){ return d.tW + ':' + d.tL }).entries(games)

  byWinLoss.forEach(function(d){
    d.tW = +d.values[0].tW
    d.tL = +d.values[0].tL
    d.tG = d.tW + d.tL
  })


  recordBests = [{tL: 31, tW: 128}]
  byWin = d3.nest().key(ƒ('tW')).entries(byWinLoss)
  byWin.reverse().forEach(function(d){
    d.values = _.sortBy(d.values, ƒ('tL'))
    var best = d.values[0]
    if (_.last(recordBests).tL >= best.tL){ recordBests.push(best) }
  })
  recordBests.push({tL: 0, tW: -1})

  recordWorsts = [{tL: 133, tW: 27}]
  byLoss = d3.nest().key(ƒ('tL')).entries(byWinLoss)
  byLoss.reverse().forEach(function(d){
    d.values = _.sortBy(d.values, ƒ('tW'))
    var best = d.values[0]
    if (_.last(recordWorsts).tW >= best.tW){ recordWorsts.push(best) }
  })
  recordWorsts.push({tL: 0, tL: -1})


  c = d3.conventions({width: 800, height: 800, parentSel: d3.select('#graph')})

  c.x.domain([0, 130])
  c.y.domain([0, 130])

  c.xAxis.tickSize(-c.y(0))
  // c.xAxis.tickSize(function(d){ return -c.y(0) })
  c.yAxis.tickSize(-c.x(130))
  c.drawAxis()

  c.svg.selectAll('.y line')
      .attr('x2', function(d){ return  c.x(Math.min(162 - d, 130)) })
  c.svg.selectAll('.x line')
      .attr('y2', function(d){ return -c.x(Math.min(162 - d, 130)) })

  c.svg.append('text.axis-label').text('Combined Wins')
      .attr('transform', 'rotate(-90)')
      .attr({x: -c.width, y: -25})
  c.svg.append('text.axis-label').text('Combined Losses')
      // .attr('transform', 'rotate(-90) translate(' + [0, c.height] + ')')
      .attr({y: c.height + 25})

  var color = d3.scale.threshold()
      .domain([2, 5, 10, 18, 30, 50])
      .range(['#ffd06b','#eb9f3b','#ca7421','#a14d15','#722f10','#40190a','#000000']);

  colorScale = d3.scale.quantile()
    .domain(byWinLoss.map(ƒ('values', 'length')).sort())
    .range(['#ffd06b','#eb9f3b','#ca7421','#a14d15','#722f10','#40190a','#000000']);


  var rectH = c.y(0) - c.y(1)

  var blocks = c.svg.append('g.block').dataAppend(byWinLoss, 'rect')
      .translate(function(d){ return [c.x(d.tL), c.y(d.tW) - rectH] })
      .attr('fill', ƒ('values', 'length', color))
      .attr('width', function(d){ return rectH - ((d.tL + 1) % 10 ? 0 : .5) })
      .attr('height',function(d){ return rectH - (d.tW % 10 ? 0 : .5) })
      .call(d3.attachTooltip)
      .on('mouseover', function(d){
        var sel = d3.select('.tooltip').html('')

        var gameSel = sel.dataAppend(d.values.slice(0,100), 'div.game')
        gameSel.text(function(d){
          var hStr = [d.hAbv, '(', d3.format('02f')(d.hW), '-', d3.format('02f')(d.hL), ')'].join('')
          var vStr = [d.vAbv, '(', d3.format('02f')(d.vW), '-', d3.format('02f')(d.vL), ')'].join('')
          var hWon = +d.hScore > +d.vScore
          var str1 = hWon ? hStr : vStr
          var str2 = hWon ? vStr : hStr
          return [d.date + ':', str1, 'beat', str2].join(' ')
        })
        sel.append('h3').html([d.values.length, d.values.length == 1 ? 'game was' : 'games were', 'played between teams<br>  with a combined record of', d.tW+ '-'+ d.tL+ '.'].join(' '))

      })

  var line = d3.svg.line().x(ƒ('tL', c.x)).y(ƒ('tW', c.y)).interpolate('step-after')
  c.svg.append('path.worst')
      .attr('d', line(recordWorsts))
      .translate([rectH, 0])
  c.svg.append('path.best')
      .attr('d', line(_.sortBy(recordBests, 'tW')))
      .translate([0, -rectH])


  var upcoming = [
    {tW: 78,  tL: 10}, 
    {tW: 121, tL: 15}, 
    {tW: 138, tL: 17}, 
    {tW: 141, tL: 18}, 
    ]
  c.svg.dataAppend(upcoming, 'rect.upcoming')
      .translate(function(d){ return [c.x(d.tL), c.y(d.tW) - rectH] })
      .attr({width: c.x(1), height: rectH})

  // c.svg.append('path.upcoming')
  //     .attr('d', line.interpolate('linear')([upcoming[0], upcoming[3]]))

  // d3.select('#graph').append('div')
  //   .dataAppend(_.uniq(games.map(ƒ('hAbv'))).sort(), 'span.team-name')
  //     .text(ƒ())
  //     .on('mouseover', function(abv){
  //       blocks.classed('active', function(block){
  //         return block.values.some(function(game){
  //           return game.hAbv == abv || game.vAbv == abv
  //         })
  //       })
  //     })
})

//check for square grid
//c.y(0) - c.y(1) - c.x(1)
