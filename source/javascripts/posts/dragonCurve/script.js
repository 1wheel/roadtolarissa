var sqrt2 = Math.sqrt(2)
var π = Math.PI

var width = 400,
    height = 400,
    margin = {left: 150, right: 80, top: 0, bottom: 100}

var svg = d3.select('#dragon-curve')
    .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

function addLine(a, b, m, θ, isLeft){
  var ℓ = length(a, b)
  var line = svg.append('path')

  line.attr('d', ['M', a, 'L', m].join(''))
    .transition().duration(1000)
      .attr('d', ['M', a, 'L', b].join(''))
      .each('end', function(){
      var done;
      var rect = svg.append('rect')
      rect.attr({x: b[0], y: b[1], height: 0, width: 0})
          .attr('transform', ['rotate(', -θ + 225,',', b, ')'].join(''))
          .attr('class', isLeft ? 'left' : 'right')
        .transition().duration(1000)
          .attr({height: ℓ/sqrt2, width: ℓ/sqrt2})
      rect
          .on('mouseover', function(){
            if (done) return
            var ℓ1 = ℓ/2*sqrt2
            //calc midpoint to animate from
            var m1 = [(a[0] + b[0])/2, (a[1] + b[1])/2]

            var θ1 = (360 + θ - 45) % 360
            var b1 = extendLine(a, ℓ1, θ1)
            addLine(a, b1, m1, θ1, true)

            var θ2 = (360 + θ - 135) % 360
            var b2 = extendLine(b, ℓ1, θ2)
            addLine(b, b2, m1, θ2, false  )

            line.style('opacity', .2)
            rect.style('opacity', .05).remove()
            done = true
      })        
      })

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
      addLine([0, height/2], [width, height/2], [0, height/2], 90, 1)
    })
    .on('click')()
