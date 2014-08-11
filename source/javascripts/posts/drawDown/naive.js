var margin = {top: 10, right: 20, bottom: 10, left: 20};
var height = 250;
var width = 600;

var nSvg = d3.select('#drawDownNaive')
	.append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var data = [1, 0];
for (var i = 1; i < 100; i++){
  var rand = Math.random();
  data[i+1] = data[i] + (rand < .5 ? rand - 1.5 : rand + 1.5)
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

nSvg.append('path')
    .attr('d', line(data))

var circles = nSvg.append('g').selectAll('circle')
    .data(data).enter()
  .append('circle')
    .attr('cx', function(d, i){ return x(i); })
    .attr('cy', y)
    .attr('r', 5)

var connectionLine = nSvg.append('line')
    .style('stroke', 'green')
    .style('stroke-width', 2)
var bestLine = nSvg.append('line');

for (var j = 0; j < data.length; j++){
  for (var k = j + 1; k < data.length; k++){
    // circles
    //     .attr('r', function(d, i){ return i == j ? 10 : 5 })


  }
}
var duration = 10;
var j = 0;
var k = 1;
animateStep();

function animateStep(){
  connectionLine
      .attr({
        x1: x(j),
        y1: y(data[j]),
        x2: x(j),
        y2: y(data[j]) })
    //.transition().duration(duration - 50)
      .attr({
        x2: x(k),
        y2: y(data[k]) })

  if (j === k - 1){
    circles.attr('r', function(d, i){ return i === j ? 10 : 5; })
  }
  circles.filter(function(d, i){ return i === k; })
      .attr('r', 6)
    .transition().duration(duration + 200)
      .attr('r', 5)

  if (k < data.length - 1){ k++; }
  else if (j < data.length - 2){ j++; k = j + 1; }
  else { return; }
  setTimeout(animateStep, duration);
}