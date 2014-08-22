var nSvg = d3.select('#drawDownNaive')
	.append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var bestLine = nSvg.append('line').classed('best', true);
var bestHeightLine = nSvg.append('line').classed('best', true);
var connectionLine = nSvg.append('line').classed('connection', true)
var heightLine = nSvg.append('line').classed('connection', true)

nSvg.append('path')
    .attr('d', line(data))

var circles = nSvg.append('g').selectAll('circle')
    .data(data).enter()
  .append('circle')
    .attr('cx', function(d, i){ return x(i); })
    .attr('cy', y)
    .attr('r', 3)

var jGroup = nSvg.append('g')
var jLine = jGroup.append('line').classed('text-line', true).attr({y1: height + margin.bottom - 20})
var jText = jGroup.append('text').style('text-anchor', 'end').attr('y', height + margin.bottom - 5)

var kGroup = nSvg.append('g')
var kLine = kGroup.append('line').classed('text-line', true).attr({y1: height + margin.bottom - 20})
var kText = kGroup.append('text').style('text-anchor', 'start').attr('y', height + margin.bottom - 5)

var bestTextG = nSvg.append('g')
bestTextG.append('text')
    .attr("transform", "rotate(-90)")
    .text('Max Drawdown')
    .style('text-anchor', 'middle')
    .style({'stroke': 'rgba(255, 255, 255, .8)', 'stroke-width': '3'})
bestTextG.append('text')
    .attr("transform", "rotate(-90)")
    .text('Max Drawdown')
    .style('text-anchor', 'middle')

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
              x2: x(k),
              y2: y(data[k]) })
      .style('stroke', colorStr)

  heightLine
      .attr({ x1: x(k),
              y1: y(data[j]),
              x2: x(k),
              y2: y(data[k]) })
      .style('stroke', colorStr)

  jGroup.attr('transform', 'translate(' + x(j) + ',0)')
  jLine.attr('y2', y(data[j]))
  jText.text('i: ' + j);
  
  kGroup.attr('transform', 'translate(' + x(k) + ',0)')
  kLine.attr('y2', y(Math.min(data[k], data[j])))
  kText.text('j: ' + k);


  if (best > data[k] - data[j]){
    best = data[k] - data[j]
    nSvg.selectAll('.best')
        .attr({ x1: x(j),
                y1: y(data[j]),
                x2: x(k),
                y2: y(data[k]) })
        .style('stroke', colorStr)
    bestHeightLine.attr('x1', x(k))

    bestTextG.attr('transform', ['translate(', x(k) - 3, ',', Math.min(height - 25, y((data[k] + data[j])/2)), ')'].join(''));
  }

  if (j === k - 1){
    circles.attr('r', function(d, i){ return i === j ? 10 : 3; })
  }
  circles.filter(function(d, i){ return i === k; })
      .attr('r', 7)
    .transition().duration(duration + 200)
      .attr('r', 3)

  if (k < data.length - 1){ k++; }
  else if (j < data.length - 2){ j++; k = j + 1; }
  else { return  nSvg.select('.reset-button').style('opacity', 1) }

  //speed up when second animation ends
  if (j !== 0){ duration = duration*.995; }
  setTimeout(animateStep, duration);
}