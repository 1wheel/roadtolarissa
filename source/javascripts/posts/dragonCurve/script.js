var sqrt2 = Math.sqrt(2),
    π = Math.PI,
    lines,
    purple = 'rgb(164, 66, 126)',
    pink = 'rgb(255, 0, 215)',
    gold = 'rgb(241, 229, 6)',
    orange = 'rgb(255, 173, 22)',
    blue = 'rgb(69, 30, 245)'

var width = 750,
    height = 600

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 1 << 16])
    .on('zoom', function(){
      var scale = d3.event.scale
      var translate = d3.event.translate//.map(function(d){ return d/scale })
      svg.attr('transform', 
        ['translate(', translate, ') scale(', scale, ')'].join(''))
    })

var rootSVG = d3.select('#dragon-curve').append('svg')
      .attr({width: width, height: height})

var rectColor = rootSVG.append('defs').append('linearGradient')
    .attr({id: 'rectColor', x1: 1, y1: 0, x2: 0, y2: 1})
rectColor.append('stop').attr({offset: '0%',   'stop-color': orange})
rectColor.append('stop').attr({offset: '49%',   'stop-color': orange})
rectColor.append('stop').attr({offset: '51%', 'stop-color': blue})
rectColor.append('stop').attr({offset: '100%', 'stop-color': blue})

var svg = rootSVG.append('g').call(zoom)

function drawLine(a, b, m, θ, level){
  var ℓ = length(a, b)
  var rect = svg.append('rect')
  var line = svg.append('path')
      .attr('d', ['M', a, 'L', m].join(''))
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('stroke-linecap', 'square')
  line.transition().duration(1000)
      .attr('d', ['M', a, 'L', b].join(''))
  var datum = {line: line, level: level, addRect: addRect, done: false, a: a}
  lines.push(datum)

  var rectAdded = false
  function addRect(delay){
    if (rectAdded) return
    rectAdded = true
    rect.attr({x: b[0], y: b[1], height: 0, width: 0})
        .attr('transform', ['rotate(', -θ + 225,',', b, ')'].join(''))
        .attr('fill', 'url(#rectColor)')
        .classed('hoverrect', true)
      .transition().duration(1000).delay(delay*1000)
        .attr({height: ℓ/sqrt2, width: ℓ/sqrt2})
    rect
        .on('mouseover', function(){
          if (datum.done) return rect.remove()
          var ℓ1 = ℓ/2*sqrt2
          //calc midpoint to animate from
          var m1 = [(a[0] + b[0])/2, (a[1] + b[1])/2]

          var θ1 = (θ - 45) % 360
          var b1 = extendLine(a, ℓ1, θ1)
          drawLine(a, b1, m1, θ1, level + 1)

          var θ2 = (θ - 135) % 360
          var b2 = extendLine(b, ℓ1, θ2)
          drawLine(b, b2, m1, θ2, level + 1)

          line.style('opacity', .2).style('stroke-width', 1)
          rect.transition().duration(500).style('opacity', .05).remove()
          datum.done = true

          var scale = zoom.scale()
          var halfWidth  = width/ (2*scale)
          var halfHeight = height/(2*scale)
          var center = zoom.translate()
              .map(function(d, i){ return -d/scale + (i ? halfHeight : halfWidth) })
          var levelCompleted = lines.every(function(d){
            if (d.level != level || d.done) return true
            // check to that all of the same level that aren't completed are off screen
            return Math.abs(d.a[0] - center[0]) > halfWidth || 
                   Math.abs(d.a[1] - center[1]) > halfHeight 
          })
          if (levelCompleted){
            var nextLevel = lines.filter(function(d){ return d.level == level + 1 })
            nextLevel.forEach(function(d, i){  d.addRect(i/nextLevel.length) })
          }
    })        
  }
}

function extendLine(a, ℓ, θ){
  return [a[0] + ℓ*Math.sin(θ*π/180), a[1] + ℓ*Math.cos(θ*π/180)]
}

function length(a, b){
  var x2 = Math.pow(a[0] - b[0], 2)
  var y2 = Math.pow(a[1] - b[1], 2)
  return Math.sqrt(x2 + y2)
}

d3.select('#step').on('click', function(){
  d3.selectAll('.hoverrect').filter(function(d, i){ return i < 400 })
      .each(function(){ d3.select(this).on('mouseover')() })
})

d3.select('#reset')
    .on('click', function(){
      svg.selectAll('*').remove()
      
      svg.append('rect')
          .attr({width: width, height: height})
          .style('fill-opacity', .001)

      svg.attr('transform', 'translate(0, 0) scale(1)')
      zoom.scale(1).translate([0, 0])

      lines = []
      drawLine([170, height/2.61], [width - 120, height/2.61], [width - 120, height/2.61], 90, 0)
      lines[0].addRect(0)
    })
    .on('click')()