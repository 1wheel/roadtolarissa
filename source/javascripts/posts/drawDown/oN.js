var oSvg = d3.select('#oN')
	.append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var oConnectionLine = oSvg.append('line').classed('connection', true)
var oHeightLine = oSvg.append('line').classed('connection', true)
var oBestLine = oSvg.append('line').classed('best', true);
var oBestHeightLine = oSvg.append('line').classed('best', true);

oSvg.append('path')
    .attr('d', line(data))

var oCircles = oSvg.append('g').selectAll('circle')
    .data(data).enter()
  .append('circle')
    .attr('cx', function(d, i){ return x(i); })
    .attr('cy', y)
    .attr('r', 3)

var pGroup = oSvg.append('g')
var pLine = pGroup.append('line').classed('text-line', true).attr({y1: height + margin.bottom - 20})
var pText = pGroup.append('text').style('text-anchor', 'end').attr('y', height + margin.bottom - 5)

var lGroup = oSvg.append('g')
var lLine = lGroup.append('line').classed('text-line', true).attr({y1: height + margin.bottom - 20})
var lText = lGroup.append('text').style('text-anchor', 'start').attr('y', height + margin.bottom - 5)

var bestTextGoN = oSvg.append('g')
bestTextGoN.append('text')
    .attr("transform", "rotate(-90)")
    .text('Biggest Drop')
    .style('text-anchor', 'middle')
    .style({'stroke': 'rgba(255, 255, 255, .8)', 'stroke-width': '5'})
bestTextGoN.append('text')
    .attr("transform", "rotate(-90)")
    .text('Biggest Drop')
    .style('text-anchor', 'middle')


var peak = 0,
    l = 1,
    oBest = Infinity;
oAnimateStep();

function oAnimateStep(){
  if (!playing){ return; }

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
      .style('stroke', color(data[l] - data[peak]))

  lGroup.attr('transform', 'translate(' + x(l) + ',0)')
  lLine.attr('y2', y(Math.min(data[l], data[peak])))
  lText.text('i: ' + l);


  if (oBest > data[l] - data[peak]){
    oBest = data[l] - data[peak];
    oSvg.selectAll('.best')
      .attr({ x1: x(peak),
              y1: y(data[peak]),
              x2: x(l),
              y2: y(data[l]) });
    oBestHeightLine.attr('x1', x(l))

    bestTextGoN.attr('transform', ['translate(', x(l) - 3, ',', Math.min(height - 15, y((data[l] + data[peak])/2)), ')'].join(''));

    oSvg.selectAll('.best')
        .style('stroke', color(data[l] - data[peak]))
  }

  oCircles.filter(function(d, i){ return i === l; })
      .attr('r', 7)
    .transition().duration(duration + 200)
      .attr('r', 3)


  if (data[l] > data[peak] || !peak){
    oCircles.attr('r', function(d, i){ return i === l ? 10 : 3; });

    var animationDuration = peak < 1 ? 0 : l - peak < 3 ? 300 : 1000;
    oConnectionLine.transition().ease('linear').duration(animationDuration)
        .attr({x2: x(l), y2: y(data[l])})

    var oldPeak = peak;
    peak = l;

    pGroup.transition().ease('linear').duration(animationDuration).attr('transform', 'translate(' + x(peak) + ',0)')
      .each(function(){
        pLine.transition().attr('y2', y(data[peak]))
        pText.transition().tween('text', function(){
          i = d3.interpolateRound(oldPeak, peak); 
          return function(t){ this.textContent = 'peak: ' + i(t); }    
        })   
      })


    if (l < data.length - 1){
      l++; 
      setTimeout(oAnimateStep, animationDuration + duration);
    }
  } else{
    if (l < data.length - 1){
      l++; 
      setTimeout(oAnimateStep, duration);
    }    
  }
  if (l === data.length - 1){ oSvg.select('.reset-button').style('opacity', 1); }
}




d3.selectAll([nSvg.node(), oSvg.node()]).append('text')
    .classed('reset-button', true)
    .attr({x: 0, y: 0, dy: '1em'})
    .style({'font-size': '30px', 'opacity': 0})
    .text('↻')


d3.selectAll([nSvg.node(), oSvg.node()]).append('rect')
    .attr({height: height + margin.bottom , width: width + margin.right, 'fill-opacity': 0})
    .style('cursor', 'pointer')
    .on('click', reset)
