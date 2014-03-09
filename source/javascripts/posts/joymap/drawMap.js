//helper functions
function f(str){ return function(obj){ return str ? obj[str] : obj }}
function indexF(d, i){ return i }
function compose(g, h){ return function(d, i){ return g(h(d, i)) }}

var x, y, color, line, years, segmentG, longStaggeredG

if (fullscreen){ d3.select('body').style('margin', '0px') }

d3.json('/javascripts/posts/joymap/formatedData.json', function(error, data){
	var currentIndex = 0

	draw()
	window.onresize = draw; 
	
	function draw(){
		d3.select('#joymap').selectAll('*').remove();

	  var threshhold = 20000;

	  var width  = fullscreen ? Math.max(400, window.innerWidth - 1): 750,
	      height = fullscreen ? Math.max(400, window.innerHeight - 30) : 570

	  var longs = data.years[5];
	  x = d3.scale.linear()
	      .domain([0, longs[0].length - 1])
	      .range([0, width])
	  y = d3.scale.linear()
	      .domain([0, longs.length])
	      .range([0, height])

	  popHeight = d3.scale.linear()
	      .domain([0, .2, d3.max(d3.merge(longs))])
	      .range([0, -1, -200])

	  var svg = d3.select('#joymap')
	    .append('svg')
	      .attr({width: width, height: height})

	  area = d3.svg.area()
	      .x(compose(x, indexF))
	      .y0(popHeight)
	      .y1(0)

	  line = d3.svg.line()
	      .x(compose(x, indexF))
	      .y(popHeight)

	  line = d3.svg.line.variable()
	      .x(compose(x, indexF))
	      .y(popHeight)
	      .w(function(d){ return d > threshhold ? .5*height/570 : 0 })


	  longStaggeredG = svg.selectAll('g')
	      .data(data.years[currentIndex]).enter()
	    .append('g')
	      .attr('transform', function(d, i){ return 'translate(0, ' + y(i) + ')' })

	  longStaggeredG
	    .append('path')
	      .classed('area', true)
	      .attr('d', area)
	      .attr('transform', function(d, i){ return 'translate(' + x(d.index) + ',0)' })
	      .style('fill', 'white ')

	  longStaggeredG
	    .append('path')
	      .classed('line', true)
	      .attr('d', line)
	      .attr('transform', function(d, i){ return 'translate(' + x(d.index) + ',0)' })
	      .style('fill', 'black')
	      .style('stroke-width', '.5px')
	      .style('stroke', 'black')
	      .style('stroke-opacity', function(d){ return .2 })


	  var miniHeight = 100,
	      miniWidth = 150
	      miniX = d3.scale.ordinal()
	        .rangeRoundBands([0, miniWidth], .1)
	        .domain(d3.range(data.years.length)),
	      miniY = d3.scale.linear()
	        .range([miniHeight, 0]) 

	  var tooltip = d3.select('html').append('div').attr('id', 'joymap-tooltip')
	  tooltip.append('div').attr('id', 'joymap-tooltip-title')

	  var miniSvg = tooltip.append('svg').attr({height: miniHeight, width: miniWidth});

	  miniSvg.selectAll('text')
	      .data(['90', '95', '00', '05', '10', '15']).enter()
	    .append('text')
	      .text(f())
	      .attr('x', function(d, i){ return miniX(i) + miniX.rangeBand()/2; })
	      .attr({'y': miniHeight - 5, 'text-anchor': 'middle'})

	  miniSvg.selectAll('rect')
	      .data(d3.range(6)).enter()
	    .append('rect')
	      .attr('x', compose(miniX, indexF))
	      .attr({y: 0, height: 10, width: miniX.rangeBand()})

	  var boxSize = 10
	  var highlightRect = svg.append('rect').attr({height: y(boxSize), width: x(boxSize), opacity: 0, fill: 'gold'})

	  svg.append('rect')
	      .attr({height: height, width: width, opacity: 0})
	      .on('mousemove', function(){
	        var pos = d3.mouse(this)
	        var indices = [x.invert(pos[0]), y.invert(Math.max(pos[1] - y(boxSize), 0))].map(Math.round)
	        var selectedData = data.years.map(function(year){
	          return d3.sum(year.slice(indices[1], boxSize + indices[1]).map(function(d){
	            return d3.sum(d.slice(indices[0], boxSize + indices[0])) }))  
	        })

	        highlightRect
	            .attr('opacity', .5)
	            .attr('x', x(indices[0]))
	            .attr('y', y(indices[1]))
	            .style('stroke-width', '5px')

	        tooltip.style({
	        	opacity: 1, 
	        	left: d3.event.pageX + (indices[0] < x.domain()[1]/2 ? x(boxSize) : -tooltip.node().clientWidth) + 'px', 
	        	top:  d3.event.pageY + (indices[1] < y.domain()[1]/2 ? 0 : - y(boxSize) - tooltip.node().clientHeight) + 'px'})

	        tooltip.select('div').text(d3.format(",.0f")(selectedData[currentIndex]))

	        tooltip.selectAll('text').style('font-weight', function(d, i){ return i == currentIndex ? 'bold' : 'normal' })

	        miniY.domain([0, d3.max(selectedData.concat(1))]);
	        tooltip.selectAll('rect').data(selectedData)
	            .attr('y', miniY)
	            .attr('height', function(d){ return miniHeight - miniY(d); })
	            .attr('fill', function(d, i){ return i == currentIndex ? 'rgba(50, 50, 50, .6)' : 'rgba(100, 100, 100, .5)' })
	      })
	      .on('mouseout', function(){
	        highlightRect.attr('opacity', 0)
	        tooltip.style('opacity', 0)
	      })



	  d3.select('#joymap').append('div').style('width', width + 'px').selectAll('span')
	      .data([1990, 1995, 2000, 2005, 2010, 2015]).enter()
	    .append('div')
	      .classed('yearDiv', true)
	      .style({'display': 'inline-block', 'width': 100/6 + '%', 'text-align': 'center', 'cursor': 'pointer'})
	      .text(f())
	      .style('font-weight', function(d, i){ return i ? 'normal' : 'bold' })
	      .on('click', function(d, i){
	        transition(i)
	        d3.select('#joymap').selectAll('.yearDiv').style('font-weight', 'normal')
	        d3.select(this).style('font-weight', 'bold')
	      })
	      .on('mouseover', function(){ d3.select(this).style('text-decoration', 'underline') })
	      .on('mouseout',  function(){ d3.select(this).style('text-decoration', '') })

		function transition(index){
			var movingUp = index > currentIndex;
		  currentIndex = index;
		  longStaggeredG.data(data.years[index]).each(function(longData, longitudeNum){
		  	var delay = 20*(movingUp ? data.years[0].length - longitudeNum : longitudeNum) - 300;
		    d3.select(this).select('.area')
		    		.datum(longData)
		    	.transition().duration(600).delay(delay)
		    		.attr('d', area)	

		    d3.select(this).select('.line')
		    		.datum(longData)
		    	.transition().duration(600).delay(delay)
		    		.attr('d', line)	
		    		.each('start', function(){ d3.select(this).style('fill', movingUp ? '#006600' : 'steelblue') })
		    		.style('fill', 'black')
		  })
		}

		if (fullscreen){
			d3.select('#joymap').append('link')
					.style({position: 'absolute', left: 0, top: 0, 'font-size': '8pt', display: 'block', cursor: 'pointer'})
					.text('About')
					.attr('href', 'http://0.0.0.0:8000/population-division/')
					.on('click', function(){ window.location = '/population-division/' })
		}
	}
});

