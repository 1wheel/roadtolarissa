console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')


var sel = d3.select('#graph').html('').append('div')
var c = d3.conventions({
  sel: sel.append('div'), 
  margin: {left: 0, right: 0, top: 0, bottom: 0},
  height: 500,
})
var r = 3
var data = d3.range(0, c.width, r*2).map(x => { return {x, y: Math.random()} })


c.x.domain(d3.extent(data, d => d.x))
c.y.domain(d3.extent(data, d => d.y))

data.forEach(d => {
  d.px = d3.clamp(r, c.x(d.x), c.width - r)
  d.py = d3.clamp(r, c.y(d.y), c.height - r)
})
var bisect = d3.bisector(d => d.px)

var lRect = c.svg.append('rect.overlay').at({height: c.height})
var rRect = c.svg.append('rect.overlay').at({height: c.height})
var mRect = c.svg.append('rect.overlay').at({height: c.height})

c.svg.append('path')
  .at({
    d: 'M' + data.map(d => [d.px, d.py]).join('L'),
    stroke: '#000',
    fill: 'none',
    strokeWidth: .2
  })

var circleSel = c.svg.appendMany('circle', data)
  .translate(d => [d.px, d.py])
  .at({
    fill: '#000',
    stroke: '#f5f5f5',
    r,
    strokeWidth: .5,
  })


var areaCircle = c.svg.append('circle')
  .at({r: 0, stroke: '#f0f', fill: 'none', strokeDasharray: '1 0'})

var overlayCircle = c.svg.appendMany('circle', [0, 0, 1])
  .at({stroke: d => d ? '#f0f' : '#ff0', strokeWidth: 1.5, r, fill: 'none'})

var lineSel = c.svg.appendMany('path', [0, 0, 1])
  .at({stroke: d => d ? '#f0f' : '#ff0', strokeWidth: 1})

c.svg.append('rect')
  .at({opacity: 0, width: c.width, height: c.height})
  .st({cursor: 'pointer'})
  .on('click', function(){
    var [px, py] = d3.mouse(this)
    animatePoint(px, py, true)
  })

var isFirst = true
animatePoint()
function animatePoint(px=Math.random()*c.width, py=Math.random()*c.height, isManual){

  var dur = isFirst ? 0 : 500

  areaCircle.transition('pos').duration(dur)
    .translate([px, py])

  steps = genSteps(px, py)
  if (!isManual && steps.length < 5) return animatePoint()
  _.last(steps).isLast = true
  steps[0].isFirst = true

  var minDist = steps[0].minDist
  steps.forEach(d => {
    if (d.minDist != minDist) d.minChanged = true
    minDist = d.minDist
  })

  var curStepIndex = 0
  var lp = data[steps[0].index]
  var rp = data[steps[0].index]
  if (!lp || !rp) return animatePoint()

  animateStep()

  function animateStep(){
    if (window.__timeoutPoint) window.__timeoutPoint.stop()
    if (window.__timeoutStep) window.__timeoutStep.stop()

    var curStep = steps[curStepIndex]
    if (!curStep){
      return window.__timeoutPoint = d3.timeout(animatePoint, 2000)
    }
    var delay2 = curStep.isFirst ? 0 : dur*1.5

    lp = data[curStep.index + (0 + curStep.i)*-1] || lp
    rp = data[curStep.index + (0 + curStep.i)*1] || rp

    areaCircle.transition().duration(dur).delay(delay2)
      .at({r: curStep.minDist})

    lRect.transition().duration(dur).delay(delay2)
      .at({width: Math.max(0, px - curStep.minDist)})

    var rWidth = Math.max(0, c.width - px - curStep.minDist)
    rRect.transition().duration(dur).delay(delay2)
      .at({width: rWidth, x: c.width - rWidth})

    var pad = curStep.isLast ? r*2 : r
    mRect.transition().duration(dur).delay(0)
      .at({width: rp.px - lp.px + pad*2 , x: lp.px - pad})

    lineSel.data([lp, rp, curStep.minPoint])
      .transition().duration(dur).delay((d, i) => i != 2 ? 0 : delay2)
      .at({d: d => ['M', px, py, 'L', d.px, d.py].join(' ')})
    
    overlayCircle.data([lp, rp, curStep.minPoint])
      .transition().duration(dur).delay((d, i) => i != 2 ? 0 : delay2)
      .translate(d => [d.px, d.py])
    
    curStepIndex++

    window.__timeoutStep = d3.timeout(animateStep, curStep.minChanged ? 1000 + delay2 : 1000)
  }

  isFirst = false
  dur = 500

}


function genSteps(px, py){
  var steps = []
  var index = bisect.left(data, px)
  var index = d3.scan(data, (a, b) => Math.abs(a.px - px) - Math.abs(b.px - px))

  var minPoint = null
  var minDist = Infinity
  var lxDist = 0
  var rxDist = 0
  var i = 0
  while (lxDist < minDist && rxDist < minDist){
    lxDist = checkPoint(data[index - i])
    rxDist = checkPoint(data[index + i])
    steps.push({index, i, minDist, minPoint, lxDist, rxDist})
    i++
  }

  function checkPoint(d){
    if (!d) return Infinity

    var dx = d.px - px
    var dy = d.py - py
    var dist = Math.sqrt(dx*dx + dy*dy)

    if (dist < minDist){
      minDist = dist
      minPoint = d
    }

    return Math.abs(px - d.px)
  }

  return steps
}


function timeThings(){
  // time delaunay
  var points = d3.range(1000000).map(() => [Math.random(), Math.random()])

  console.time('delaunay')
  var delaunay = d3.Delaunay.from(points)
  console.timeEnd('delaunay')
  var voronoi = delaunay.voronoi([0, 0, 1, 1])


  console.time('scan')
  var px = Math.random()
  var py = Math.random()
  var minPoint = d3.scan(points, d => {
    var dx = d[0] - px
    var dy = d[0] - py

    return dx*dx + dy*dy
  })
  console.timeEnd('scan')
}

// timeThings()























