function drawNlogN(){
  var numPoints = 20,
      points = _.sortBy(uniformRandom(numPoints), f('x'))

  points.forEach(function(d, i){ d.i = i })
  
  var svg = d3.select('#nlogn').html('')
    .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  

  var lineG = svg.append('g')
  
  var circles = svg.append('g').selectAll('circle')
      .data(points).enter()
    .append('circle').classed('point', true)
      .attr('r', 5)
      .attr('cx', f('x'))
      .attr('cy', f('y'))
      .each(function(d){ d.circle = d3.select(this) })
      .on('mouseover', function(d, i){
        if (i == activeI) iteratePoint()
      })

  svg.append('defs').append('clipPath').attr('id', 'xoclip').append('rect')
      .attr({height: height, width: 0, 'fill-opacity': 0})
    .transition().duration(3).ease('linear')
      .attr({width: width})
    .each('end', iteratePoint)

  lineG.append('path').classed('xorder', true)
      .attr('d', 'M' + points.map(f('p')).join('L'))
      .attr('clip-path', 'url(#xoclip)')

  var rect = lineG.append('rect')
      .attr({height: height, width: 0})

  var activePoints = lineG.append('path').classed('cur-hull', true)

  var topPoints = [points[0], points[1]]
  var curI = 2
  var lookingBack = false
  var activeI = curI

  function iteratePoint(){
    if (curI > points.length  - 1) return

    var curPoint = points[curI]

    if (!lookingBack){
      activeI = _.last(topPoints).i
      lookingBack = true

      activePoints.attr('d',  'M' + topPoints
          .concat(_.last(topPoints))
        .map(f('p')).join('L'))
      .transition().duration(1500).attr('d', 'M' + topPoints
          .concat(curPoint)
        .map(f('p')).join('L'))
      .each('end', checkForAngleDraw)

      rect.transition().duration(1500).attr('width', curPoint.x)

    } else{
      var a = topPoints[topPoints.length - 2]
      var b = topPoints[topPoints.length - 1]
      var keep = a ? !lessThan180(a, b, curPoint) : true

      b.g ? b.g.remove() : ''
      if (!keep && topPoints.length > 1){
        topPoints.pop()
        b.circle.classed('passed-point', true)        
        activeI = _.last(topPoints).i

        activePoints.attr('d',  'M' + topPoints
            .concat(b)
            .concat(curPoint)
          .map(f('p')).join('L'))
        .transition().duration(1500).attr('d', 'M' + topPoints
            .concat({p: midPoint(a, curPoint)})
            .concat(curPoint)
          .map(f('p')).join('L'))
        .each('end', checkForAngleDraw)

      } else{
        lookingBack = false
        topPoints.push(curPoint)
        curI++
        activeI = curI
        curPoint = points[curI]
      }

    }

    circles.attr('r', function(d, i){ return i < curI ? 5 : 5 })
    topPoints.concat(curPoint).forEach(function(d){
      d.circle.attr('r', 10).classed('top-point', true) 
    })
    
    circles.classed('next-point', function(d, i){
      return i === activeI
    })

    function checkForAngleDraw(){
      drawAngle(curPoint, topPoints[topPoints.length - 1], topPoints[topPoints.length - 2])
    }
  }


  circles.classed('next-point', function(d, i){
    return i === curI
  })

  // svg.append('rect')
  //     .attr({width: width, height: height})
  //     .on('mousemove', function(){
  //       var p3 = d3.mouse(this)
  //       var p3 = {x: p3[0], y: p3[1]}
  //       mPath.attr('d', ['M', p2.x, ',', p2.y, 'L', p3.x, ',', p3.y].join(''))
  //       //console.log(calcAngle(p1, p2, p3))
  //       ang = isLessThan180(p1, p2, p3)
  //       aText.text(ang)
  //     })
  // var p1 = {x: 200, y: 200}
  // var p2 = {x: 300, y: 200}
  // svg.append('path').classed('mline', true)
  //     .attr('d', ['M', p1.x, ',', p1.y, 'L', p2.x, ',', p2.y].join(''))

  // var mPath = svg.append('path').classed('mline', true)
  // var aText = svg.append('text').style('fill', 'white')
  //     .attr({dy: '3em', dx: '3em'})


  addResetButton(svg, drawNlogN)
}
drawNlogN()