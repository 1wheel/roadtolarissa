
var height = 500;

var svg = d3.select('#newton')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var points = d3.range(0, 10, .05)

var x = d3.scale.linear()
		.domain(d3.extent(points))
		.range([0, width])

var y = d3.scale.linear()
		.domain(d3.extent(points, Math.sqrt))
		.range([height, 0])

var line = d3.svg.line()
		.x(x)
		.y(_.compose(y, Math.sqrt))

var path = svg.append('path')
		.attr('d', line(points))