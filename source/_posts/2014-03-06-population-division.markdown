---
layout: post
title: "Population Division"
comments: true
categories: 
permalink: /population-division

---

<div id='joymap'>
</div>

</br>
*James Cheshire's [Population Lines](http://spatial.ly/2013/09/population-lines/) redone with d3*

Orignally, I wanted 

<script src="/javascripts/libs/d3.3.13.js" type="text/javascript"></script>

<script>
	//helper functions
	function f(str){ return function(obj){ return str ? obj[str] : obj }}
	function indexF(d, i){ return i }
	function compose(g, h){ return function(d, i){ return g(h(d, i)) }}

	var x, y, color, line, years, segmentG, longStaggeredG

	d3.json('/javascripts/posts/joymap/formatedData.json', function(error, data){
	  //segment longitude lines so high population and low populations can have different stroke widths
	  var threshhold = 20000;
	  years = data.years.map(function(year){ return year.map(function(longitude, longitudeNum){
	    var rv = []
	    var i = longitude.length - 2
	    var nextSegment = [longitude[i-1]]
	    while (i > 0){
	      i = i - 1
	      if (~data.breaks[longitudeNum].indexOf(i)){
	        nextSegment.push(longitude[i])
	        rv.push({points: nextSegment.reverse(), index: i})
	        nextSegment = []
	      }
	      nextSegment.push(longitude[i])
	    }
	    rv.push({points: nextSegment.reverse(), index: 0})
	    return rv
	  }) })

	  var width = 750,
	      height = 750

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

	  longStaggeredG = svg.selectAll('g')
	      .data(years[0]).enter()
	    .append('g')
	      .attr('transform', function(d, i){ return 'translate(0, ' + y(i) + ')' })

	  longStaggeredG.selectAll('.area')
	      .data(f()).enter()
	    .append('path')
	      .classed('area', true)
	      .attr('d', compose(area, f('points')))
	      .attr('transform', function(d, i){ return 'translate(' + x(d.index) + ',0)' })
	      .style('fill', 'white ')

	  longStaggeredG.selectAll('.line')
	      .data(f()).enter()
	    .append('path')
	      .classed('line', true)
	      .attr('d', compose(line, f('points')))
	      .attr('transform', function(d, i){ return 'translate(' + x(d.index) + ',0)' })
	      .style('fill', 'rgba(0,0,0,0) ')
	      .style('stroke-width', '1px')
	      .style('stroke', 'black')
	      .style('opacity', function(d){ return d.points[d.points.length - 1] > threshhold ? 1 : .2 })



	  var miniHeight = 100,
	      miniWidth = 150
	      miniX = d3.scale.ordinal()
	        .rangeRoundBands([0, miniWidth], .1)
	        .domain(d3.range(years.length)),
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

	        tooltip.style({opacity: 1, left: d3.event.pageX + x(boxSize) + 'px', top: d3.event.pageY + 'px'})

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
	});

	var currentIndex = 0
	function transition(index){
	  currentIndex = index;
	  longStaggeredG.data(years[index]).each(function(longData, longitudeNum){
	    d3.select(this).selectAll('.area').data(longData);
	    d3.select(this).selectAll('.line').data(longData)
	  })

	  d3.selectAll('.area').attr('d', compose(area, f('points')))
	  d3.selectAll('.line').attr('d', compose(line, f('points')))
	}
</script>


