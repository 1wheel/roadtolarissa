var sqrt2 = Math.sqrt(2)

var width = 400,
    height = 400

var svg = d3.select('#dragon-curve')
  .append('svg')
    .attr({width: width, height: height})

function addLine(start, end, length, direction){
  svg.append('path')
      .attr('d', ['M', start, 'L', end].join(''))

  svg.append('rect')
      .attr({x: start[0], y: start[1], height: length/sqrt2, width: length/sqrt2})
      .attr('transform', 'rotate(-45,' + start + ')')
}

var length = width
addLine([0, height/2], [length, height/2], length)