var nSvg = d3.select('#drawDownNaive')
	.append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

nSvg.append('path')
    .attr('d', line(data))

var circles = nSvg.append('g').selectAll('circle')
    .data(data).enter()
  .append('circle')
    .attr('cx', function(d, i){ return x(i); })
    .attr('cy', y)
    .attr('r', 5)

var bestLine = nSvg.append('line').classed('best', true);
var bestHeightLine = nSvg.append('line').classed('best', true);
var connectionLine = nSvg.append('line').classed('connection', true)
var heightLine = nSvg.append('line').classed('connection', true)

var j = 0,
    k = 1,
    best = Infinity;
animateStep();

function animateStep(){
  if (!playing){ return; }

  var colorStr = color(data[k] - data[j]);
  connectionLine
      .attr({ x1: x(j),
              y1: y(data[j]),
              x2: x(j),
              y2: y(data[j]) })
    //.transition().duration(duration - 50)
      .attr({ x2: x(k),
              y2: y(data[k]) })
      .style('stroke', colorStr)

  heightLine
      .attr({ x1: x(j),
              y1: y(data[j]),
              x2: x(j),
              y2: y(data[k]) })
      .style('stroke', colorStr)

  if (best > data[k] - data[j]){
    best = data[k] - data[j]
    nSvg.selectAll('.best')
        .attr({ x1: x(j),
                y1: y(data[j]),
                x2: x(k),
                y2: y(data[k]) })
        .style('stroke', colorStr)
    bestHeightLine.attr('x2', x(j))
  }

  if (j === k - 1){
    circles.attr('r', function(d, i){ return i === j ? 10 : 5; })
  }
  circles.filter(function(d, i){ return i === k; })
      .attr('r', 7)
    .transition().duration(duration + 200)
      .attr('r', 5)

  if (k < data.length - 1){ k++; }
  else if (j < data.length - 2){ j++; k = j + 1; }
  else { return; }

  //speed up when second animation ends
  if (j !== 0){ duration = duration*.995; }
  setTimeout(animateStep, duration);
}