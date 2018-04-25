// console.clear()

var initFn = `
function position(t){
  var π = Math.PI
  var θ = 45
  var v = 40

  var vx = Math.cos(θ*π/180)*v
  var vy = Math.sin(θ*π/180)*v

  var x = vx*t
  var y = vy*t - 9.8*t*t/2

  return {x, y, color: '#0f0', size: 2}
}
`.trim()


var editorSettings = [
  {
    target: [80, 15],
    text: 'Try tweaking the function so the <i>particles</i> hit the target. Click the reload button to run the code.'
  },
  {
    target: [70, 80],
    text: 'The page automatically reloads after code changes.'
  },
  {
    target: [30, 80],
    text: 'Hot reloading updates the function in place.'
  },
]

var editorSel = d3.selectAll('.editor').data(editorSettings).html('').each(function(d, editorIndex){

  eval(initFn)
  var pWrapper = {fn: position, tempFn: position}

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
      pWrapper.fn = pWrapper.tempFn
      particleTextSel.st({background: pWrapper.tempFn(.1).color})
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

  d.target = [x(d.target[0]), y(d.target[1])]
  var targetR = 20
  var targetSel = c.svg.append('g.target')  
    .translate(d.target)
    .append('circle.base-target')
    .at({r: targetR, fill: '#fff'})
    .parent().append('circle')
    .at({r: targetR/4, fill: 'none', strokeWidth: targetR/5, stroke: '#000'})
    .parent().append('circle')
    .at({r: targetR/3*2, fill: 'none', strokeWidth: targetR/5, stroke: '#000'})
    .parent()

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

    points.forEach(p => {
      p.t += .03
      var pos = p.position(p.t)

      p.x = x(pos.x + p.dx)
      p.y = y(pos.y + p.dy)
      p.s = pos.size
      p.color = pos.color
    })

    points.forEach(({x, y, s, color}) =>{
      ctx.beginPath()
      ctx.fillStyle = color
      ctx.arc(x, y, s, 0, 2 * Math.PI)
      ctx.fill()
    })

    points = points.slice(-1000)

    var isHit = points.some(p => {
      var xHit = Math.abs(d.target[0] - p.x) < targetR
      var yHit = Math.abs(d.target[1] - p.y) < targetR

      var dx = d.target[0] - p.x
      var dy = d.target[1] - p.y
      var targetDist = p.s + targetR
      // var dist = dx*dx + dy*dy - (targetR*targetR + p.s*p.s)
      
      return dx*dx + dy*dy < targetDist*targetDist
    })
    targetSel.classed('hit', isHit)

  }, editorIndex, sel)



  sel.append('i').html(d.text)
})

var particleTextSel = d3.select('i > i')
  .st({background: '#0f0'})


var spotSel = d3.select('.spot').html('')
var spotImgSel = spotSel.appendMany('div', [0, 1])
  .st({
    width: 'calc(50% - 10px)', 
    display: 'inline-block', 
    overflow: 'hidden',
    marginRight: d => d ? 0 : 10*2,
  })
  .append('img')
  .st({width: '200%', position: 'relative'})
  .at({src: 'https://i.imgur.com/U2TtWrB.png'})

var isLeft = false
d3.visibleTimer(_.throttle(() => {
  isLeft = !isLeft

  spotImgSel.st({left: isLeft ? '' : '-100%'})
  spotImgSel.filter(d => d)
    .st({opacity: 0})
    .transition().duration(0).delay(400)
    .st({opacity: 1})
}, 3000), 'img', spotSel)














