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




//beizer
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







//arc
!(function(){
  var drag = dragConstructor(update)

  function update(){
    svg.selectAll('.draggable').translate(f())
    

    paths
        .attr('d', function(d){ 
          return ['M', circlePos[0], 'A', rx, ry, θ, d, circlePos[1]].join(' ') })
        .classed('editable', function(d){ return d == curFlag })

    text.html('')
    circlePos.forEach(function(d, i){
      text.append('span').text(i ? ' L ' : 'M ')
      text.append('span.cord').datum(d).call(fmtLabel)
    })

    //find the center of the ellipses 
    //http://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
    var c1 = circlePos[0]
    var c2 = circlePos[1]
    
    //compute transform
    var cosθ = Math.cos(θ)
    var sinθ = Math.cos(θ)
    
    var mx = (c1[0] - c2[0])/2 
    var my = (c1[1] - c2[1])/2 

    var x =  cosθ*mx + sinθ*my
    var y = -sinθ*mx + cosθ*my

    //center points of transformed ellipse
    var rx2 = Math.pow(rx, 2)
    var ry2 = Math.pow(ry, 2)
    var x2  = Math.pow(x, 2)
    var y2  = Math.pow(y, 2)

    var dist = Math.sqrt((rx2*ry2 - rx2*y2 - ry2*x2)/(rx2*y2 + ry2*x2))

    var cxT =  dist*rx*y/ry
    var cyT = -dist*ry*x/rx

    //revese translation
    var nx = (c1[0] + c2[0])/2 
    var ny = (c1[1] + c2[1])/2 

    var c1x =  cosθ*cxT + sinθ*cyT + nx
    var c1y = -sinθ*cxT + cosθ*cyT + ny

    var c2x = -cosθ*cxT - sinθ*cyT + nx
    var c2y =  sinθ*cxT - cosθ*cyT + ny

    centers.data([[c1x, c1y], [c2x, c2y]])
        .translate(f())
  }

  var text = d3.select('#arc').append('div.pathstr')

  var svg = d3.select('#arc').append('svg')
      .attr({width: width + margin*2, height: height + margin*2})
    .append('g')
      .translate([margin, margin])
  svg.append('rect')
      .attr({width: width, height: height})
      .style('opacity', 0)


  var circlePos = [[250, 100], [250,200]]
  circlePos.forEach(function(d, i){ d.color = colors[i] })

  var flagData = [[0, 0], [0, 1], [1, 1], [1, 0]]
  curFlag = flagData[0]
  var paths = svg.append('g').selectAll('path')
      .data([[0, 0], [0, 1], [1, 1], [1, 0]]).enter()
    .append('path.arc')

  var θ = 0,
      rx = 120,
      ry = 120


  var centers = svg.append('g')
    .selectAll('circle')
      .data([[0,0], [0,0]]).enter()
    .append('circle')
      .attr('r', 10)
      .translate(f())




  function drawCircles(){
    var circles = svg.selectAll('.draggable')
        .data(circlePos, f('color'))

    circles.enter()
      .append('circle.draggable')
        .style('fill', f('color'))
        .style('stroke', f('color'))
        .call(drag)
        .on('mouseover', highlight)
          .attr('r', 0)
        .transition()
          .attr('r', margin)

    circles.exit()
      .transition()
        .attr('r', 0)
        .remove(0)
  }


  drawCircles()
  update()
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