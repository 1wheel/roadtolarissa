// creates array of matches 
// _.flatten(d3.values(data).map(function(d){ return d3.values(d); }))

var height = 500,
		width = 750,
		margin = {left: 40, right: 47, top: 15, bottom: 20};

var x = d3.scale.linear()
		.domain([0, 18])
		.range([0, width])

var y = d3.scale.linear()
		.domain([-9, 9])
		.range([height, 0])


var xTickSize = x(1),
		yTickSize = y(8);

var radiusScale = d3.scale.sqrt()
		.range([0, 10])

var lineWidthScale = d3.scale.linear()
		.range([0, 1, 9])

var color = d3.scale.ordinal()
		.domain(['up', 'same', 'down'])
		.range(['#01863e', '#1c4695', '#ec3221'])

var holeConstrains = {},
		rounds = [],
		directions = ['down', 'same', 'up'],
		roundHash = {},
		matches,
		results = [];

//append and position static svg, axis, hoverlines, 
var svg, winnerText, tieText, loserText
(function(){
	svg = d3.select('#golf-wl')
	  .append('svg')
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .ticks(18)
	    .tickFormat(function(d){ return d < 18 ? d + 1 : 'end'; })

	var xAxisG = svg.append('g')
			.attr('transform', 'translate(0,' + height + ')')
			.attr('class', 'x axis')
			.call(xAxis)
	xAxisG.append('text')
			.attr('transform', 'translate(' + width/9 + ',0)')
			.text('Hole')
			.style('text-anchor', 'middle')

	var yAxis = d3.svg.axis()
			.scale(y)
			.ticks(18).orient("left");    

	var yAxisG = svg.append('g')
			.attr('transform', 'translate(-12,0)')
			.attr('class', 'y axis')
			.call(yAxis)
	yAxisG.selectAll('text').style('text-anchor', 'middle')
	yAxisG.append('text')
			.attr('transform', 'translate(' + 4 + ',' + (height*6/7) + ') rotate(90)')
			.text("First Scorer's Score")
			.style('text-anchor', 'end')

	svg.append('text')
			.classed('selectedText', true)

	svg.append('g')
			.attr('transform', 'translate(0, 20)')
		.selectAll('text')
			.data([0, 1]).enter()
		.append('text')
			.classed('hoveredText', true)
			.attr('dy', function(d){ return d + 'em'; })

	svg.append('g')
			.attr('transform', 'translate(0, 55)')
		.selectAll('text')
			.data(['up', 'same', 'down']).enter()
		.append('text')
			.classed('hoverTextResults', true)
			.attr('fill', _.compose(color, f()))
			.attr('dy', function(d, i){ return i + 'em' })

	svg.append('path')
			.attr('id', 'winningline')
			.attr('d', ['M', x(11.5), y(9), 'L', x(18.5), y(2)].join(' '))
			.classed('endline', true)
			.style('stroke', color('up'))

	winnerText = svg.append('text').append('textPath')
			.attr('xlink:href', '#winningline')
			.attr('startOffset', '35%')
		.append('tspan')
			.attr('dy', -5)
			.text('Winner line')
			.style('fill', color('up'))

	svg.append('path')
			.attr('id', 'losingline')
			.attr('d', ['M', x(12.5), y(-8), 'L', x(18.5), y(-2)].join(' '))
			.classed('endline', true)
			.style('stroke', color('down'))

	loserText = svg.append('text').append('textPath')
			.attr('xlink:href', '#losingline')
			.attr('startOffset', '22%')
		.append('tspan')
			.attr('dy', 15)
			.text('Loser line')
			.style('fill', color('down'))


	var tieG = svg.append('g')
			.attr('transform', ['translate(', x(18.6), ',', y(0), ')'].join(''))

	tieG.append('text')
			.text('Ties')
			.style('text-anchor', 'middle')
			.style('fill', color('same'))
			.attr('dy', '.7em')

	tieText = tieG.append('text')
			.style('text-anchor', 'middle')
			.attr('dy', '-.3em')
			.style('fill', color('same'))

	svg.append('g').selectAll('line')
			.data([0, 1]).enter()
		.append('line')
			.classed('hoverline', true)
})()

//load state from url
window.location.hash.substr(1).split(',').forEach(function(d){
		if (!d) return
    holeConstrains[d.split(':')[0]] = d.split(':')[1].split('_')
  		.map(function(d){ return +d; }) 
})

d3.range(0, 19).forEach(function(hole){
	d3.range(-9, 10).forEach(function(spread){
		if (10 - Math.abs(10 - hole) >= Math.abs(spread)){
			if (hole + spread < 2 && spread != 0) return
			var round = {hole: hole, spread: spread, color: ''};
			if (Math.abs(spread) > 18 - hole || hole === 18){
				round.type = spread < 0 ? 'down' : spread == 0 ? 'same' : 'up';
				round.color = color(round.type);
			}
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
		results = {'up': 0, 'same': 0, 'down': 0};

		var holeConstrainsArray = d3.entries(holeConstrains);

		matches.forEach(function(match){
			//don't count matches that don't meet constraints
			var meetsConstraints = holeConstrainsArray.every(function(d){
				return _.contains(d.value, match.scores[d.key])
			})	
			if (!meetsConstraints) return
			//selectedMatches.push(match)

			match.scores.forEach(function(spread, hole){
				var round = roundHash[hole + ':' + spread]
				if (!round) return;
				round.count++;
				var nextSpread = match.scores[hole+1];
				if (nextSpread == null){
					results[spread < 0 ? 'down' : spread == 0 ? 'same' : 'up']++;
				} else{
					round[nextSpread < spread ? 'down' : nextSpread == spread ? 'same' : 'up']++;
				}
			})
		})
	}
	updateData();

	function updateScales(){
		radiusScale.domain(d3.extent(rounds, f('count')))
		var maxLineVals = directions.map(function(str){ return d3.max(rounds, ƒ(str)) })
		lineWidthScale.domain([0, .999, d3.max(maxLineVals)])
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
				.attr({x2: xTickSize})
				.attr('y2', function(d){ return d.direction*(-yTickSize)})
				.style('stroke', _.compose(color, f('type')))

		roundGs.append('circle')
				.style('stroke', f('color'))
				.style('fill', f('color'))

		roundGs.append('rect')
				.attr({x: -xTickSize/2, y: -yTickSize/2, width: xTickSize, height: yTickSize})
				.on('mouseover', function(d){
					roundGs.selectAll('rect').classed('hovered', false)
					d3.select(this).classed('hovered', true)

					d3.selectAll('.hoverline')
							.attr({x2: x(d.hole), y2: y(d.spread)})
							.attr('x1', function(i){ return i ? x(d.hole) : 0 })
							.attr('y1', function(i){ return i ? height : y(d.spread) })

					d3.selectAll('g.x').selectAll('text')
							.classed('hovered', function(i){ return i === d.hole })
					d3.selectAll('g.y').selectAll('text')
							.classed('hovered', function(i){ return i === d.spread })

					var aheadText = d.spread >= 0 ? ' led by ' + d.spread  : ' trailed by ' + -d.spread ;
					var hoveredText = [	
															'Going into hole ', d.hole + 1 + ',',
															'the first scorer', aheadText, 
															'point' + (Math.abs(d.spread) != 1 ? 's' : ''), '---',
															'in ', comma(d.count), 'of the selected matches', 
														].join(' ')
					d3.selectAll('.hoveredText')
							.data(hoveredText.split('---'))
							.text(f())

					var directionSum = d3.sum(directions, function(direction){ return d[direction]});
					var directionToStr = {'down': ' they lost ',
																'same': ' they halved ',
																'up'  :  'they won '}
					d3.selectAll('.hoverTextResults')
							.text(function(direction, i){
								var num = d[direction];
								return d3.format(".1%")(num/d.count) + ' of the time ' 
										+ directionToStr[direction] + 'hole ' + (d.hole + 1) })
							.style('opacity', directionSum ? 1 : 0)
										
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
				//Fix circle stroke flicker
				.styleTween('', function(){
					var selection = d3.select(this);
					return function(){
						selection.style('stroke-width', 2*Math.min(1, +selection.attr('r'))) } 
				})
				.each('end', function(){
					d3.select(this).style('stroke-width', 2*Math.min(1, +d3.select(this).attr('r')))
				})

		function delayFn(d){
			return (Math.abs(hole - d.hole) + Math.abs(spread - d.spread))*delayTime ;
		}

		var total = Math.max(1, results.up + results.same + results.down)
		winnerText.text(d3.format(".1%")(results.up/total)   + ' First Scorer Wins')
		loserText .text(d3.format(".1%")(results.down/total) + ' First Scorer Losses')
		tieText   .text(d3.format(".1%")(results.same/total))

		d3.select('.selectedText')
				.text(comma(results.up + results.same + results.down) + ' matches selected')
	}
	updateDOM(0, 0, 0, 0);
})