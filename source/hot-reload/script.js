console.clear()

var initFn = `
function position(t){
  var π = Math.PI
  var θ = 45
  var v = 40

  var vx = Math.cos(θ*π/180)*v
  var vy = Math.sin(θ*π/180)*v

  var x = vx*t
  var y = vy*t - 9.8*t*t/2

  return {x, y, color: '#0f0', size: 3}
}

`.trim()


var editorSettings = [
  {
    target: [50, 20],
    text: 'Try tweaking the function so the particles hit the target. Click the reload button to run the code.'
  },
  {
    target: [70, 80],
    text: 'The page automatically reloads when after code changes.'
  },
  {
    target: [30, 80],
    text: 'Hot reloading updates the function in place.'
  },
]

var editorSel = d3.selectAll('.editor').data(editorSettings).html('').each(function(d, editorIndex){

  eval(initFn)
  var pWrapper = {fn: position}

  var sel = d3.select(this)
  var chartSel = sel.append('div.chart-container')

  var cm = d.cm = CodeMirror(sel.node(), {
    value: initFn,
    mode:  'javascript'
  })
  cm.setSize(sel.offSetwidth/2, 320)
  cm.on('change', cm => {
    eval(cm.getValue())
    pWrapper.tempFn = position

    if (editorIndex == 1){
      reload()
    } else if (editorIndex == 2){
      updateWrapper()
    }
  })

  function updateWrapper(){
    try {
      pWrapper.tempFn(.1)
      pWrapper.fn = pWrapper.tempFn
    } catch (e){ console.log(e) }
  }

  function reload(){
    sel.classed('reload', 1)

    setTimeout(() => {
      points = []
      updateWrapper()
      sel.classed('reload', 0)
    }, 400)
  }
  var c = d3.conventions({
    sel: chartSel,
    layers: 'scd',
    margin: {top: 0, bottom: 40, left: 40},
  })

  var {width, height, x, y} = c
  var [svg, ctx, overlay] = c.layers

  if (editorIndex == 0){
    overlay.append('div').text('⟳')
      .st({color: '#fff', fontSize: 20, cursor: 'pointer'})
      .translate([-c.margin.left/2, 10])
      .on('click', () => {
        reload()
        pWrapper.fn = position
      })
  }

  x.domain([0, 100])
  y.domain([0, 100])

  var targetR = 10
  var targetSel = c.svg.append('rect.target')  
    .at({
      x: x(d.target[0] + targetR/2), 
      width: x(targetR),
      y: y(d.target[1] + targetR/2),
      height: y(100 - targetR),
      fill: '#f0f'
    })

  var points = []
  d3.visibleTimer(t => {
    points.push({
      position: pWrapper.fn, 
      t: Math.random()/5, 
      dx: Math.random()*2 - 2/2,
      dy: Math.random()*2 - 2/2
    })
    ctx.clearRect(-c.margin.left, -c.margin.top, c.totalWidth, c.totalHeight)
    ctx.fillStyle = '#0f0'
    points.forEach(p =>{
      p.t += .03

      ctx.beginPath()
      var pos = p.position(p.t)
      var s = pos.size
      ctx.fillStyle = pos.color
      ctx.rect(x(pos.x + p.dx) - s/2, y(pos.y + p.dy) - s/2, s, s)
      ctx.fill()
    })

    points = points.slice(-1000)

    var isHit = points.some(p => {
      var pos = p.position(p.t)
      var xHit = Math.abs(d.target[0] - pos.x - p.dx) < targetR
      var yHit = Math.abs(d.target[1] - pos.y - p.dy) < targetR

      return xHit && yHit
    })


    targetSel.classed('hit', isHit)


  }, editorIndex, sel)



  sel.append('i').html(d.text)
})

