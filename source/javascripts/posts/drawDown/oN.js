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

var oConnectionLine = oSvg.append('line').classed('connection', true)
var oHeightLine = oSvg.append('line').classed('connection', true)
var oBestLine = oSvg.append('line').classed('best', true);
var oBestHeightLine = oSvg.append('line').classed('best', true);

var peak = -1,
    l = 0,
    oBest = Infinity;
oAnimateStep();

function oAnimateStep(){
  oConnectionLine
      .attr({ x1: x(l),
              y1: y(data[l]),
              x2: x(peak),
              y2: y(data[peak]) })

  oHeightLine
      .attr({ x1: x(l),
              y1: y(data[l]),
              x2: x(l),
              y2: y(data[peak]) })

  oSvg.selectAll('.connection')
      .style('stroke', color(data[peak] - data[l]))

  if (oBest > data[l] - data[peak]){
    oBest = data[l] - data[peak];
    oSvg.selectAll('.best')
      .attr({ x1: x(peak),
              y1: y(data[peak]),
              x2: x(l),
              y2: y(data[l]) });
    oBestHeightLine.attr('x1', x(l))

    oSvg.selectAll('.best')
        .style('stroke', color(data[peak] - data[l]))
  }

  oCircles.filter(function(d, i){ return i === l; })
      .attr('r', 7)
    .transition().duration(duration + 200)
      .attr('r', 5)


  if (data[l] > data[peak] || !data[peak]){
    oCircles.attr('r', function(d, i){ return i === l ? 10 : 5; });

    var animationDuration = l - peak < 5 ? 400 : 800;
    oConnectionLine.transition().duration(animationDuration)
        .attr({x2: x(l), y2: y(data[l])})

    peak = l;
    if (l < data.length - 1){
      l++; 
      setTimeout(oAnimateStep, animationDuration);
    }
  } else{
    if (l < data.length - 1){
      l++; 
      setTimeout(oAnimateStep, duration);
    }    
  }
  
  }

