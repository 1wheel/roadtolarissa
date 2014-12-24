var green = '#01863e',
		blue = '#1c4695',
		red = '#ec3221',
    white = '#fff'

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 750 - margin.left - margin.right
    height = 500 - margin.top - margin.bottom

function minDistPoint(n){
  var rv = [], p;
  while (rv.length < n){
    p = [ Math.random()*width* .9 + width *(1 - .9)/2, 
          Math.random()*height*.9 + height*(1 - .9)/2]
    p = {x: p[0], y: p[1], p: p}

    if (rv.every(function(q){ return dist(p, q) > 40 })) rv.push(p)
  }

  rv.forEach(function(p, i){ p.i = i })
  return rv
}


function uniformRandom(n){
  return d3.range(n).map(function(i){
    var p = [ Math.random()*width* .9 + width *(1 - .9)/2, 
              Math.random()*height*.9 + height*(1 - .9)/2]
    return {x: p[0], y: p[1], p: p, i: i}
  })
}


function midPoint(a, b){
  return [(a.x + b.x)/2, (a.y + b.y)/2]
}

function norm(v){
  return Math.sqrt(v[0]*v[0] + v[1]*v[1])
}

function calcAngle(a, b, c){
  var v1 = [b.x - a.x, b.y - a.y]
  var v2 = [c.x - b.x, c.y - b.y]
  
  var dot = v1[0]*v2[0] + v1[1]*v2[1]

  var ab = dist(a, b)
  var bc = dist(b, c)
  var ca = dist(c, a)
  // console.log(v1[0]*v2[1] - v2[0]*v1[1])

  return Math.acos((bc*bc + ab*ab - ca*ca)/(2*bc*ab))*180/Math.PI
  // return Math.acos(dot/(norm(v1)*norm(v2)))*180/Math.PI
}

function dist(a, b){
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

function lessThan180(a, b, c){
  var v1 = [b.x - a.x, b.y - a.y]
  var v2 = [c.x - b.x, c.y - b.y]
  
  return v1[0]*v2[1] - v2[0]*v1[1] < 0
}

function drawAngle(a, b, c){
  if (!c) return
  b.g = d3.select(b.circle.node().parentNode).append('g')

  var v1 = [b.x - a.x, b.y - a.y]
  var norm1 = norm(v1)
  var p1 = [b.x - v1[0]/norm1*30, b.y - v1[1]/norm1*30]

  var v2 = [b.x - c.x, b.y - c.y]
  var norm2 = norm(v2)
  var p2 = [b.x - v2[0]/norm2*30, b.y - v2[1]/norm2*30]

  if (isNaN(p1[0] + p2[0])) return
    
  b.g.append('circle').style({'fill-opacity': .5, stroke: 'white'})
      .attr('cx', p2[0])
      .attr('cy', p2[1])
      .attr('r', 2)

  b.g.append('circle').style({'fill-opacity': .5, stroke: 'white'})
      .attr('cx', p1[0])
      .attr('cy', p1[1])
      .attr('r', 2)  

  var sweep = +!lessThan180(a, b, c)
  var angle = calcAngle(a, b, c)
  angle = sweep ? 360 - angle : angle

  var arc = b.g.append('path').classed('arc', true)
      .attr('d', ['M', p1[0], p1[1], 'A', 30, 30, 0, +sweep, 1, p2[0], p2[1]].join(' '))

  var length = arc.node().getTotalLength()

  arc.attr({'stroke-dasharray': length + ' ' + length, 'stroke-dashoffset': length})
    .transition().duration(300).ease('linear')
      .attr('stroke-dashoffset', 0)
      .styleTween('stroke', function(){
        return function(t){
          return t*angle < 180 ? green : red
        }
      })

}


function addResetButton(svg, fn){
  svg.append('text').classed('reset-button', true)
    .attr({dy: '1em', dx: '.2em'})
    .on('click', fn)
    .text('↻')
}