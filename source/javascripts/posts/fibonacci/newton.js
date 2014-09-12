
var height = 300;

var svg = d3.select('#newton')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var points = d3.range(0, 3, .05)

function phi(x){ return x*x - 5; }

var x = d3.scale.linear()
    .domain(d3.extent(points))
    .range([0, width])

var y = d3.scale.linear()
    .domain(d3.extent(points, phi))
    .range([height, 0])

var sqrtLine = d3.svg.line()
    .x(x)
    .y(_.compose(y, Math.sqrt))

var quadLine = d3.svg.line()
    .x(x)
    //.y(_.compose(y, _.partialRight(Math.pow, 2)))
    .y(_.compose(y, phi))

var path = svg.append('path')
    .attr('d', sqrtLine(points))

var path2 = svg.append('path')
    .attr('d', quadLine(points))

svg.append('path')
    .attr('d', ['M', [0, y(0)], 'L', [width, y(0)]].join(''))