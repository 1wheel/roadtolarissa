var margin = {top: 10, right: 10, bottom: 10, left: 10},
		width = 750 - margin.left - margin.right
		height = 500 - margin.top - margin.bottom

var numPoints = 20,
		points = d3.range(numPoints).map(function(){
			return {x: Math.random()*width, y: Math.random()*height}
		})


var svg = d3.select('#naive')
	.append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


svg.selectAll('circle')
		.data(points).enter()
	.append('circle').classed('point', true)
		.attr('r', 5)
		.attr('cx', f('x'))
		.attr('cy', f('y'))