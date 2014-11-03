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

  var circles = svg.selectAll('circle')
      .data(points).enter()
    .append('circle').classed('point', true)
      .attr('r', 3)
      .attr('cx', f('x'))
      .attr('cy', f('y'))
      .each(function(d){ d.circle = d3.select(this) })


  lineG.append('path').classed('xorder', true)
      .attr('d', 'M' + points.map(f('p')).join('L'))

  var activePoints = lineG.append('path').style('opacity', .3)

  var topPoints = [points[0], points[1]]
  var curI = 2

  function iteratePoint(){
    if (curI > points.length  - 1) return

    var curPoint = points[curI]

    topPoints.push(null)
    var lastIsTop = false
    while (!lastIsTop){
      topPoints.pop()

      var a = topPoints[topPoints.length - 2]
      var b = topPoints[topPoints.length - 1]
      var keep = a ? !lessThan180(a, b, curPoint) : true

      lastIsTop = keep
  
      b.circle.transition()
          .style('fill', keep ? 'green' : 'steelblue')
          .style('fill-opacity', .7)
          .attr('r', 10)
    }
    console.log(topPoints.map(f('i')))
    topPoints.push(curPoint)
    activePoints.attr('d', 'M' + topPoints.map(f('p')).join('L'))

    curI++
    circles.classed('next-point', function(d, i){
      return i === curI
    })
  }

  setInterval(iteratePoint, 500)

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


  svg.append('text').classed('reset-button', true)
      .attr({dy: '1em', dx: '.2em'})
      .on('click', drawNlogN)
      .text('↻')
}
drawNlogN()