console.clear()

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
  .html(d => d ? 'Right <i>→</i>' : '<i>←</i> Left')


function update(actual){
  if (d3.event) d3.event.preventDefault()

  buttonSel
    .filter(d => d == actual)
    .transition().duration(0)
    .st({background: '#f0f'})
    .transition().duration(200)
    .st({background: '#fff'})

  var guess = makeGuess()

  var cur5 = sequence.slice(-4).map(d => d.actual).join('') + actual 
  d3.range(6).forEach(i => ngrams[cur5.substr(0, i)]++)

  sequence.push({actual, guess})
  
  updateLog()
  drawTree()
}

function makeGuess(){
  var prev4 = sequence.slice(-4).map(d => d.actual).join('')
  var fCount = +ngrams[prev4 + '0']
  var tCount = +ngrams[prev4 + '1']

  return +(fCount < tCount)
}


var logSel = d3.select('.log-entries div').html('')
var scoreSel = d3.select('.score')

function updateLog(){
  var colSel = logSel.insert('div.log-col', ':first-child')

  var d = _.last(sequence)
  colSel.append('div.guess')
    .classed('is-left', d.guess)
    .append('span')
    .st({position: 'relative', top: 2, left: -4})
    .text(toLR(d.guess))

  colSel.append('div')
    .classed('is-left', d.actual)
    .append('span')
    .st({position: 'relative', top: 2, left: -4})
    .text(toLR(d.actual))


  var percent = d3.mean(sequence.slice(-100), d => d.actual == d.guess)
  scoreSel.text(d3.format('.0%')(percent))
  if (percent < 1) scoreSel.st({opacity: 1})

  if (sequence.length == 15){
    d3.selectAll('.flashing')
      .classed('flashing', 0)
      .transition()
      .st({background: 'rgba(255, 0, 255, 0)'})
  }
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
var str2node = _.keyBy(nodes, d => d.str)


var treeSel = d3.select('.tree').html('')
  .append('svg').at({width, height, opacity: 0})

var treePathSel = treeSel.append('g').appendMany('path', nodes)
  .at({d: d => ['M', d.x, d.y, 'L', d.parent.x, d.parent.y].join(' ')})
  .st({stroke: '#000'})
  .call(ttFn)

var treeCircleSel = treeSel.append('g').appendMany('circle', nodes)
  .translate(d => [d.x, d.y])
  .at({r: 4, stroke: '#000', fill: '#fff'})
treeCircleSel.filter(d => d.level).call(ttFn)

var predictionSel = treeSel.append('g')
  .translate([0, height + 10])
  .st({opacity: 0})
predictionSel.append('text.arrow')
  .at({textAnchor: 'middle', y: 22, fontSize: 20})
predictionSel.append('text')
  .at({textAnchor: 'middle', y: 35, fontSize: 12}).text('Guess')
predictionSel.append('text')
  .at({textAnchor: 'middle', y: -14, fontSize: 12}).text(innerWidth < 700 ? '' : '?')


var actualSel = treeSel.appendMany('text.arrow', d3.range(5))
  .at({fill: '#f0f', dy: '.33em', textAnchor: 'middle'})


var ttSel = d3.select('body').selectAppend('div.tooltip.tooltip-hidden')
function ttFn(sel){
  sel
    .call(d3.attachTooltip)
    .on('mouseover', d => {
      ttSel
        .html('')
        .append('div.sequence-str')
        .text(d.str.replace(/1/g, '→').replace(/0/g, '←'))
        .parent()
        .append('div')
        .text(d.count + ' time' + (d.count == 1 ? '' : 's'))
    })
}



function drawTree(){
  nodes.forEach(d => {
    d.count = ngrams[d.str]
    d.active = false
  })

  var node4 = []
  var cur5 = sequence.slice(-5).map(d => d.actual).join('')
  d3.range(1, 5).reverse().forEach(i => {
    d3.range(i, 6).forEach(j =>{
      var node = str2node[cur5.slice(i, j)]
      node.active = i == 1 ? 1 : .5

      if (i == 1) node4.push(node)
    })
  })

  var rScale = d3.scaleSqrt().domain([0, 1, 100]).range([0, 1, 20])

  treeCircleSel
    .at({r: d => rScale(d.count)})
    .sort((a, b) => b.count - a.count)

  treePathSel
    // .transition().duration(200)
    .st({
      strokeWidth: d => Math.max(d.active, rScale(d.count)),
      stroke: d => d.active == 1 ? '#f0f' : d.active ? '#909' : '#000'
    })

  treeSel.st({opacity: 1})

  var cur4 = cur5.slice(1, 5)
  if (cur4.length != 4) return

  var node = str2node[cur4]
  
  predictionSel
    .st({opacity: 1})
    .transition().duration(100)
    .translate([node.x, height])

  predictionSel.select('text').text(toLR(makeGuess()))


  var node4 = node4
    .filter(d => d.level)
    .map(d => ({n: d.parent, text: toLR(_.last(d.str))}))

  actualSel.data(node4)
    .text(d => d.text)
    .translate(d => [d.n.x, d.n.y])
    .at({
      dy: d => d.n.count < 10 ? '1.6em' : '.33em',
      dy: 43,
      y: d =>  d.text == '←' ? 0 : -1.2
    })


  d3.select('.keypress').text(cur4.split('').map(toLR).join(' '))
    .st({width: 80})
}





function toLR(d){ return +d ? '→' : '←' }



'1010101011111101010101010101010101011010101010101000110101011110101011101010101111001010100110011010101010000101010110011'
  .split('')
  // .forEach(d => update(+d))

'10101100101010'
  .split('')
  // .forEach(d => update(+d))



