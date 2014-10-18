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

function addLine(a, b, m, θ, out){
  var ℓ = length(a, b)
  var line = svg.append('path')
    //   .attr('d', ['M', a, 'L', m].join(''))
    // .transition().duration(1000)
      .attr('d', ['M', a, 'L', b].join(''))
      // .each('end', function(){
      // })        
      var done;
      var rect = svg.append('rect')
          .attr({x: a[0], y: a[1], height: ℓ/sqrt2, width: ℓ/sqrt2})
          .attr('transform', ['rotate(', -θ + 45,',', a, ')'].join(''))
          .attr('class', ~out ? 'left' : 'right')
      rect
          .on('mouseover', function(){
            if (done) return
            var ℓ1 = ℓ/2*sqrt2
            //calc midpoint to animate from
            var m1 = [(a[0] + b[0])/2, (a[1] + b[1])/2]

            var θ1 = (θ - 45*out) % 360
            var b1 = extendLine(a, ℓ1, θ1)
            addLine(a, b1, m1, θ1, 1)

            var θ2 = (θ + 45*out) % 360
            var a2 = extendLine(b, ℓ1, θ2 - 180)
            addLine(a2, b, m1, θ2, -1)

            line.style('opacity', .2)
            rect.style('opacity', .05).remove()
            done = true
      })

}

addLine([0, height/2], [width, height/2], [0, height/2], 90, 1)


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

d3.select('#reset').on('click', function(){
  svg.selectAll('*').remove()
  addLine([0, height/2], [length, height/2], length, 90, true)
})

