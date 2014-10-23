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

svg.append('path')
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
    .attr('r', 5)
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
    .on('mouseover', trialMouseOver)
    .style({stroke: 'darkgrey', 'stroke-width': 4})
    .attr('d', function(d){
      return ['M', d.a.p, 'L', d.a.p].join('') })
  .transition().delay(function(d){ return d.i*0000 }).duration(800)
    .attr('d', function(d){
      return ['M', d.a.p, 'L', d.b.p].join('') })
  .transition()
    .style('stroke-width', 2)

function trialMouseOver(pair){
  drawPairLine(pair)
  d3.select(this).remove()
}

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
      .attr('r', 5)
      .filter(function(d, i){ return i != a.i && i != b.i })

  a .circle.attr('r', 10).classed('left',  true)
  b.circle.attr('r', 10).classed('right', true)
  d3.select('.pairLine')
      .attr('d', ['M', a.x, ',', a.y, ' L', b.x, ',', b.y].join(''))

  var m = (a.y - b.y)/(a.x - b.x)
  var B = a.y - m*a.x
  var dir = a.x  > b.x 

  var allLeft = true
  otherCircles.style('fill', function(d){
    var isLeft = dir ^ (d.x*m + B > d.y)
    allLeft = allLeft && isLeft
    return isLeft ? 'yellow' : 'blue'
  })
  if (allLeft){
    pairLineG.append('path')
        .classed('convex', true)
        .attr('marker-end', 'url(#head)')
        .attr('d', ['M', a.x, ',', a.y, ' L', b.x, ',', b.y].join(''))
  }

}