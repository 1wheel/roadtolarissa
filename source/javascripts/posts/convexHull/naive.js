function drawNaive(){
  var numPoints = 20,
      points = uniformRandom(numPoints)

  var svg = d3.select('#naive').html('')
    .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var bArea = svg.append('path').style({fill: blue, opacity: .99})
  var rArea = svg.append('path').style({fill: red,  opacity: .99})

  var pairLineG = svg.append('g')
  var trialLineG = svg.append('g')

  var circles = svg.selectAll('circle')
      .data(points).enter()
    .append('circle').classed('point', true)
      .attr('r', 3)
      .attr('cx', f('x'))
      .attr('cy', f('y'))
      .each(function(d){ d.circle = d3.select(this) })

  var pairs = []
  d3.range(numPoints).forEach(function(i){
    d3.range(i + 1, numPoints).forEach(function(j){
      pairs.push({i: i, j: j, a: points[i], b: points[j]})
    })
  })

  trialLineG.selectAll('trialLine')
      .data(pairs).enter()
    .append('path').classed('trialLine', true)
      .on('mouseover', function(d){
      	if (this.__transition__) return
      	drawPairLine(d)
      	d3.select(this).attr({class: 'pairLine'}).style({'stroke-width': 4, opacity: 1})
      })
      .on('mouseout', function(d){
      	if (this.__transition__) return
        var m = [(d.a.x + d.b.x)/2, (d.a.y + d.b.y)/2]
  			d3.select(this).transition().duration(1000)
  					.attr('d', ['M', m, 'L', m].join(''))
  					.remove()

  			// circles.transition().duration(1000)
  			// 		.attr('r', 5).style('fill', 'black')
  			// divideLine.attr('d', 'M0,0')
      })
      .style({opacity: '1', 'stroke-width': 5})
      .attr('stroke-linecap', 'round')
      .attr('d', function(d){
        return ['M', d.a.p, 'L', d.a.p].join('') })
    .transition().delay(function(d){ return d.i*800 }).duration(800)
    	.each('start', function(d){
    		d.a.circle.transition().attr('r', 10)
    	})
      .each('end', function(d){
        d.a.circle.transition().attr('r', 5)
      })
      .attr('d', function(d){
        return ['M', d.a.p, 'L', d.b.p].join('') })
    .transition()
      .style({'stroke-width': 2, opacity: .8})


  function drawPairLine(pair){
    var a = pair.a
    var b = pair.b
    
    var otherCircles = circles
        .attr('class', function(d, i){ return i != a.i && i != b.i ? 'point' : 'selectedPoint' })
        .filter(function(d, i){ return i != a.i && i != b.i })
    
    var m = (a.y - b.y)/(a.x - b.x)
    var B = a.y - m*a.x
    var x0 = 0
    var x1 = width

    bArea.attr('d',  ['M', x0, 		',', 	B + m*x0, 
  										'L', 0, 		',', 	0,
  										'L', width, ',', 	0,
  										'L', x1, 	',', 	B + m*x1,
  										].join(''))
    rArea.attr('d',  ['M', x0, 		',', 	B + m*x0, 
  										'L', 0, 		',', 	height,
  										'L', width, ',', 	height,
  										'L', x1, 	',', 	B + m*x1,
  										].join(''))

    var dir = a.x  > b.x 
    var allSame = true
    var lastLeft
    otherCircles.style('fill', function(d, i){
      var isLeft =  (d.x*m + B > d.y)
    	if (i && isLeft ^ lastLeft){
    		allSame = false
    	}
    	lastLeft = isLeft
      // return isLeft ? blue : red
    })
    if (allSame){
      pairLineG.append('path')
          .classed('convex', true)
          .attr('marker-end', 'url(#head)')
          .attr('d', ['M', a.x, ',', a.y, ' L', b.x, ',', b.y].join(''))
    }
  }
  
  addResetButton(svg, drawNaive)
}
drawNaive()