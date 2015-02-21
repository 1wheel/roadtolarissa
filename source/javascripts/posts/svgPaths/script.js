var margin = 10,
    width = 750 - margin*2,
    height = 500 - margin*2;

var colors = ['steelblue', 'red', 'green', 'purple', 'orange', 'gold']
colors = colors.concat(colors.map(function(d){ return d3.rgb(d).brighter(1) }))
colors = colors.concat(colors.map(function(d){ return d3.rgb(d).darker(1) }))
colors = colors.concat(colors.map(function(d){ return d3.rgb(d).darker(.01) }))
colors = colors.concat(colors.map(function(d){ return d3.rgb(d).brighter(.01) }))


//move to
!(function(){
  var drag = dragConstructor(update)

  function update(){
    svg.selectAll('circle').translate(f())
    path.attr('d', ['M' + circlePos.join('L')].join(' '))

    text.html('')
    circlePos.forEach(function(d, i){
      text.append('span').text(i ? ' L ' : 'M ')
      text.append('span.cord').datum(d).call(fmtLabel)
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
        var usedColors = circlePos.map(f('color'))
        var color = colors.filter(function(d){ return !_.contains(usedColors, d) })[0] 

        var point = d3.mouse(this).map(Math.round)
        point.color = color

        circlePos.push(point)
        drawCircles()
        update()
      })


  var circlePos = [[100, 200], [400, 300], [123, 44]]
  circlePos.forEach(function(d, i){ d.color = colors[i] })

  function drawCircles(){
    var circles = svg.selectAll('circle')
        .data(circlePos, f('color'))

    circles.enter()
      .append('circle.draggable')
        .style('fill', f('color'))
        .style('stroke', f('color'))
        .call(drag)
        .on('mouseover', highlight)
        .on('dblclick', function(d){
          if (circlePos.length == 1) return
          circlePos = circlePos.filter(function(e){ return d != e })

          drawCircles()
          update()
        })
          .attr('r', 0)
        .transition()
          .attr('r', margin)

    circles.exit()
      .transition()
        .attr('r', 0)
        .remove(0)
  }

  var path = svg.append('path.editable')

  drawCircles()
  update()

})()





!(function(){
  var drag = dragConstructor(update)

  var text = d3.select('#bez').append('div.pathstr')

  var svg = d3.select('#bez').append('svg')
      .attr({width: width + margin*2, height: height + margin*2})
    .append('g')
      .translate([margin, margin])
  svg.append('rect')
      .attr({width: width, height: height})
      .style('opacity', 0)
      .on('click', function(){ addPoint(d3.mouse(this)) })


  var ctrlG = svg.append('g')
  var path = svg.append('path.editable')

  var circlePos = []
  addPoint([100, 200], [400, 300])
  addPoint([123, 44], [10, 44])
  


  drawCircles()
  update()

  function addPoint(pos1, pos2){
        var usedColors = circlePos.map(f('color'))
        var color = colors.filter(function(d){ return !_.contains(usedColors, d) })[0] 

        var ctrl = pos2 ? pos2 : pos1.map(function(d){ return Math.round(d*.8) })
        ctrl.isCtrl = true
        ctrl.color = color
        circlePos.push(ctrl)

        var point = pos1.map(Math.round)
        point.isCtrl = false
        point.color = color
        circlePos.push(point)

        if (circlePos.length < 6) return
        drawCircles()
        update()
  }

  function drawCircles(){
    var circle = svg.selectAll('circle')
        .data(circlePos, function(d){ return d.color + d.isCtrl })

    circle.enter()
      .append('circle.draggable')
        .classed('ctrl', f('isCtrl'))
        .style('fill',   f('color'))
        .style('stroke', f('color'))
        .call(drag)
        .on('dblclick', function(d){
          if (circlePos.length == 4) return

          var i = Math.floor(_.indexOf(circlePos, d)/2)
          circlePos.splice(i*2, 2)
          drawCircles()
          update()
        })
        .on('mouseover', highlight)   
        .attr('r', 0)
      .transition()
        .attr('r', margin)

    circle.exit()
      .transition()
        .attr('r', 0)
        .remove()
  }

  function update(){
    svg.selectAll('circle').translate(f())

    ctrlG.selectAll('.ctrl-connect').remove()
    ctrlG.selectAll('.ctrl-connect')
        .data(circlePos.filter(function(d, i){ return i%2 })).enter()
      .append('path.ctrl-connect')
        .attr('d', function(d, i){ return ['M', d, 'L', circlePos[i*2]].join('') })
        .style('stroke', f('color'))



    var sIndexes = d3.range(2, circlePos.length/2)
    path.attr('d',  [ 'M', circlePos[0], 
                      'C', circlePos.slice(1, 4).join(' '),
                      sIndexes.map(function(i){
                        console.log(i)
                        return ['S', circlePos[2*i], circlePos[2*i + 1]].join(' ')
                      })
                    ].join(' '))

    //not the best way of rendering template..
    text.html('')
    text.append('span').text('M ')
    text.append('span.cord').datum(circlePos[0]).call(fmtLabel)
    text.append('span').text(' C ')
    text.append('span.ctrl').datum(circlePos[1]).call(fmtLabel)
    text.append('span.ctrl').datum(circlePos[2]).call(fmtLabel)
    text.append('span.cord').datum(circlePos[3]).call(fmtLabel)

    sIndexes.forEach(function(i){
      text.append('span').text(' S ')
      text.append('span.ctrl').datum(circlePos[2*i])      .call(fmtLabel)
      text.append('span.cord').datum(circlePos[2*i + 1])  .call(fmtLabel)
    })
  }


})()













function dragConstructor(updateFn){
  return d3.behavior.drag()
        .on('drag', function(d){
          d[0] = Math.round(Math.max(0, Math.min(width,  d3.event.x)))
          d[1] = Math.round(Math.max(0, Math.min(height, d3.event.y)))
          updateFn()
        })
        .origin(function(d){ return {x: d[0], y: d[1]} })
      } 

function fmtLabel(sel){
  sel
      .text(f())
      .style('color', f('color'))
      .on('mouseover', highlight)
      .classed('highlight', function(d){ return d == curHighlight })
}


var curHighlight = null
function highlight(d){
  curHighlight = d
  d3.selectAll('.cord, .ctrl') .classed('highlight', function(e){ return d == e })
  d3.selectAll('circle')       .classed('highlight', function(e){ return d == e })
}