function drawHN(){
  var numPoints = 20,
      points = _.sortBy(uniformRandom(numPoints), f('x'))

  var svg = d3.select('#hn').html('')
    .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var circles = svg.append('g').selectAll('circle')
      .data(points).enter()
    .append('circle').classed('point', true)
      .attr('r', 5)
      .attr('cx', f('x'))
      .attr('cy', f('y'))
      .each(function(d){ d.circle = d3.select(this) })

  var mLine = svg.append('line').classed('mline', true)


  var curPoint,prevPoint, maxAngle;
  function updateCurPoint(cur, prev){
    curPoint = cur
    prevPoint = prev
    maxAngle = 0

    mLine.attr({x1: curPoint.x, y1: curPoint.y})

    svg.append('path')
        .attr('d', ['M', prevPoint.x, prevPoint.y, 'L', curPoint.p].join(' '))
        .style('stroke', 'red')

    points.forEach(function(d){
      d.angle = calcAngle(prevPoint, curPoint, d)
      d.active = d != curPoint
      d.circle.classed('next-point', d.active)
    })    
  }
  updateCurPoint(points[0], {x: points[0].x, y: height})

  svg.append('rect')
      .style('fill-opacity', 0)
      .attr({width: width, height: height})
      .on('mousemove', function(){
        var pos = d3.mouse(this)
        mLine.attr({x2: pos[0], y2: pos[1]})

        var angle = calcAngle(prevPoint, curPoint, {x: pos[0], y: pos[1]})
        var oldMaxAngle = maxAngle

        points.filter(ƒ('active')).forEach(function(d){
          if (Math.abs(angle - d.angle) < 1){
            d.active = false
            d.circle.classed('next-point', false)
            if (angle > maxAngle){
              maxAngle = d.angle
              svg.append('line').datum(d).attr('class', 'possible-max growing')
                  .attr({x1: curPoint.x, y1: curPoint.y, x2: curPoint.x, y2: curPoint.y})
                .transition('drawInit').duration(1500)
                  .attr({x2: d.x, y2: d.y})
            }
          }
        })

        if (oldMaxAngle !=  maxAngle){
          svg.selectAll('.growing').filter(function(d){ return d.angle != maxAngle })
              .classed('growing', false)
            .transition('shrinking').duration(1500)
              .attr('x1', ƒ('x'))
              .attr('y1', ƒ('y'))
              .remove()
        }

        if (!points.filter(f('active')).length){
          updateCurPoint(svg.select('.growing').datum(), curPoint)
        }
      })




}
drawHN()