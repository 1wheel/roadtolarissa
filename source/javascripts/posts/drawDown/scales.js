var margin = {top: 10, right: 20, bottom: 10, left: 20};
var height = 250;
var width = 600;
var duration = 50; 

var data = [1, 0];
for (var i = 1; i < 100; i++){
  var rand = Math.random();
  data[i+1] = data[i] + (rand < .5 ? rand - 2.3 : rand + 1.5)
}

var x = d3.scale.linear()
    .domain([0, data.length])
    .range([0, width])

var y = d3.scale.linear()
    .domain(d3.extent(data))
    .range([height, 0])

var line = d3.svg.line()
    .x(function(d, i){ return x(i); })
    .y(y);

var dataExtent = d3.extent(data);
var dif = dataExtent[0] - dataExtent[1];
var color = d3.scale.linear()
		.domain([-dif, 0, dif])
		.range(['green', 'brown', 'red'])