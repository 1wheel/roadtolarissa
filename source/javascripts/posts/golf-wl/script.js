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

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(18)

var xTick = x(1),
		yTick = y(8);

var radiusScale = d3.scale.sqrt()
		.range([0, 10])

var lineWidthScale = d3.scale.linear()
		.range([0, 1, 8])

var color = d3.scale.ordinal()
		.domain(['up', 'same', 'down'])
		.range(['#01863e', '#1c4695', '#ec3221'])

var svg = d3.select('#golf-wl')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

svg.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.attr('class', 'x axis')
		.call(xAxis)
	.append('text')
		.attr('transform', 'translate(' + width/2 + ',0)')
		.text('Hole')
		.style('text-anchor', 'middle')


var holeConstrains = {},
		rounds = [],
		directions = ['down', 'same', 'up'],
		roundHash = {},
		matches,
		selectedMatches = [];

//load state from url
window.location.hash.substr(1).split(',').forEach(function(d){
		if (!d) return
    holeConstrains[d.split(':')[0]] = d.split(':')[1].split('_')
  		.map(function(d){ return +d; }) 
})

d3.range(0, 19).forEach(function(hole){
	d3.range(-9, 10).forEach(function(spread){
		if (10 - Math.abs(10 - hole) >= Math.abs(spread)){
			if (hole + spread < 2) return
			var round = {hole: hole, spread: spread};
			rounds.push(round);
			roundHash[hole + ':' + spread] = round;
		}
	})
})

var roundGs = svg.selectAll('.roundG')
		.data(rounds).enter()
	.append('g')
		.attr('transform', function(d){
			return ['translate(', x(d.hole), ',', y(d.spread), ')'].join(''); })

d3.json('flat-data.json', function(err, data){
	matches = data;
	//winner of the first match always on top -  do server side
	matches.forEach(function(match){
		var flip = false;
		match.scores.some(function(d){
			if (d < 0){ flip = true}
			return d != 0;
		})
		if (flip){ 
			match.oldScore = match.scores.slice();
			match.scores = match.scores.map(function(d){ return d === null ? null : -1*d; })
		}
	})

	function updateData(){
		rounds.forEach(function(d){
			directions.concat('count').forEach(function(str){ d[str] = 0 }) })
		selectedMatches = [];

		var holeConstrainsArray = d3.entries(holeConstrains);

		matches.forEach(function(match){
			//don't count matches that don't meet constraints
			var meetsConstraints = holeConstrainsArray.every(function(d){
				return _.contains(d.value, match.scores[d.key])
			})	
			if (!meetsConstraints) return
			selectedMatches.push(match)

			match.scores.forEach(function(spread, hole){
				var round = roundHash[hole + ':' + spread]
				if (!round) return;
				round.count++;
				var nextSpread = match.scores[hole+1];
				if (nextSpread == null) return
				round[nextSpread < spread ? 'down' : nextSpread == spread ? 'same' : 'up']++;
			})
		})
	}
	updateData();

	function updateScales(){
		radiusScale.domain(d3.extent(rounds, f('count')))
		var maxLineVals = directions.map(function(str){ return d3.max(rounds, ƒ(str)) })
		lineWidthScale.domain([0, 1, d3.max(maxLineVals)])
	}
	updateScales();

	function firstDraw(){
		roundGs.selectAll('line')
				.data(function(d){
					return directions.map(function(str, i){
						return {type: str, direction: i - 1}
					}) })
				.enter()
			.append('line')
				.attr({x2: xTick})
				.attr('y2', function(d){ return d.direction*(-yTick)})
				.style('stroke', _.compose(color, f('type')))


		roundGs.append('circle')

		roundGs.append('rect')
				.attr({x: -xTick/2, y: -yTick/2, width: xTick, height: yTick})
				.on('mouseover', function(d){
					d3.select(this).classed('hovered', true)
					console.log(d.hole, d.spread, d.count)
				})
				.on('mouseout', function(d){
					d3.select(this).classed('hovered', false)
				})
				.on('click', function(d){
					var selected = !d3.select(this).classed('selected')
					d3.select(this).classed('selected', selected)
					if (selected){
						if (holeConstrains[d.hole]){
							holeConstrains[d.hole].push(d.spread);
						} else{
							holeConstrains[d.hole] = [d.spread];
						}
					} else{
						holeConstrains[d.hole] = holeConstrains[d.hole]
							.filter(function(spread){ return spread != d.spread; })

						if (!holeConstrains[d.hole].length){
							delete holeConstrains[d.hole];
						}
					}

					//update url
					var hash = '';
					d3.entries(holeConstrains).forEach(function(d){
						hash += [d.key, ':', d.value.join('_'), ','].join('');
					})
					window.location.hash = hash.substr(0, hash.length - 1);

					updateData();
					updateScales();
					updateDOM(d.hole, d.spread, 50, 300);
				})
				.classed('selected', function(d){
					return holeConstrains[d.hole] && _.contains(holeConstrains[d.hole], d.spread);
				})
	}
	firstDraw();

	function updateDOM(hole, spread, delayTime, duration){
		roundGs.selectAll('line')
				.data(function(d){
					return directions.map(function(str, i){
						return {type: str, count: d[str], direction: i - 1, hole: d.hole, spread: d.spread}
					}) 
				})
			.transition().delay(delayFn).duration(duration)
				.style('stroke-width', _.compose(lineWidthScale, f('count')))

		roundGs.select('circle')
			.transition().delay(delayFn).duration(duration)
				.attr('r', _.compose(radiusScale, f('count')))

		function delayFn(d){
			return (Math.abs(hole - d.hole) + Math.abs(spread - d.spread))*delayTime ;
		}
	}
	updateDOM(0, 0, 0, 0);
})