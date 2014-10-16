var sqrt2 = Math.sqrt(2)
var π = Math.PI

var width = 400,
    height = 400,
    margin = {left: 200, right: 200, top: 200, bottom: 200}

var svg = d3.select('#dragon-curve')
    .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

function addLine(a, b, ℓ, θ, out){
  var line = svg.append('path')
      .attr('d', ['M', a, 'L', b].join(''))

  var done;
  var rect = svg.append('rect')
      .attr({x: a[0], y: a[1], height: ℓ/sqrt2, width: ℓ/sqrt2})
      .attr('transform', ['rotate(', -θ + 45,',', a, ')'].join(''))
      .on('mouseover', function(){
        if (done) return

        var ℓ1 = ℓ/2*sqrt2

        var θ1 = (θ - 45) % 360
        var b1 = extendLine(a, ℓ1, θ1)
        addLine(a, b1, ℓ1, θ1, true)

        var θ2 = (θ + 45) % 360
        var a1 = extendLine(b, ℓ1, θ2 - 180)
        addLine(a1, b, ℓ1, θ2, false)

        line.style('opacity', .2)
        rect.style('opacity', .05).remove()
        done = true
      })
}

var length = width
addLine([0, height/2], [length, height/2], length, 90, true)


function extendLine(a, ℓ, θ){
  return [a[0] + ℓ*Math.sin(θ*π/180), a[1] + ℓ*Math.cos(θ*π/180)]
}