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
      .attr({x1: points[0].x, y1: points[0].y})


  svg.append('path')
      .attr('d', ['M', points[0].x, '0L', points[0].x, height].join(' '))
      .style('stroke', 'red')

  var curPoint = points[0]
  var maxAngle = 0
  points.forEach(function(d){
    d.angle = calcAngle({x: curPoint.x, y: height}, curPoint, d)
    svg.append('text')
        .attr({x: d.x, y: d.y, dy: '.33em'})
        .text(Math.round(d.angle))
    d.active = d != curPoint
    d.circle.classed('next-point', d.active)
  })

  svg.append('rect')
      .style('fill-opacity', 0)
      .attr({width: width, height: height})
      .on('mousemove', function(){
        var pos = d3.mouse(this)
        mLine.attr({x2: pos[0], y2: pos[1]})

        var angle = calcAngle({x: curPoint.x, y:height}, curPoint, {x: pos[0], y: pos[1]})
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

        //todo move to next point
      })




}
drawHN()