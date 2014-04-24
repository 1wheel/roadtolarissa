//helper functions
var f = function(str){ return function(obj){ return str ? obj[str] : obj; }}
var compose = function(g, h){ return function(d, i){ return g(h(d, i)); }}

var numBars = 10;
var data = d3.range(-numBars*2, numBars*2, 2);

var width = 200,
    height = 200;


var x = d3.scale.ordinal()
    .domain(d3.range(numBars*2))
    .rangeRoundBands([0, width], .1)

var y = d3.scale.linear()
    .domain(d3.extent(data))
    .range([height, 0])

var svg = d3.select('body').append('svg')
    .attr({width: width, height: height})

svg.selectAll('rect')
    .data(data).enter()
  .append('rect')
    .attr('x', function(d, i){ return x(i); })
    .attr('width', x.rangeBand())
    .attr('height', function(d){ return Math.abs(Math.abs(d) -y(0)) ; })
