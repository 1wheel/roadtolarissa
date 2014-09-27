// creates array of matches 
// _.flatten(d3.values(data).map(function(d){ return d3.values(d); }))

var height = 500,
		width = 750,
		margin = {left: 20, right: 20, top: 20, bottom: 20};

var x = d3.scale.linear()
		.domain([0, 18])
		.range([0, width])

var y = d3.scale.linear()
		.domain([-9, 9])
		.range([height, 0])

var radiusScale = d3.scale.sqrt()
		.range([0, 10])

var lineWidthScale = d3.scale.linear()
		.range([0, 1, 8])

var svg = d3.select('#golf-wl')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

d3.json('flat-data.json', function(err, matches){
	var rounds = [];
	d3.range(0, 19).forEach(function(roundNum){
		d3.range(-9, 10).forEach(function(spread){
			if (9 - Math.abs(9 - roundNum) >= Math.abs(spread)){
				rounds.push({roundNum: roundNum, spread: spread, count: 0, up: 0, same: 0, down: 0})
			}
		})
	})
	
	matches.forEach(function(match){
		//winner of the first match always on top
		var flip = false;
		match.scores.some(function(d){
			if (d < 0){ flip = true}
			return d != 0;
		})
		if (flip){ 
			match.scores = match.scores.map(function(d){ return -1*d; })
		}

		match.scores.forEach(function(spread, roundNum){
			var round = _.findWhere(rounds, {roundNum: roundNum, spread: spread});
			if (!round) return;
			round.count++;
			var nextSpread = match.scores[roundNum+1];
			if (isNaN(nextSpread)) return
			round[nextSpread < spread ? 'down' : nextSpread == spread ? 'same' : 'up']++;
		})
	})

	var directions = ['down', 'same', 'up']
	var maxLineVals = directions.map(function(str){ return d3.max(rounds, ƒ(str)) })

	radiusScale.domain(d3.extent(rounds, f('count')))
	lineWidthScale.domain([0, 1, d3.max(maxLineVals)])
	
	var roundGs = svg.selectAll('.roundG')
			.data(rounds).enter()
		.append('g')
			.attr('transform', function(d){
				return ['translate(', x(d.roundNum), ',', y(d.spread), ')'].join(''); })


	roundGs.selectAll('line')
			.data(function(d){
				return directions.map(function(str, i){
					return {type: str, count: d[str], direction: i - 1}
				}) })
			.enter()
		.append('line')
			.attr({x2: x(1)})
			.attr('y2', function(d){ return d.direction*(y(1) - y(0))})
			.style('stroke-width', _.compose(lineWidthScale, f('count')))
	roundGs.append('circle')
			.attr('r', _.compose(radiusScale, f('count')))
})