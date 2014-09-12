//Variables and helper functions shared by recursion.js and memorization.js

var height = 200,
    width = 750,
    margin = {left: 25, right: 0, top: 20, bottom: 20},
    topLevel = 6,
    duration = 1000

var levelToHeight = d3.scale.linear()
    .domain([topLevel, 0])
    .range([0, height])


function addYAxis(svg){
  var textG = svg.append('g')
  textG.selectAll('text')
      .data(d3.range(topLevel + 1)).enter()
    .append('text')
      .attr('x', -margin.left)
      .attr('y', levelToHeight)
      .text(function(d){ return 'F(' + d + ')' })
      .style('pointer-events', 'none')

  textG.append('rect')
      .attr({x: -margin.left, width: margin.left, height: height})
      .style('fill-opacity', 0)
      .on('mousemove', function(selectedNum){
        var pos = d3.mouse(this)
        var selectedNum = Math.round(levelToHeight.invert(pos[1]))
        svg.selectAll('circle')
            .attr('r', function(d){ return d.i === selectedNum ? 15 : 10 })
      })
      .on('mouseout', function(){ svg.selectAll('circle').attr('r', 10) })
}


function setTitleText(el, obj){
  //set title text
  var str = 'F(' + obj.i + ') = '
  if (obj.i <= 1){ str += '1' }
  else {
    str += obj.children.map(function(d){
      return 'F(' + d.i + ')' }).join(' + ')
    if (obj.children.some(f('solved'))){
      str += ' = ' + obj.children.map(function(d){
        return d.solved ? d.val : 'F(' + d.i + ')' }).join(' + ')
    }
    if (obj.solved){ str += ' = ' + obj.val }
  }
  var title = d3.select(el).selectAll('title').data([{}])
  title.enter().append('title')
  title.text(str)
}

function arc(a, b, flip) {
  var ac = a.slice()
  var bc = b.slice()

  ac[1] = (b[1]*2 + a[1])/3
  bc[0] = (a[0]*2 + b[0])/3

  return ['M', b, 'C', bc, ' ', ac, ' ', a].join('')  
}

function hidePath(selection){
  selection.each(function(){
    var pathLength = this.getTotalLength()
    selection
        .attr('stroke-dasharray', pathLength + ' ' + pathLength)
        .attr('stroke-dashoffset', pathLength)
  })
}


function updateParentState(obj){
  obj.parents.forEach(function(d){ d.circle.call(setCircleClass) })
}

function setCircleClass(selection){
  selection.attr('class', function(d){
    if (!d.childDrawn) return 'down'
    if (d.solved)      return d.unsolvedParents.length ? 'up' : 'done'
    
    return 'waiting'    
  })
}

function reset(svg){
  svg.selectAll('circle')
    .transition().duration(function(d){ return Math.sqrt(d.i + 1)*1000 }).ease('bounce')
      .attr('cy', height)
    .transition().ease('cubic').duration(500)
      .style('opacity', 0)
      .attr('r', 15)
      .remove()

  svg.selectAll('path')
    .transition().duration(1500)
      .style('opacity', 0)
      .remove()

  start()
}

//todo replace with css animation
// d3.timer(function(t){
//   d3.selectAll('circle')
//       .style('stroke-width', function(d){ return d.active ? Math.sin(t/200)*5 + 5 : 1 })
// })

