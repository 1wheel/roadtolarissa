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

    ang = calcAngle(points[curI - 2], b, points[curI])*180/Math.PI

    b.circle.attr('r', 10)
    b.circle.style('fill', ang < 45 ? 'green' : 'red')
    console.log(ang)
  }

  setInterval(iteratePoint, 500)

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
  var v2 = [b.x - c.x, b.y - c.y]
  
  var l = v1[0]*v2[0] + v1[1]*v2[1]

  return Math.acos(l/(norm(v1)*norm(v2)))
}