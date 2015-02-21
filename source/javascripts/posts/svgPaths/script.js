var margin = 15,
    width = 750 - margin*2,
    height = 500 - margin*2;

var colors = ['steelblue', 'red', 'green']
colors = colors.concat(colors).concat(colors)
colors = colors.concat(colors).concat(colors)


//move to
!(function(){
  var drag = d3.behavior.drag()
      .on('drag', function(d){
        d[0] = Math.round(Math.max(0, Math.min(width,  d3.event.x)))
        d[1] = Math.round(Math.max(0, Math.min(height, d3.event.y)))
        update()
      })
      .origin(function(d){ return {x: d[0], y: d[1]} })

  function update(){
    svg.selectAll('circle').translate(f())
    path.attr('d', ['M' + circlePos.join('L')].join(' '))

    text.html('')
    circlePos.forEach(function(d, i){
      text.append('span').text(i ? ' L ' : 'M ')
      text.append('span.cord').text(d).style('color', colors[i])
    })
  }

  var text = d3.select('#moveto').append('div.pathstr')

  var svg = d3.select('#moveto').append('svg')
      .attr({width: width + margin*2, height: height + margin*2})
    .append('g')
      .translate([margin, margin])
  svg.append('rect')
      .attr({width: width, height: height})
      .style('opacity', 0)
      .on('click', function(){
        circlePos.push(d3.mouse(this).map(Math.round))
        drawCircles()
        update()
      })


  var circlePos = [[100, 200], [400, 300], [123, 44]]
  function drawCircles(){
    svg.selectAll('circle')
        .data(circlePos).enter()
      .append('circle.draggable')
        .style('fill', function(d, i){ return colors[i] })
        .attr('r', margin)
        .call(drag)
  }

  var path = svg.append('path.editable')

  drawCircles()
  update()

})()





!(function(){
  var drag = d3.behavior.drag()
      .on('drag', function(d){
        d[0] = Math.round(Math.max(0, Math.min(width,  d3.event.x)))
        d[1] = Math.round(Math.max(0, Math.min(height, d3.event.y)))
        update()
      })
      .origin(function(d){ return {x: d[0], y: d[1]} })

  function update(){
    circles.translate(f())
    path.attr('d', ['M' + circlePos.join('L')].join(' '))

    text.html('')
    text.append('span').text('M ')
    text.append('span').text(circlePos[0]).style('color', colors[0])
    text.append('span').text(' L ')
    text.append('span').text(circlePos[1]).style('color', colors[1])
  }

  var text = d3.select('#bez1').append('div.pathstr')

  var svg = d3.select('#bez1').append('svg')
      .attr({width: width + margin*2, height: height + margin*2})
    .append('g')
      .translate([margin, margin])


  var circlePos = [[100, 200], [400, 300]]
  var circles = svg.selectAll('circle')
      .data(circlePos).enter()
    .append('circle.draggable')
      .style('fill', function(d, i){ return colors[i] })
      .attr('r', margin)
      .call(drag)

  var path = svg.append('path.editable')

  update()



})()