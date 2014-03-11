//helper functions
function f(str){ return function(d){ return str ? d[str] : d }}
function indexF(d, i){ return i }
function compose(g, h){ return function(d, i){ return g(h(d, i)) }}

var fullscreen = fullscreen ? true : false
if (fullscreen){ d3.select('body').style('margin', '0px') }

d3.json('/javascripts/posts/joymap/formatedData.json', function(error, years){
  var currentIndex = 0      //currenlty selected year
  var threshhold = 20000    //light/dark line threshhold

  window.onresize = draw 
  draw()
  function draw(){
    //remove old map on redraw
    d3.select('#joymap').selectAll('*').remove()
    d3.select('#joymap-tooltip').remove()


    //set up scales and path generators
    //responsive if fullscreen, min size is 400x400
    var width  = fullscreen ? Math.max(400, window.innerWidth - 1): 750,
        height = fullscreen ? Math.max(400, window.innerHeight - 30) : 570

    var longitudes = years[5]
    var x = d3.scale.linear()
            .domain([0, longitudes[0].length - 1])
            .range([0, width]),
        y = d3.scale.linear()
            .domain([0, longitudes.length])
            .range([0, height]),
        //population -> line height
        populationToHeight = d3.scale.linear()
            .domain([0, 1, d3.max(d3.merge(longitudes))])
            .range([0, -1, -180*height/570]),
        //white triangles to cover up lines in the back
        area = d3.svg.area()
            .x(compose(x, indexF))
            .y0(populationToHeight)
            .y1(0),
        //varible width stroke
        //By Lars Kotthoff
        //https://github.com/mbostock/d3/pull/448
        line = d3.svg.line.variable()
            .x(compose(x, indexF))
            .y(populationToHeight)
            .w(function(d){ return d > threshhold ? .5*height/570 : 0 })


    //draw lines on main main map
    var svg = d3.select('#joymap')
      .append('svg')
        .attr({width: width, height: height})

    longitudeGroup = svg.selectAll('g')
        .data(years[currentIndex]).enter()
      .append('g')
        .attr('transform', function(d, i){ return 'translate(0, ' + y(i) + ')' })

    longitudeGroup
      .append('path')
        .classed('area', true)
        .attr('d', area)
        .attr('transform', function(d, i){ return 'translate(' + x(d.index) + ',0)' })
        .style('fill', 'white ')

    longitudeGroup
      .append('path')
        .classed('line', true)
        .attr('d', line)
        .attr('transform', function(d, i){ return 'translate(' + x(d.index) + ',0)' })
        .style({fill: 'black', 'stroke-width': '.5px', stroke: 'black', 'stroke-opacity': .1})


    //varibles and scales for toolTip bar chart
    var toolHeight = 100,
        toolWidth = 150
        toolX = d3.scale.ordinal()
            .rangeRoundBands([0, toolWidth], .1)
            .domain(d3.range(years.length)),
        toolY = d3.scale.linear()
            .range([toolHeight, 0]) 

    //add tooltip to the page - appended to body to avoid relative/absolute positioning issues
    var tooltip = d3.select('html').append('div').attr('id', 'joymap-tooltip')
    tooltip.append('div').attr('id', 'joymap-tooltip-title')

    var toolSVG = tooltip.append('svg').attr({height: toolHeight, width: toolWidth})

    toolSVG.selectAll('rect')
        .data(d3.range(6)).enter()
      .append('rect')
        .attr('x', compose(toolX, indexF))
        .attr({y: 0, height: 10, width: toolX.rangeBand()})

    toolSVG.selectAll('text')
        .data(['90', '95', '00', '05', '10', '15']).enter()
      .append('text')
        .text(f())
        .attr('x', function(d, i){ return toolX(i) + toolX.rangeBand()/2 })
        .attr({'y': toolHeight - 5, 'text-anchor': 'middle'})

    //yellow heightlight box
    var boxSize = 10
    var highlightRect = svg.append('rect').attr({height: y(boxSize), width: x(boxSize), opacity: 0, fill: 'gold'})


    //place rect over SVG to captures mouseover events
    svg.append('rect')
        .attr({height: height, width: width, opacity: 0})
        .on('mousemove', function(){
          var pos = d3.mouse(this)
          //[x, y] cord of moused over position
          var indices = [x.invert(pos[0]), y.invert(Math.max(pos[1] - y(boxSize), 0))].map(Math.round)
          //heightlighted area data, summed by year
          var selectedData = years.map(function(year){
            return d3.sum(year.slice(indices[1], boxSize + indices[1]).map(function(d){
              return d3.sum(d.slice(indices[0], boxSize + indices[0])) }))  
          })

          //position highlight rectange and tooltip
          highlightRect
              .attr({x: x(indices[0]), y: y(indices[1]), opacity: .5})
              .style('stroke-width', '5px')

          var tooltipNode = tooltip.node();
          tooltip.style({
            opacity: 1, 
            left: d3.event.pageX + (indices[0] < x.domain()[1]/2 ? 0 : - tooltipNode.clientWidth) + 'px', 
            top:  d3.event.pageY + (indices[1] < y.domain()[1]/2 ? 0 : - y(boxSize) - tooltipNode.clientHeight) + 'px'})

          //update tooltip title number
          tooltip.select('div').text(d3.format(",.0f")(selectedData[currentIndex]))

          //bold selected year
          tooltip.selectAll('text').style('font-weight', function(d, i){ return i == currentIndex ? 'bold' : 'normal' })

          //resize bars to match selected data
          //add 1 to domain so areas with no population have no bars
          toolY.domain([0, d3.max(selectedData.concat(1))])
          tooltip.selectAll('rect').data(selectedData)
              .attr('y', toolY)
              .attr('height', function(d){ return toolHeight - toolY(d) })
              .attr('fill', function(d, i){ return i == currentIndex ? 'rgba(50, 50, 50, .6)' : 'rgba(100, 100, 100, .5)' })
        })
        .on('mouseout', function(){
          highlightRect.attr('opacity', 0)
          tooltip.style('opacity', 0)
        })


    //add year buttons
    d3.select('#joymap').append('div').style('width', width + 'px').selectAll('span')
        .data([1990, 1995, 2000, 2005, 2010, 2015]).enter()
      .append('div')
          .classed('yearDiv', true)
          .style({'display': 'inline-block', 'width': 100/6 + '%', 'text-align': 'center', 'cursor': 'pointer'})
          .text(f())
          .style('font-weight', function(d, i){ return i == currentIndex ? 'bold' : 'normal' })
          .on('click', function(d, i){
            transitionYearIndex(i)
            d3.select('#joymap').selectAll('.yearDiv').style('font-weight', 'normal')
            d3.select(this).style('font-weight', 'bold')
          })
          .on('mouseover', function(){ d3.select(this).style('text-decoration', 'underline') })
          .on('mouseout',  function(){ d3.select(this).style('text-decoration', '') })

    function transitionYearIndex(index){
      //different color/direction when moving forward and backword in time
      var movingUp = index > currentIndex
      currentIndex = index
      longitudeGroup.data(years[index]).each(function(longData, longitudeNum){
        var delay = 20*(movingUp ? years[0].length - longitudeNum : longitudeNum) - 300
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

    //add about link
    if (fullscreen){
      d3.select('#joymap').append('div')
          .style({position: 'absolute', left: 0, top: 0, 'font-size': '10pt', cursor: 'pointer'})
          .text('About')
          .attr('href', 'http://0.0.0.0:8000/population-division/')
          .on('click', function(){ window.location = '/population-division/' })
    }
  }
})

