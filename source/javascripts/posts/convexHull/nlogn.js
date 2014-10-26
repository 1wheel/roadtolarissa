function drawNlogN(){
  var numPoints = 20,
      points = uniformRandom(numPoints)

  var svg = d3.select('#nlogn').html('')
    .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  circles = svg.selectAll('circle')
      .data(points).enter()
    .append('circle').classed('point', true)
      .attr('r', 3)
      .attr('cx', f('x'))
      .attr('cy', f('y'))
      .each(function(d){ d.circle = d3.select(this) })


  svg.append('text').classed('reset-button', true)
      .attr({dy: '1em', dx: '.2em'})
      .on('click', drawNlogN)
      .text('↻')
}
drawNlogN()