var green = '#01863e',
		blue = '#1c4695',
		red = '#ec3221'


var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 750 - margin.left - margin.right
    height = 500 - margin.top - margin.bottom

var numPoints = 20,
    points = d3.range(numPoints).map(function(i){
      var p = [Math.random()*width, Math.random()*height]
      return {x: p[0], y: p[1], p: p, i: i}
    })

var svg = d3.select('#naive')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var pairLine = svg.append('path')
    .classed('pairLine', true)
    .attr('marker-end', 'url(#head)')
var pairLineG = svg.append('g')
var trialLineG = svg.append('g')

svg.append('defs').append('marker')
    .attr({id: 'head', orient: 'auto', markerWidth: 2, markerHeight: 4, refX: .1, refY: 2})
  .append('path')
    .attr({d: 'M0,0 V4 L2,2 Z', fill: 'red'})

circles = svg.selectAll('circle')
    .data(points).enter()
  .append('circle').classed('point', true)
    .attr('r', 3)
    .attr('cx', f('x'))
    .attr('cy', f('y'))
    .each(function(d){ d.circle = d3.select(this) })



var pairs = []
d3.range(numPoints).forEach(function(i){
  d3.range(numPoints).forEach(function(j){
    if (i === j) return 
    pairs.push({i: i, j: j, a: points[i], b: points[j]})
  })
})

trialLineG.selectAll('trialLine')
    .data(pairs).enter()
  .append('path').classed('trialLine', true)
    .on('mouseover', function(d){
    	if (this.__transition__) return
    	drawPairLine(d)
    	d3.select(this).attr({class: 'pairLine'}).style('stroke-width', 4)
    })
    .on('mouseout', function(d){
    	if (this.__transition__) return
			d3.select(this).transition().duration(1000)
					.attr('d', ['M', d.b.x, ',', d.b.y, ' L', d.b.x, ',', d.b.y].join(''))
					.remove()
    })
    .style({opacity: '1', 'stroke-width': 4})
    .attr('d', function(d){
      return ['M', d.a.p, 'L', d.a.p].join('') })
  .transition().delay(function(d){ return d.i*800 }).duration(800)
  	.each('start', function(d){
  		d.a.circle.transition().attr('r', 10)
  	})
    .attr('d', function(d){
      return ['M', d.a.p, 'L', d.b.p].join('') })
  .transition()
    .style({'stroke-width': 1, opacity: .8})


var curPairIndex = 0;
function iteratePair(){
  drawPairLine(pairs[curPairIndex])
  curPairIndex++
  if (curPairIndex == pairs.length) return
  window.setTimeout(iteratePair, 100)
}
//iteratePair()

function drawPairLine(pair){
  var a = pair.a
  var b = pair.b
  
  var otherCircles = circles
      .classed('left', false)
      .classed('right', false)
    .transition()
      .attr('r', 5)
      .filter(function(d, i){ return i != a.i && i != b.i })

  a.circle.classed('left',  true)
  	.transition()
		  .attr('r', 10)
  b.circle.classed('right', true)
  	.transition()
  		.attr('r', 10)
  //pairLine.attr('d', ['M', a.x, ',', a.y, ' L', b.x, ',', b.y].join(''))

  var m = (a.y - b.y)/(a.x - b.x)
  var B = a.y - m*a.x
  var dir = a.x  > b.x 

  var allLeft = true
  otherCircles.style('fill', function(d){
    var isLeft = dir ^ (d.x*m + B > d.y)
    allLeft = allLeft && isLeft
    return isLeft ? blue : red
  })
  if (allLeft){
    pairLineG.append('path')
        .classed('convex', true)
        .attr('marker-end', 'url(#head)')
        .attr('d', ['M', a.x, ',', a.y, ' L', b.x, ',', b.y].join(''))
  }

}