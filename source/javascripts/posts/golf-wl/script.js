// creates array of matches 
// _.flatten(d3.values(data).map(function(d){ return d3.values(d) }))

var height = 500,
    width = 663,
    margin = {left: 40, right: 47, top: 15, bottom: 20},
    x = d3.scale.linear().domain([0, 18]),
    y = d3.scale.linear().domain([-9, 9]),
    xTickSize,
    yTickSize,
    fullscreen = typeof(fullscreen) != "undefined"

function calcPageSize(){
  if (fullscreen){
    width = Math.max(500, window.innerWidth - margin.left - margin.right - 30)
    height = Math.max(663, window.innerHeight - margin.top - margin.bottom - 20)
    height = Math.min(height, width*7/5)
  }  
  
  x.range([0, width])
  y.range([height, 0])
  
  xTickSize = x(1)
  yTickSize = y(8)
}
calcPageSize();

var radiusScale = d3.scale.sqrt()
    .range([0, 10])

var lineWidthScale = d3.scale.linear()
    .range([0, 1, 9])

var color = d3.scale.ordinal()
    .domain(['up', 'same', 'down'])
    .range(['#01863e', '#1c4695', '#ec3221'])


var rounds = [],                          //each spread/hole pair (needs better name...)
    roundHash = {},                       //hash of the above - faster when updating the data
    holeConstraints = {},                 //each round that displayed matches must pass through
    directions = ['down', 'same', 'up'],  //result of a hole - could also be loss, tie, win
    matches,   
    results = []                         

//append and position static svg, axis, hoverlines and text. 
//mostly uninteresting, probably should have been done directly as a svg,
//instead of js generated svg, especially since the graph isn't responsive
var svg, winnerText, tieText, loserText
function addStaticSVG(){
  svg = d3.select('#golf-wl')
    .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var xAxis = d3.svg.axis()
      .scale(x)
      .ticks(18)
      .tickFormat(function(d){ return d < 18 ? d + 1 : 'end' })

  var xAxisG = svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('class', 'x axis')
      .call(xAxis)
  xAxisG.append('text')
      .attr('transform', 'translate(' + width/9 + ',0)')
      .text('Hole')
      .style('text-anchor', 'middle')

  var yAxis = d3.svg.axis()
      .scale(y)
      .ticks(18).orient("left")    

  var yAxisG = svg.append('g')
      .attr('transform', 'translate(-12,0)')
      .attr('class', 'y axis')
      .call(yAxis)
  yAxisG.selectAll('text').style('text-anchor', 'middle')
  yAxisG.append('text')
      .attr('transform', 'translate(' + 4 + ',' + (height*6/7) + ') rotate(90)')
      .text("First Scorer's Score")
      .style('text-anchor', 'end')

  var textG = svg.append('g')
      .attr('transform', 'translate(-10,-2)')

  textG.append('text')
      .classed('selectedText', true)

  textG.append('g')
      .attr('transform', 'translate(0, 20)')
    .selectAll('text')
      .data([0, 1, 2]).enter()
    .append('text')
      .classed('hoveredText', true)
      .classed('hoveredTextEnd', function(d){ return d === 2 })
      .attr('dy', function(d){ return d + 'em' })

  textG.append('g')
      .attr('transform', 'translate(0, 55)')
    .selectAll('text')
      .data(['up', 'same', 'down']).enter()
    .append('text')
      .classed('hoverTextResults', true)
      .attr('fill', _.compose(color, f()))
      .attr('dy', function(d, i){ return i + 'em' })

  svg.append('path')
      .attr('id', 'winningline')
      .attr('d', ['M', x(11.5), y(9), 'L', x(18.5), y(2)].join(' '))
      .classed('endline', true)
      .style('stroke', color('up'))

  winnerText = svg.append('text').append('textPath')
      .attr('xlink:href', '#winningline')
      .attr('startOffset', '35%')
    .append('tspan')
      .attr('dy', -5)
      .text('Winner line')
      .style('fill', color('up'))

  svg.append('path')
      .attr('id', 'losingline')
      .attr('d', ['M', x(12.5), y(-8), 'L', x(18.5), y(-2)].join(' '))
      .classed('endline', true)
      .style('stroke', color('down'))

  loserText = svg.append('text').append('textPath')
      .attr('xlink:href', '#losingline')
      .attr('startOffset', '22%')
    .append('tspan')
      .attr('dy', 15)
      .text('Loser line')
      .style('fill', color('down'))

  var tieG = svg.append('g')
      .attr('transform', ['translate(', x(18.6), ',', y(0), ')'].join(''))

  tieG.append('text')
      .text('Ties')
      .style('text-anchor', 'middle')
      .style('fill', color('same'))
      .attr('dy', '.7em')

  tieText = tieG.append('text')
      .style('text-anchor', 'middle')
      .attr('dy', '-.3em')
      .style('fill', color('same'))

  svg.append('g').selectAll('line')
      .data([0, 1]).enter()
    .append('line')
      .classed('hoverline', true)
}
addStaticSVG()

//load state from url
window.location.hash.substr(1).split(',').forEach(function(d){
    if (!d) return
    holeConstraints[d.split(':')[0]] = d.split(':')[1].split('_')
      .map(function(d){ return +d }) 
})

//construct array of rounds
d3.range(0, 19).forEach(function(hole){
  d3.range(-9, 10).forEach(function(spread){
    if (10 - Math.abs(10 - hole) >= Math.abs(spread)){
      //through out invalid rounds
      //if (hole + spread < 2 && spread != 0) return
      var round = {hole: hole, spread: spread, color: ''}
      //find game enders
      if (Math.abs(spread) > 18 - hole || hole === 18){
        round.type = spread < 0 ? 'down' : spread == 0 ? 'same' : 'up'
        round.color = color(round.type)
      }
      //both array and hash point at same object so we can mutate either
      rounds.push(round)
      roundHash[hole + ':' + spread] = round
    }
  })
})
  
//load data
d3.json('/javascripts/posts/golf-wl/flat-data.json', function(err, data){
  matches = data
  //winner of the first match always on top - todo: do this server side once
  matches.forEach(function(match){
    var flip = false
    match.scores.some(function(d){
      if (d !== null) flip = d < 0;
      //if (d < 0){ flip = true}
      return d === null
    })
    if (flip){ 
      match.scores = match.scores.map(function(d){ return d === null ? null : -1*d })
    }
  })

  //add count of matches to each round obj
  function updateData(){
    rounds.forEach(function(d){
      directions.concat('count').forEach(function(str){ d[str] = 0 }) })
    results = {'up': 0, 'same': 0, 'down': 0}

    var holeConstraintsArray = d3.entries(holeConstraints)

    matches.forEach(function(match){
      //don't count matches that don't meet constraints
      var meetsConstraints = holeConstraintsArray.every(function(d){
        return _.contains(d.value, match.scores[d.key])
      })  
      if (!meetsConstraints) return

      match.scores.some(function(spread, hole){
        var round = roundHash[hole + ':' + spread]
        round.count++
        var nextSpread = match.scores[hole+1]
        if (nextSpread == null || round.type){
          results[spread < 0 ? 'down' : spread == 0 ? 'same' : 'up']++
          return true
        } else{
          round[nextSpread < spread ? 'down' : nextSpread == spread ? 'same' : 'up']++
          return false
        }
      })
    })
  }
  updateData()

  //calculate line thickness and circle radius
  function updateScales(){
    radiusScale.domain(d3.extent(rounds, f('count')))
    var maxLineVals = directions.map(function(str){ return d3.max(rounds, ƒ(str)) })
    lineWidthScale.domain([0, .999, d3.max(maxLineVals)])
  }
  updateScales()

  //append circles and lines to the page, attach events
  function firstDraw(){
    var roundGs = svg.selectAll('.roundG')
        .data(rounds).enter()
      .append('g')
        .classed('roundG', true)
        .attr('transform', function(d){
          return ['translate(', x(d.hole), ',', y(d.spread), ')'].join('') })

    roundGs.selectAll('line')
        .data(function(d){
          return directions.map(function(str, i){
            return {type: str, direction: i - 1}
          }) })
        .enter()
      .append('line')
        .attr({x2: xTickSize})
        .attr('y2', function(d){ return d.direction*(-yTickSize)})
        .style('stroke', _.compose(color, f('type')))

    roundGs.append('circle')
        .style('stroke', f('color'))
        .style('fill', f('color'))

    roundGs.append('rect')
        .attr({x: -xTickSize/2, y: -yTickSize/2, width: xTickSize, height: yTickSize})
        .on('mouseover', function(d){
          //highlight rect
          roundGs.selectAll('rect').classed('hovered', false)
          d3.select(this).classed('hovered', true)

          //update axis
          d3.selectAll('.hoverline')
              .attr({x2: x(d.hole), y2: y(d.spread)})
              .attr('x1', function(i){ return i ? x(d.hole) : 0 })
              .attr('y1', function(i){ return i ? height : y(d.spread) })

          d3.selectAll('g.x').selectAll('text')
              .classed('hovered', function(i){ return i === d.hole })
          d3.selectAll('g.y').selectAll('text')
              .classed('hovered', function(i){ return i === d.spread })

          //update text
          var aheadText = d.spread >= 0 ? 'led by ' + d.spread  : 'trailed by ' + -d.spread 
          var hoveredText = [ 
                              'Going into hole', d.hole + 1 + ',',
                              'the first scorer', aheadText, 
                              'point' + (Math.abs(d.spread) != 1 ? 's' : ''), '---',
                              'in ', comma(d.count), 'of the selected matches', 
                            ].join(' ')
                            .replace('Going into hole 19', 'After hole 18')
                            
          d3.selectAll('.hoveredText')
              .data(hoveredText.split('---'))
              .text(f())

          var directionSum = d3.sum(directions, function(direction){ return d[direction] })
          var directionToStr = {down: ' they lost ',
                                same: ' they halved ',
                                up  :  'they won '}
          d3.selectAll('.hoverTextResults')
              .style('opacity', directionSum ? 1 : 0)
              .text(function(direction, i){
                var num = d[direction]
                return d3.format(".1%")(num/d.count) + ' of the time ' 
                    + directionToStr[direction] + 'hole ' + (d.hole + 1) })

          var winningStr = {up:'winning', same:'tying', down:'losing'}[d.type]
          d3.selectAll('.hoveredTextEnd')
              .style('opacity', d.type ? 1 : 0)
              .text('resulting in them ' + winningStr + ' the round' )
                    
        })
        .on('click', function(d){
          //highlight rect
          var selected = !d3.select(this).classed('selected')
          d3.select(this).classed('selected', selected)

          //update holeConstraints
          if (selected){
            if (holeConstraints[d.hole]){
              holeConstraints[d.hole].push(d.spread)
            } else{
              holeConstraints[d.hole] = [d.spread]
            }
          } else{
            holeConstraints[d.hole] = holeConstraints[d.hole]
              .filter(function(spread){ return spread != d.spread })

            if (!holeConstraints[d.hole].length){
              delete holeConstraints[d.hole]
            }
          }

          //update url
          var hash = ''
          d3.entries(holeConstraints).forEach(function(d){
            hash += [d.key, ':', d.value.join('_'), ','].join('')
          })
          window.location.hash = hash.substr(0, hash.length - 1)

          updateData()
          updateScales()
          updateDOM(d.hole, d.spread, 50, 300)
        })
        .classed('selected', function(d){
          return holeConstraints[d.hole] && _.contains(holeConstraints[d.hole], d.spread)
        })
  }
  firstDraw()

  //transition circles and lines to new layout
  function updateDOM(hole, spread, delayTime, duration){
    svg.selectAll('.roundG').selectAll('line')
        //updating child data is a pain
        .data(function(d){ 
          return directions.map(function(str, i){
            return {count: d[str], hole: d.hole, spread: d.spread}
          }) 
        })
      .transition().delay(delayFn).duration(duration)
        .style('stroke-width', _.compose(lineWidthScale, f('count')))

    svg.selectAll('.roundG').select('circle')
      .transition().delay(delayFn).duration(duration)
        .attr('r', _.compose(radiusScale, f('count')))
        //Fixes entering/exiting circle stroke flicker
        .styleTween('', function(){
          var selection = d3.select(this)
          return function(){
            selection.style('stroke-width', 2*Math.min(1, +selection.attr('r'))) } 
        })
        .each('end', function(){
          d3.select(this).style('stroke-width', 2*Math.min(1, +d3.select(this).attr('r')))
        })

    //fun transition timing
    function delayFn(d){
      return (Math.abs(hole - d.hole) + Math.abs(spread - d.spread))*delayTime 
    }

    //update text
    var total = Math.max(1, results.up + results.same + results.down)
    winnerText.text(d3.format(".1%")(results.up/total)   + ' First Scorer Wins')
    loserText .text(d3.format(".1%")(results.down/total) + ' First Scorer Losses')
    tieText   .text(d3.format(".1%")(results.same/total))

    var selectedStr = comma(results.up + results.same + results.down);
    d3.select('.selectedText')
        .text(selectedStr + ' matches selected (click to toggle)')
  }
  //on load, don't transition
  updateDOM(0, 0, 0, 0)

  window.onresize = _.debounce(function(){
    if (!fullscreen) return
    d3.select('#golf-wl').selectAll('*').remove()
    
    calcPageSize()
    addStaticSVG()
    updateScales()
    firstDraw()
    updateDOM(0, 0, 0, 0)
  }, 300)
})


//add about link
if (fullscreen){
  d3.select('body').append('div')
      .style({position: 'absolute', right: '12px', top: '12px', 'font-size': '10pt', cursor: 'pointer'})
      .text('About')
      .on('click', function(){ window.location = '/golf-paths/' })
}
