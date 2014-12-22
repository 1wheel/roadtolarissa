function drawHN(){
  var numPoints = 50,
      points = _.sortBy(uniformRandom(numPoints), f('x'))

  var svg = d3.select('#hn').html('')
    .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var lineG = svg.append('g')

  var circles = svg.append('g').selectAll('circle')
      .data(points).enter()
    .append('circle').classed('point', true)
      .attr('r', 8)
      .attr('cx', f('x'))
      .attr('cy', f('y'))
      .each(function(d){ d.circle = d3.select(this) })

  var color = d3.scale.linear()
      .domain([0, points.length/2, points.length - 1])
      .range([d3.lab('#FF00C0'), d3.lab('#8B84D8'), d3.lab('#00FF01')])

  var curPoint, prevPoint, updating
  function updateCurPoint(cur, prev){
    if (cur.outline) return
    curPoint = cur
    prevPoint = prev

    curPoint.outline = true

    points.forEach(function(d){
      d.angle = calcAngle(prevPoint, curPoint, d)
      d.active = d != curPoint
    })    

    updating = true

    d3.selectAll('.possible-max')
      .transition().duration(1000).delay(function(d){ return 200 + points.length*20 - d.index*20 })
        .attr('x1', ƒ('x')) 
        .attr('y1', ƒ('y'))
        .remove()

    lineG.append('line').classed('outline', true)
        .datum({prev: prevPoint, cur: curPoint})
        .attr({x1: prevPoint.x, x2: prevPoint.x, y1: prevPoint.y, y2: prevPoint.y})
      .transition().duration(700).delay(points.length*20+1000)
        .attr({x2: curPoint.x, y2: curPoint.y})

    circles.transition().duration(1000).delay(points.length*20+1500)
        .attr('r', 8)
        .style('fill', function(d){ return d == curPoint ? 'black' : 'white' })

    points = _.sortBy(points, f('angle')).reverse()
    points.forEach(function(d, i){ d.index = i })

    window.setTimeout(function(){ updating = false }, points.length*20+1500)
  }
  updateCurPoint(points[0], {x: points[0].x, y: points[0].y + 1})
  updating = false

  svg.append('rect')
      .style('fill-opacity', 0)
      .attr({width: width, height: height})
      .on('mousemove', function(){
        if (updating) return

        var angle = calcAngle(prevPoint, curPoint, {x: d3.mouse(this)[0], y: d3.mouse(this)[1]})
        points.filter(ƒ('active')).forEach(function(d){
          if (Math.abs(angle - d.angle) < 1){
            d.active = false
            lineG.append('line').datum(d).attr('class', 'possible-max')
                .style('stroke', _.compose(color, f('index')))
                .attr({x1: curPoint.x, y1: curPoint.y, x2: curPoint.x, y2: curPoint.y})
              .transition().duration(1000)
                .attr({x2: d.x, y2: d.y})

            d.circle.transition().delay(700).duration(500)
                .attr('r', 3)

          }
        })

        if (!points.filter(f('active')).length){
          updateCurPoint(_.findWhere(points, {index: 0}), curPoint)
        }
      })


  svg.append('text').classed('reset-button', true)
      .attr({dy: '1em', dx: '.2em'})
      .on('click', drawHN)
      .text('↻')
}
drawHN()