
var width = 750,
    oHeight = 150,
    sHeight = 100,
    sWidth = 150,

    colors = ["#f2f0f7","#cbc9e2","#9e9ac8","#756bb1","#54278f"],
    scroll = gscroll()
        .container(d3.select('#container'))
        .fixed(d3.selectAll('#overlay, #overlay-space')),
    n = 50,
    circleX = d3.scale.linear().domain([0, n - 1]).range([0, sWidth]),
    circleY = d3.scale.linear().range([sHeight, 0]),
    ƒ = function(s){ return function(o){ return o[s] } }

var steps = [
  {scale: 'gradient', values: 'start'},
  {scale: 'quantize', values: 'start'},
  {scale: 'quantize', values: 'quantizeFlaw'},
  {scale: 'quantile', values: 'quantizeFlaw'},
  {scale: 'quantile', values: 'quantileFlaw'},
  {scale: 'jenks',     values: 'quantileFlaw'}
]

var values = {}
values.start = d3.range(n).map(function(){
  return Math.random() }).sort()
values.quantizeFlaw = d3.range(n).map(function(d){
  return Math.random()*.2 + (d/n >= 4/5 ? .8 : 0) }).sort()
values.quantileFlaw = d3.range(n).map(function(d){
  return Math.random() }).sort()

var jBreaks = ss.jenks(values.quantileFlaw, 5)
jBreaks[jBreaks.length - 1] = 1

var rectAttrs = {}
rectAttrs.gradient = function(selection){
  selection
    .attr('x', 0)
    .attr('width', sWidth)
    .attr('y', function(d, i){ return (colors.length - 1 - i)*sHeight/colors.length })
    .attr('height', sHeight/colors.length)
}
rectAttrs.quantize = function(selection){
  selection
    .attr('x', 0)
    .attr('width', sWidth)
    .attr('y', function(d, i){ return (colors.length - 1 - i)*sHeight/colors.length })
    .attr('height', sHeight/colors.length)
}
rectAttrs.quantile = function(selection){
  selection
    .attr('x', function(d, i){ return i*sWidth/colors.length })
    .attr('width', sWidth/colors.length)
    .attr('y', 0)
    .attr('height', sHeight)
}
rectAttrs.jenks = function(selection){
  selection
    .attr('x', 0)
    .attr('width', sWidth)
    .attr('y', function(d, i){ return circleY(jBreaks[i + 1]) })
    .attr('height', function(d, i){
      return circleY(jBreaks[i]) - circleY(jBreaks[i + 1]) })
}

var scales = {}
scales.gradient = d3.scale.linear().range([colors[0], colors[colors.length - 1]])
scales.quantize = d3.scale.quantize().range(colors)
scales.quantile = d3.scale.quantile().range(colors)
scales.jenks = d3.scale.threshold().domain(jBreaks.slice(1)).range(colors)

d3.select('#bot-padding')
    .style('height', window.innerHeight - oHeight - sHeight - 100 + 'px')


var svg = d3.select('#overlay').select('svg')
    .attr({width: 750, height: oHeight})

var gradScale = d3.scale.linear()
    .domain([0, colors.length])
    .range([colors[0], colors[colors.length - 1]])
svg.append('defs').selectAll('linearGradient')
    .data(colors).enter()
  .append('linearGradient')
    .attr({x1: 0, x2: 0, y1: 1, y2: 0})
    .each(function(d, i){
      d3.select(this).attr('id', 'lg' + i)
        .append('stop')
          .datum({gradColor: gradScale(i), discColor: colors[i]})
          .attr({'stop-color': gradScale(i), offset: '0%'})
      d3.select(this).append('stop')
          .attr({'stop-color': gradScale(i + 1), offset: '100%'})
          .datum({gradColor: gradScale(i + 1), discColor: colors[i]})
    })


//scatter plot
var scatterG = svg.append('g')
    .attr('transform', 'translate(' + 50 + ',' + (oHeight - sHeight)/2 + ')')
    .on('mousemove', function(){

      updateHover(Math.round(circleX.invert(d3.mouse(this)[0])))
    })

var rects = scatterG.selectAll('rect')
    .data(colors).enter()
  .append('rect')
    .attr('fill', function(d, i){ return 'url(#lg' + i + ')' })
    .call(rectAttrs.gradient)

var circles = scatterG.selectAll('circle')
    .data(values.start).enter()
  .append('circle')
    .attr('r', 2)
    .attr('cx', function(d, i){ return circleX(i) })
    .attr('cy', circleY)

scatterG.append('text')
    .text('value →')
    .attr('transform', 'rotate(270)')
    .attr({x: 0, 'text-anchor': 'end', dy: '-.13em'})

scatterG.append('text')
    .text('rank →')
    .attr({x: sWidth, y: sHeight, 'text-anchor': 'end', dy: '.66em'})


//map
var mapG = svg.append('g')
    .attr('transform', 'translate(' + (width - 50 - sWidth) + ',' + (oHeight - sHeight)/2 + ')')
    .attr('clip-path', 'url(#mapclip)')

d3.select('defs').append('clipPath').attr('id', 'mapclip')
  .append('rect').attr({width: sWidth, height: sHeight})
var points = []
while (points.length < n){
  var p = [Math.random()*sWidth, Math.random()*sHeight]
  if (points.every(function(d){ return dist(p, d) > 12 })) points.push(p)
}
mapG.selectAll('area')
    .data(d3.geom.voronoi()(points)).enter()
  .append('path').classed('area', true)
    .attr('d', function(d, i){
      d.i = i
      return 'M' + d.join('L') + 'Z' })
    .on('mouseover', function(d){ updateHover(d.i) })

var curValues, curRect, curScaleStr, curScale
scroll.on('active', function(i){
  curValues = values[steps[i].values]
  curScaleStr = steps[i].scale
  curRect = rectAttrs[curScaleStr]
  curScale = scales[curScaleStr]

  if (curScaleStr === 'quantile') curScale.domain(curValues)

  circles.data(curValues)
    .transition().duration(1000)
      .attr('cy', circleY)

  rects
    .transition().duration(1000)
      .call(curRect)

  d3.selectAll('.area')
    .transition().duration(1000)
      .attr('fill', function(d, i){ return curScale(curValues[d.i]) })

  svg.selectAll('stop')
    .transition().duration(1000)
      .attr('stop-color', ƒ(i ? 'discColor' : 'gradColor'))


  d3.selectAll('#color-code div')
      .style('display', function(){ 
        return d3.select(this).attr('id') == curScaleStr ? 'block' : 'none' })
})(d3.selectAll('.scroll-section'))


function updateHover(i){
  i = Math.max(i, 0)
  scatterG.selectAll('circle')
      .classed('selected', function(d, j){ return i == j })
  
  mapG.selectAll('.area')
      .classed('selected', function(d){ return i == d.i })
  mapG.node().appendChild(mapG.select('.selected').node())
}

function dist(a, b){
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
}
