console.clear()
var ƒ = d3.f

var isbnToName = {
  B00H7WPC4S: 'History of Portugal', 
  B005WBGNZS: 'Straight Man'
}

d3.json('data.json', function(err, res){
  data = res
  data.forEach(function(d){
    d.date = d3.isoParse(d.modificationDate)
    d.pos = d.position.pos
    d.isbn = d.contentReference.asin
  })
  data = data.filter(d => d.date < new Date(2017, 2, 0))

  byBook = d3.nestBy(data, ƒ('isbn'))
  byBook.forEach(d => {
    d.last = _.last(d)
    d.title = isbnToName[d.key] || ''
    d.titleSpans = d3.wordwrap(d.title, 15)
  })

  var sel = d3.select('#kindle-slope').html('')
  var c = d3.conventions({parentSel: sel, width: 750, height: 150, margin: {left: 80*0}})

  c.x = d3.scaleTime()
    .domain(d3.extent(data, ƒ('date')))
    .range(c.x.range())

  c.y.domain([0, d3.max(data, ƒ('pos'))])

  c.yAxis.ticks(5)
  c.xAxis.scale(c.x).tickFormat(d3.timeFormat('%m/%d')).ticks(5)
  c.drawAxis()

   line = d3.line()
    .x(ƒ('date', c.x))
    .y(ƒ('pos', c.y))
    .curve(d3.curveStep)

  c.svg.appendMany(byBook, 'path')
    .at({
      d: line,
      fill: 'none', 
      stroke: '#000',
    })

  var lastSel = c.svg.appendMany(byBook, 'g')
    .filter(d => d.last.pos > 1000)
    .translate(d => [c.x(d.last.date), c.y(d.last.pos)])

  lastSel.append('circle')
    .at({r: 3, stroke: '#000', fill: '#fff', cy: -4})

  lastSel.append('text')
    .at({textAnchor: 'middle', y: d => d.titleSpans.length*-13})
    .tspans(ƒ('titleSpans'))
})





d3.csv('lookups.csv', function(err, res){
  words = res

  var wordHeight = 14

  words.forEach(function(d){
    d.actualWord = d.word_key.split(':')[1]
    d.word = d.actualWord.toLowerCase()

    d.before = d.usage.split(d.actualWord)[0]
    d.after  = d.usage.split(d.actualWord)[1]

    d.length = d.word.length*8.5
    d.bbox = [
      [-d.length/2,  -wordHeight/2],
      [ d.length/2,   wordHeight/2]
    ]
    
    d.date = new Date(+d.timestamp)
    d.hour = d.date.getHours()
  })


  var sel = d3.select('#kindle-vocab').html('')
  var c = d3.conventions({parentSel: sel, width: 750, height: 450, margin: {left: 80*0}})


  c.x = d3.scaleTime()
    .domain(d3.extent(words, ƒ('date')))
    .range(c.x.range())

  c.y.domain([24, 0])

  c.yAxis
    .tickValues(d3.range(0, 24, 4))
    .tickFormat(d => d3.format('02')(d) + ':00' )
  c.xAxis.scale(c.x).tickFormat(d3.timeFormat('%b %Y')).ticks(5)
  c.drawAxis()


  var collide = d3.bboxCollide(d => d.bbox)

  var simulation = d3.forceSimulation(words)
    .force('x', d3.forceX(d => c.x(d.date)))
    .force('y', d3.forceY(d => c.y(d.hour)))
    .force('collide', collide)
    .force('container', d3.forceContainer([[100, 0], [c.width, c.height]]))
    .stop()

  for (var i = 0; i < 30; i++) simulation.tick()

  var wordSel = c.svg.appendMany(words, 'g.vocab-word')
    .translate(d => [d.x, d.y])
    .call(d3.attachTooltip)
    .on('mouseover', function(d){
      d3.select(this).raise()

      sel.classed('word-selected', true)
    })
    .on('mouseout', function(){
      sel.classed('word-selected', false)
    })

  wordSel.append('rect')
    .at({
      x: d => -d.length/2,
      width: d=> d.length,
      y: -wordHeight/2 + .5,
      height: wordHeight - 0,
      stroke: '#fff'
    })

  var contextSel = wordSel.append('g.context')
  contextSel.append('text').text(ƒ('before'))
    .at({textAnchor: 'end', dy: '.33em', x: d => -d.length/2 - 3})
  contextSel.append('text').text(ƒ('after'))
    .at({textAnchor: 'start', dy: '.33em', x: d => d.length/2 + 3})


  wordSel.append('text').text(ƒ('word'))
    .at({textAnchor: 'middle', dy: '.33em', fill: '#fff'})


  d3.select('.hljs').st({overflowX: 'scroll'})
})



