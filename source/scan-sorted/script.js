console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var data = d3.range(100).map(x => { return {x, y: Math.random()} })

var sel = d3.select('#graph').html('').append('div')
var c = d3.conventions({
  sel: sel.append('div'), 
  margin: {left: 0, right: 0, top: 0, bottom: 0},
  height: Math.min(innerWidth, 500),
})
var r = 3

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

var overlayCircle = c.svg.appendMany('circle', [1, 0, 0])
  .at({stroke: d => d ? '#f0f' : '#ff0', strokeWidth: 1.5, r, fill: 'none'})

var lineSel = c.svg.appendMany('path', [1, 0, 0])
  .at({stroke: d => d ? '#f0f' : '#ff0', strokeWidth: 1})

c.svg.append('rect')
  .at({opacity: 0, width: c.width, height: c.width})
  .st({cursor: 'pointer'})
  .on('click', function(){
    var [px, py] = d3.mouse(this)
    animatePoint(px, py)
  })

var isFirst = true
animatePoint()
function animatePoint(px=Math.random()*c.width, py=Math.random()*c.height){

  var dur = isFirst ? 0 : 500

  areaCircle.transition('pos').duration(dur)
    .translate([px, py])

  steps = genSteps(px, py)

  var curStepIndex = 0
  var lp = data[steps[0].index]
  var rp = data[steps[0].index]
  if (!lp || !rp) return animatePoint()

  if (window.timeout) window.timeout.stop()
  if (window.interval) window.interval.stop()
  window.interval = d3.interval(() => animateStep(), 1000)
  animateStep()

  function animateStep(){
    var curStep = steps[curStepIndex]
    if (!curStep){
      interval.stop()
      mRect.transition()
        .at({width: rp.px - lp.px + 40, x: lp.px - 20})

      return window.timeout = d3.timeout(animatePoint, 2000)
    }

    lp = data[curStep.index + (0 + curStep.i)*-1] || lp
    rp = data[curStep.index + (0 + curStep.i)*1] || rp

    areaCircle.transition().duration(dur)
      .at({r: curStep.minDist})

    lRect.transition().duration(dur)
      .at({width: Math.max(0, px - curStep.minDist)})

    var rWidth = Math.max(0, c.width - px - curStep.minDist)
    rRect.transition().duration(dur)
      .at({width: rWidth, x: c.width - rWidth})

    mRect.transition().duration(dur)
      .at({width: rp.px - lp.px + r*2 , x: lp.px - r})

    lineSel.data([curStep.minPoint, lp, rp]).transition().duration(dur)
      .at({d: d => ['M', px, py, 'L', d.px, d.py].join(' ')})
    
    overlayCircle.data([curStep.minPoint, lp, rp]).transition().duration(dur)
      .translate(d => [d.px, d.py])
    
    curStepIndex++
  }

  isFirst = false
  dur = 500

}


function genSteps(px, py){
  var steps = []
  var index = bisect.left(data, px)

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
