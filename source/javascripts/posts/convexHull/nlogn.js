function drawNlogN(){
  var numPoints = 20,
      points = uniformRandom(numPoints)

  var svg = d3.select('#nlogn').html('')
    .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var lineG = svg.append('g')

  circles = svg.selectAll('circle')
      .data(points).enter()
    .append('circle').classed('point', true)
      .attr('r', 3)
      .attr('cx', f('x'))
      .attr('cy', f('y'))
      .each(function(d){ d.circle = d3.select(this) })

  points = _.sortBy(points, f('x'))

  lineG.append('path').classed('xorder', true)
      .attr('d', 'M' + points.map(f('p')).join('L'))


  var topPoints = [points[0], points[1]]
  var curI = 1

  function iteratePoint(){
    curI++
    if (curI > points.length  - 1) return
    topPoints.push(points[curI])
    var b = points[curI - 1]

    var keep = !lessThan180(points[curI - 2], b, points[curI])

    b.circle
    b.circle.transition()
        .style('fill', keep ? 'green' : 'steelblue')
        .style('fill-opacity', .7)
        .attr('r', 10)

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

function norm(v){
  return Math.sqrt(v[0]*v[0] + v[1]*v[1])
}

function calcAngle(a, b, c){
  var v1 = [b.x - a.x, b.y - a.y]
  var v2 = [c.x - b.x, c.y - b.y]
  
  var dot = v1[0]*v2[0] + v1[1]*v2[1]

  var ab = dist(a, b)
  var bc = dist(b, c)
  var ca = dist(c, a)
  console.log(v1[0]*v2[1] - v2[0]*v1[1])

  // return Math.acos((bc*bc + ab*ab - ca*ca)/(2*bc*ab))*180/Math.PI
  return Math.acos(dot/(norm(v1)*norm(v2)))*180/Math.PI
}

function dist(a, b){
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

function lessThan180(a, b, c){
  var v1 = [b.x - a.x, b.y - a.y]
  var v2 = [c.x - b.x, c.y - b.y]
  
  return v1[0]*v2[1] - v2[0]*v1[1] < 0
}