var periodToMin = [48,36,24,12,0,-5,-10]
var indexToGame = [
	{team: 'Pelicans', 	date: '10/27'},
	{team: 'Rockets', 	date: '10/30'},
	{team: 'Pelicans', 	date: '10/31'},
	{team: 'Grizzlies', date: '11/02'},
	{team: 'Clippers', 	date: '11/04'},
	{team: 'Nuggets', 	date: '11/06'},
	{team: 'Kings', 		date: '11/07'},
	{team: 'Pistons', 	date: '11/09'},
	{team: 'Grizzlies', date: '11/11'},
	{team: 'Wolves', 		date: '11/12'},
	{team: 'Nets', 			date: '11/14'},
	{team: 'Raptors', 	date: '11/17'},
	{team: 'Clippers', 	date: '11/19'},
	{team: 'Bulls', 		date: '11/20'},
	{team: 'Nuggets', 	date: '11/22'},
	{team: 'Lakers', 	  date: '11/24'},
]


d3.json('/javascripts/posts/gsw-streak/games.json', function(res){
	games = res

	games.forEach(function(game){
		game.id = game.playByPlay[0].gameId

		game.scores = game.playByPlay.filter(ƒ('score'))
		game.scores.forEach(function(d){
			d.hP = +d.score.split('-')[0]
			d.aP = +d.score.split('-')[1]
			d.diff = d.hP - d.aP
			d.min = periodToMin[d.period] 
							+ +d.pctimestring.split(':')[0] 
							+ +d.pctimestring.split(':')[1]/60
			d.negMin = -d.min
			d.info = d.visitordescription
			game.isVisit = true
		})

		game.lastScore = _.last(game.scores)
		if (game.lastScore.diff < 0) game.scores.forEach(function(d){
			d.diff = -d.diff 
			d.info = d.homedescription
			game.isVisit = false
		})

		game.curry3s = game.scores.filter(function(d){
			return d.info && d.info.slice(0, 5) == 'Curry' && _.contains(d.info, '3PT')
		})

		game.scores.splice(0,0,{diff: 0, min: 48})

		//ug bisect is weird
		game.negMin = game.scores.map(function(d){ return -d.min })

		game.isOT = game.lastScore.period > 4
		game.finalScore = game.lastScore.score.replace(' ', '').replace(' ', '')
		if (game.isVisit) game.finalScore = game.finalScore.split('-').reverse().join('-')
		game.diffExtent = d3.extent(game.scores, ƒ('diff'))
	})
	games = _.sortBy(games, 'id')
	games.forEach(function(d, i){
		d.team = indexToGame[i].team
		d.date = indexToGame[i].date
	})

	diffExtent = d3.extent(_.flatten(games.map(ƒ('diffExtent'))))

	gameSel = d3.select('#graph').dataAppend(games, 'div.game')
	gameSel.append('div.date').text(ƒ('date'))
	gameSel.append('div.team').text(function(d){ return (d.isVisit ? '@' : '') + d.team})
	gameSel.append('div.score').text(ƒ('finalScore'))

	gameSel.each(function(d, i){
		var c = d3.conventions({
			parentSel: d3.select(this),
			height: 150, width: 195, 
			margin: {left: 25, top: 10, bottom: 10, right: 25}})

		c.x.domain([48, 0])
		c.y.domain(diffExtent)
		c.y.domain([-20, 30])
		c.yAxis.tickValues([-15, 0, 15, 30])
		c.xAxis.tickValues(true ? [48, 36, 24, 12, 0] : [36, 24, 12, 0])

		c.drawAxis()

		c.svg.selectAll('.x line').attr('y1', -c.height)

		c.svg.append('path.zero').attr('d', ['M', [0, c.y(0)], 'h', c.width].join(''))

		c.svg.append('clipPath').attr('id', 'clip' + d.id)
				.append('rect').attr({y: c.y(0), width: c.width, height: c.height})

		var line = d3.svg.line().x(ƒ('min', c.x)).y(ƒ('diff', c.y)).interpolate('step')
		var area = d3.svg.area().x(ƒ('min', c.x)).y0(ƒ('diff', c.y)).y1(c.y(0)).interpolate('step')

		c.svg.append('path.score-line').attr('d', line(d.scores))
		c.svg.append('path.area').attr('d', area(d.scores))
				.attr('clip-path', 'url(#clip' + d.id + ')')

		c.svg.dataAppend(d.curry3s, 'circle')
				.attr({cx: ƒ('min', c.x), cy: ƒ('diff', c.y)})
				.attr('cy', c.y(0))
				.attr({fill: 'none', stroke: 'black', r: 3, 'stroke-width': 1})
				.style('opacity', 1)

		d.hover = c.svg.append('g')//.style('opacity', .9)
		d.xLine = d.hover.append('path.hover')
		d.yLine = d.hover.append('path.hover')
		d.xText = d.hover.append('text.hover').attr('y', c.height + 9).attr('dy', '.71em').attr('text-anchor', 'middle')
		d.yText = d.hover.append('text.hover').attr('x', -9)          .attr('dy', '.32em').attr('text-anchor', 'end')
		d.c = c

		c.svg.append('rect')
				.attr({x: 0, y: -30, width: c.x(d.lastScore.min), height: c.height + 30*2})
				.style('opacity', 0)

		c.svg
				.on('mousemove', function(){ hover(c.x.invert(d3.mouse(this)[0] ))})
				.on('mouseout', hoverHide)

		if (i) return
		var x1 = c.x(30)
		var y1 = c.y(-8)
		c.svg.append('text').text('Curry 3s').translate([x1, y1])
				.attr({'text-anchor': 'middle', dy: '.66em', fill: '#888'})

		c.svg.dataAppend(d.curry3s, 'path.anno')
				.style('stroke', '#888')
				.attr('d', function(d){
					var x0 = c.x(d.min)
					var y0 = c.y(0)
					return ['M',
						x0*.9 + x1*.1, 
						y0*.8 + y1*.2, 'L',
						x0*.3 + x1*.7, 
						y0*.1 + y1*.9, 
					].join(' ')
				})
	})


	function hover(actualTime){
		d3.selectAll('.hover').style('opacity', 1)

		games.forEach(function(d){
			var time = d.isOT ? actualTime : Math.max(0, actualTime)

			var sec = padTime(time % 1 * 60)
			d.xText.text(padTime(time) + ':' + sec).attr('x', d.c.x(time))

			var i = clamp(0, d3.bisectLeft(d.negMin, -time), d.scores.length - 1)
			var diff = d.scores[i].diff
			d.yText.text(diff).attr('y', d.c.y(diff))

			d.xLine.attr('d', ['M', d.c.x(time), d.c.height + 4, 'L', d.c.x(time), d.c.y(diff)].join(' '))
			d.yLine.attr('d', ['M', -3, d.c.y(diff), 'L', d.c.x(time), d.c.y(diff)].join(' '))

			d.hover.classed('neg', diff < 0)
		})
	}

	function hoverHide(){
		d3.selectAll('.hover').style('opacity', 0)
	}

	function padTime(d){ return d3.format('02d')(Math.floor(Math.abs(d)) )}


	d3.select(self.frameElement).style("height", d3.select('svg').attr('height') + "px");
})

function clamp(a, b, c){ return Math.max(a, Math.min(b, c)) }
