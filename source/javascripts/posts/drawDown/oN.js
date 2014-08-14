var oSvg = d3.select('#oN')
	.append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

oSvg.append('path')
    .attr('d', line(data))

var oCircles = oSvg.append('g').selectAll('circle')
    .data(data).enter()
  .append('circle')
    .attr('cx', function(d, i){ return x(i); })
    .attr('cy', y)
    .attr('r', 5)

var oBestLine = oSvg.append('line').classed('best', true);
var oBestHeightLine = oSvg.append('line').classed('best', true);
var oConnectionLine = oSvg.append('line').classed('connection', true)
var oHeightLine = oSvg.append('line').classed('connection', true)

var peak = -1,
    l = 0,
    oBest = Infinity;
oAnimateStep();

function oAnimateStep(){
  if (data[l] > data[peak] || !data[peak]){
    oCircles.attr('r', function(d, i){ return i === l ? 10 : 5; })
    peak = l;
  } 
  else{
    oConnectionLine
        .attr({ x1: x(l),
                y1: y(data[l]),
                x2: x(l),
                y2: y(data[l]) })
      //.transition().duration(duration - 50)
        .attr({ x2: x(peak),
                y2: y(data[peak]) })

    oHeightLine
        .attr({ x1: x(l),
                y1: y(data[l]),
                x2: x(l),
                y2: y(data[peak]) })

    if (oBest > data[l] - data[peak]){
      oBest = data[l] - data[peak];
      oSvg.selectAll('.best')
        .attr({ x1: x(peak),
                y1: y(data[peak]),
                x2: x(l),
                y2: y(data[l]) });
      oBestHeightLine.attr('x2', x(peak))
    }

    oCircles.filter(function(d, i){ return i === l; })
        .attr('r', 7)
      .transition().duration(duration + 200)
        .attr('r', 5)
  }

  if (l < data.length - 1){
    l++; 
  setTimeout(oAnimateStep, duration);
  }
}