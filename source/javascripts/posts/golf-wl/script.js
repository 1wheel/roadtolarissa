// creates array of matches 
// _.flatten(d3.values(data).map(function(d){ return d3.values(d); }))

var height = 500,
		width = 750,
		margin = {left: 20, right: 20, top: 20, bottom: 20};

var x = d3.scale.linear()
		.domain([0, 18])
		.range([0, width])

var y = d3.scale.linear()
		.domain([9, -9])
		.range([0, height])

var svg = d3.select('#golf-wl')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

d3.json('flat-data.json', function(err, data){
	var rounds = [];
	d3.range(0, 18).forEach(function(matchNum){
		d3.range(-9, 10).forEach(function(spread){
			if (9 - Math.abs(9 - matchNum) >= Math.abs(spread)){
				rounds.push({matchNum: matchNum, spread: spread})
			}
		})
	})
	

	svg.selectAll('circle')
			.data(rounds).enter()
		.append('circle')
			.attr('r', 10)
			.attr('cx', _.compose(x, f('matchNum')))
			.attr('cy', _.compose(y, f('spread')))

})