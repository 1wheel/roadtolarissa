/*
to update arrows:
  1. set isDraggable = true
  2. tweaks arrows by dragging them
  3. run this in the dev tools: 
     copy('window.annotations = ' + JSON.stringify(window.annotations, null, 2) + '\n\nwindow.init?.()')
  4. paste in the init file
*/


window.initSwoopy = function(annotations, c){
  // d3.selectAll('.annotation-container').remove()

  annotations.forEach(d => {
    var isDraggable = !!annotations.isDraggable || 0

    var sel = d3.select(d.parent)
      .append('div.annotation-container')
      .classed('is-draggable', isDraggable)
      .html('')
      .st(d.st)
      .translate([c.x(d.year), c.y(d.seconds)])

    if (d.class) d.class.split(' ').forEach(str => sel.classed(str, 1))

    if (d.minWidth && d.minWidth > window.innerWidth){
      sel.st({display: 'none'})
    }
    
    var htmlSel = sel.append('div').html(d.html).translate(d.textOffset)
    console.log(d.html, htmlSel.node())

    var swoopy = d3.swoopyDrag()
      .x(d => 0).y(d => 0)
      .draggable(isDraggable)
      .annotations([d])

    sel.append('svg').at({width: 1, height: 1}).call(swoopy)

    if (isDraggable){
      sel.select('svg').append('circle').at({r: 4, fill: '#f0f'})
    }

    console.log(sel.node())
  })


  d3.select('body').selectAppend('svg.arrow-svg').html('')
      .st({height: 0})
    .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '-10 -10 20 20')
      .attr('markerWidth', 20)
      .attr('markerHeight', 20)
      .attr('orient', 'auto')
    .append('path')
      .attr('d', 'M-10,-10 L 0,0 L -10,10')
      .st({stroke: '#000', fill: 'none', })

  d3.selectAll('.annotation-container path')
    .at({
      markerEnd: 'url(#arrow)',
      strokeWidth: .5,
      opacity: d => d.path == 'M 0 0' ? 0 : '',
    })
}

window.init?.()
