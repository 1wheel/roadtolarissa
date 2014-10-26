var green = '#01863e',
		blue = '#1c4695',
		red = '#ec3221',
    white = '#fff'

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 750 - margin.left - margin.right
    height = 500 - margin.top - margin.bottom

function uniformRandom(n){
	return d3.range(n).map(function(i){
	  var p = [	Math.random()*width* .9 + width *(1 - .9)/2, 
	  					Math.random()*height*.9 + height*(1 - .9)/2]
	  return {x: p[0], y: p[1], p: p, i: i}
	})
}