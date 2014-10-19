var sqrt2 = Math.sqrt(2),
    π = Math.PI,
    lines

var width = 750,
    height = 500

var zoom = d3.behavior.zoom().on('zoom', function(){
  svg.attr('transform', 
    ['translate(', d3.event.translate, ') scale(', d3.event.scale, ')'].join(''))
})

var svg = d3.select('#dragon-curve')
    .append('svg')
      .attr({width: width, height: height})
    .append('g')
      .call(zoom)

function addLine(a, b, m, θ, isLeft, level){
  var ℓ = length(a, b)
  var line = svg.append('path')
      .attr('d', ['M', a, 'L', m].join(''))
      .attr('vector-effect', 'non-scaling-stroke')
  line.transition().duration(1000)
      .attr('d', ['M', a, 'L', b].join(''))
      .each('end', function(){
      })
  var datum = {line: line, level: level, addRect: addRect, done: false, a: a}
  lines.push(datum)

  function addRect(delay){
    var rect = svg.append('rect')
    rect.attr({x: b[0], y: b[1], height: 0, width: 0})
        .attr('transform', ['rotate(', -θ + 225,',', b, ')'].join(''))
        .attr('class', isLeft ? 'left' : 'right')
      .transition().duration(1000).delay(delay*1000)
        .attr({height: ℓ/sqrt2, width: ℓ/sqrt2})
    rect
        .on('mouseover', function(){
          if (datum.done) return
          var ℓ1 = ℓ/2*sqrt2
          //calc midpoint to animate from
          var m1 = [(a[0] + b[0])/2, (a[1] + b[1])/2]

          var θ1 = (360 + θ - 45) % 360
          var b1 = extendLine(a, ℓ1, θ1)
          addLine(a, b1, m1, θ1, true, level + 1)

          var θ2 = (360 + θ - 135) % 360
          var b2 = extendLine(b, ℓ1, θ2)
          addLine(b, b2, m1, θ2, false, level + 1)

          line.style('opacity', .2)
          rect.style('opacity', .05).remove()
          datum.done = true

          var scale = zoom.scale()
          var center = zoom.translate().map(function(d){ return -d })
          var halfWidth  = width/ (2*scale)
          var halfHeight = height/(2*scale)
          var levelCompleted = lines.every(function(d){
            if (d.level != level || d.done) return true
            // check to that all of the same level that aren't completed are off screen
            return Math.abs(d.a[0] - center[0]) > halfWidth && 
                   Math.abs(d.a[1] - center[1]) > halfHeight 
          })
          if (levelCompleted){
            console.log('levelCompleted')
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

function midPoint(a, b){
  return [(a[0] + b[0])/2, (a[1] + b[1])/2]
}

d3.select('#step').on('click', function(){
  d3.selectAll('rect').filter(function(d, i){ return i < 4000 })
      .each(function(){ d3.select(this).on('mouseover')() })
})

d3.select('#reset')
    .on('click', function(){
      svg.selectAll('*').remove()
      
      svg.append('rect')
          .attr({width: width, height: height})
          .style('fill-opacity', 0)

      svg.attr('transform', 'translate(0, 0) scale(1)')
      zoom.scale(1).translate([0, 0])

      lines = []
      addLine([150, height/3], [width - 230, height/3], [0, height/2], 90, true, 0)
      lines[0].addRect(0)
    })
    .on('click')()
