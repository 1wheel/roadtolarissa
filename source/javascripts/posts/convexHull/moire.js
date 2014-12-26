var basesvg = d3.select('#moire').html('')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

var svg = basesvg
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var g = basesvg.append('g')


basesvg.append('rect')
    .attr({width: width, height: height})
    .style('fill-opacity', 0)
    .on('mousemove', function(){
      var pos = d3.mouse(this)
      moire(pos[1])
      g.attr('transform', 'rotate(' + -Math.atan((pos[0] - width/2)/(pos[1] - height/2))*180/Math.PI + ' ' + width/2 + ' ' + height/2 + ')')
    })

moire(40)
function moire(numPoints){
  svg.html('')
  g.html('')

  var x = d3.scale.linear()
      .domain([0, numPoints])
      .range([-width, width*2])

  var y = d3.scale.linear()
      .domain([0, numPoints])
      .range([-width, width*2])


  svg.selectAll('line')
      .data(d3.range(numPoints)).enter()
    .append('line')
      .attr('x1', x)
      .attr('x2', x)
      .attr({y1: 0, y2: height})

  svg.selectAll('zz')
      .data(d3.range(numPoints*2)).enter()
    .append('line')
      .attr('y1', y)
      .attr('y2', y)
      .attr({x1: 0, x2: width})

  g.selectAll('line')
      .data(d3.range(numPoints)).enter()
    .append('line')
      .attr('x1', x)
      .attr('x2', x)
      .attr({y1: -width, y2: width*2})

  g.selectAll('zz')
      .data(d3.range(numPoints*2)).enter()
    .append('line')
      .attr('y1', y)
      .attr('y2', y)
      .attr({x1: -width, x2: width*2})

}