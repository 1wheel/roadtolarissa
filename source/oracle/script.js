console.clear()

var ttSel = d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var ngrams = {}
var sequence = []

d3.select(window).on('keydown', () => {
  if (d3.event.keyCode == 37) update(0)
  if (d3.event.keyCode == 39) update(1)
})

var buttonSel = d3.select('.button').html('')
  .appendMany('div', [0, 1])
  .on('click touchstart', update)
buttonSel.append('div')
  .text(d => d ? 'Right' : 'Left')


function update(actual){
  if (d3.event) d3.event.preventDefault()

  buttonSel
    .filter(d => d == actual)
    .transition().duration(0)
    .st({background: '#f0f'})
    .transition().duration(200)
    .st({background: '#fff'})

  var prev4 = sequence.slice(-4).map(d => d.actual).join('')
  var fCount = +ngrams[prev4 + '0']
  var tCount = +ngrams[prev4 + '1']

  guess = +(fCount < tCount)

  var cur5 = prev4 + actual 
  d3.range(6).forEach(i => ngrams[cur5.substr(0, i)]++)
  
  
  sequence.push({actual, guess, fCount, tCount})
  render()
}

var logSel = d3.select('.log').html('')
var scoreSel = d3.select('.score')

function render(){
  var colSel = logSel.insert('div.log-col', ':first-child')

  var d = _.last(sequence)
  colSel.append('div')
    .classed('is-left', d.actual)
    .text(toLR(d.actual))

  colSel.append('div.guess')
    .classed('is-left', d.guess)
    .text(toLR(d.guess))

  var recent = sequence.slice(-100)
  var percent = recent.filter(d => d.actual == d.guess).length/recent.length

  scoreSel.text(d3.format('.0%')(percent))

  drawTree()
}


var width = d3.select('body').node().offsetWidth
var height = 300
var nodes = []

var yScale = d3.scaleLinear().domain([0, 5]).range([0, height])

addNode(0, width, 0, {x: width/2, y: 0}, '')
function addNode(xMin, xMax, level, parent, str){
  var x = (xMin + xMax)/2
  var y = yScale(level)

  ngrams[str] = 0

  var node = {x, y, parent, level, str}

  if (level < 5){
    node.children = [
      addNode(xMin, x, level + 1, node, str + '0'),
      addNode(x, xMax, level + 1, node, str + '1')
    ]
  } else{
    node.children = []
  }

  nodes.push(node)
}


var treeSel = d3.select('.tree').html('')
  .append('svg').at({width, height, opacity: 0})

var treePathSel = treeSel.appendMany('path', nodes)
  .at({d: d => ['M', d.x, d.y, 'L', d.parent.x, d.parent.y].join(' ')})
  .st({stroke: '#000'})
  .call(ttFn)

var treeCircleSel = treeSel.appendMany('circle', nodes)
  .translate(d => [d.x, d.y])
  .at({r: 4, stroke: '#000', fill: '#fff'})
  .call(ttFn)

function ttFn(sel){
  sel
    .call(d3.attachTooltip)
    .on('mouseover', d => {
      ttSel
        .html('')
        .append('div.sequence-str')
        .text(d.str.replace(/1/g, 'R').replace(/0/g, 'L'))
        .parent()
        .append('div')
        .text(d.count + ' times')
    })
}

var str2node = _.keyBy(nodes, d => d.str)


function drawTree(){

  nodes.forEach(d => {
    d.count = ngrams[d.str]
    d.active = false
  })

  var cur5 = sequence.slice(-5).map(d => d.actual).join('')
  d3.range(1, 5).forEach(i => {
    d3.range(i, 6).forEach(j =>{
      // console.log(i, j, cur5.slice(i, j))
      str2node[cur5.slice(i, j)].active = true
    })
  })

  var rScale = d3.scaleSqrt().domain([0, 1, 100]).range([0, 1, 20])

  treeCircleSel.at({r: d => rScale(d.count)})

  treePathSel.st({
    strokeWidth: d => Math.max(d.active, rScale(d.count)/2),
    stroke: d => d.active ? '#f0f' : '#000'
  })

  treeSel.st({opacity: 1})
}





function toLR(d){ return +d ? '→' : '←' }


if (window.timer) window.timer.stop()
window.timer = d3.interval(() => {
  // update(Math.random() < .5 ? 1 : 0)
}, 100)


'1 0 1 0 1 0 1 0 1 1 1 1 1 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 1 0 1 0 1 0 1 0 1 0 1 0 1 0 0 0 1 1 0 1 0 1 0 1 1 1 1 0 1 0 1 0 1 1 1 0 1 0 1 0 1 0 1 1 1 1 0 0 1 0 1 0 1 0 0 1 1 0 0 1 1 0 1 0 1 0 1 0 1 0 0 0 0 1 0 1 0 1 0 1 1 0 0 1 1'
  .split(' ')
  // .forEach(d => update(+d))

