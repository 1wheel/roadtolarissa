console.clear()
var ttSel = d3.select('body').selectAppend('div.tooltip.tooltip-hidden')


var states = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY"].map((str, stateIndex) => {
  return {str, stateIndex}
})
var nStates = states.length

var corScale = d3.scaleLinear().domain([-.75, .75])
var corColor = d => d3.interpolatePiYG(corScale(d))

var state = {
  pairStr: ''
}


window.globalSetPair = function(pair){
  matrix538.setPair(pair)
  matrixEco.setPair(pair)

  if (!window.scatterEco) return

  var extent = d3.extent(scatter538.calcExtent(pair).concat(scatterEco.calcExtent(pair)))
  extent = d3.scaleLinear().domain(extent).nice(5).domain()
  scatter538.drawPair(pair, extent)
  scatterEco.drawPair(pair, extent)

  corScatter.setPair(pair)
}

window.globalSetScenario = function(x, y){
  // map538.drawScenario(scenarioIndex)
  // mapEco.drawScenario(scenarioIndex)

  scatter538.drawScenario(x, y)
  scatterEco.drawScenario(x, y)
}

d3.loadData(
  'https://roadtolarissa.com/data/forecast-correlation/pairs-538.json', 
  'https://roadtolarissa.com/data/forecast-correlation/pairs-eco.json', 
  'https://roadtolarissa.com/data/forecast-correlation/states-10m.json', 
  'states.csv', 
  async (err, res) => {
  var totalWidth = 1200
  var colMarginLeft =  -(totalWidth - 750)/2 + 40
  d3.select('.graph').html(`<div class='col col-538'></div><div class='col col-eco'></div>`)

  d3.selectAll('.graph,.state-sm')
    .st({width: totalWidth, marginLeft: colMarginLeft})

  var [model538, modelEco] = ['538', 'eco'].map((str, i) => {
    var sel = d3.select('.col-' + str)
      .html(`<div class='matrix'></div><div class='scatter'></div><div class='map'></div>`)
    var pairs = res[i]
    var strLong = ['538', 'Economist'][i]
    var strShort = ['538', 'Econ'][i]

    pairs.forEach((d, i) => {
      d.canonicalStr = [d.strA, d.strB].sort().join(' ')
      d.pairIndex = i
    })

    var stateData = []
    var activeScenarioIndex = -1

    return {str, strLong, strShort, i, sel, pairs, stateData, activeScenarioIndex}
  })
  window.model538 = model538
  window.modelEco = modelEco

  var index2cluster = calcIndex2Cluster(model538, modelEco)
  window.matrix538 = initMatrix(model538, index2cluster)
  window.matrixEco = initMatrix(modelEco, index2cluster)

  window.corScatter = initCorScatter()

  


  if (!window.mapsEco){
    var url = 'https://roadtolarissa.com/data/forecast-correlation/maps-538.buf'
    window.maps538 = model538.maps = new Int16Array(await(await fetch(url)).arrayBuffer())

    var url = 'https://roadtolarissa.com/data/forecast-correlation/maps-eco.buf'
    window.mapsEco = modelEco.maps = new Int16Array(await(await fetch(url)).arrayBuffer())
  } else {
    model538.maps = window.maps538
    modelEco.maps = window.mapsEco
  }

  window.scatter538 = initScatter(model538)
  window.scatterEco = initScatter(modelEco)

  var [us, stateVotes] = res.slice(-2)
  stateVotes.forEach((d, i) => {
    d.i = i
  })

  window.map538 = initMap(model538, us, stateVotes)
  window.mapEco = initMap(modelEco, us, stateVotes)

  window.globalSetPair(model538.pairs[324])
  window.globalSetScenario(5000, 5000)

  initStateSm()
})

function initMatrix(model, index2cluster){
  var isLock = false
  var sel = model.sel.select('.matrix').on('mouseleave', d => isLock = false)

  var bs = 10
  var width = bs*nStates

  var c = d3.conventions({
    sel: sel.append('div'), 
    width: width,
    height: width,
    margin: {top: 70},
  })

  var rectSel = c.svg.appendMany('rect', model.pairs)
    .translate(d => [bs*index2cluster[d.indexA], bs*index2cluster[d.indexB]])
    .at({
      width: bs - 0,
      height: bs - 0,
      // fill: d => d.indexA == d.indexB ? '#fff' : d3.interpolatePiYG(corScale(d.cor))
      fill: d => corColor(d.cor),
      cursor: 'pointer',
    })
    .on('mouseover', d => {
      if (isLock) return
      globalSetPair(d)
    })
    .on('click', d => {
      globalSetPair(d)
      isLock = !isLock
    })

  var aTextSel = c.svg.appendMany('g', states)
    .translate(d => [index2cluster[d.stateIndex]*bs, -3])
    .append('text.abv')
    .text(d => d.str)
    .at({textAnchor: 'start', y: bs/2, dy: '.33em', transform: 'rotate(-90)'})

  var bTextSel = c.svg.appendMany('text.abv', states)
    .text(d => d.str)
    .translate(d => [-3, index2cluster[d.stateIndex]*bs])
    .at({textAnchor: 'end', y: bs/2, dy: '.33em'})

  var abvSel = d3.selectAll('.abv')

  function setPair(pair){
    rectSel
      .classed('active', 0)
      .filter(d => d.canonicalStr == pair.canonicalStr)
      .classed('active', 1)
      .raise()

    aTextSel.classed('active', d => d.str == pair.strA)
    bTextSel.classed('active', d => d.str == pair.strB)
  }


  c.svg.append('g.x.axis').translate(-70, 1)
  addAxisLabel(c, model.strLong + ' Correlations Between States')

  return {abvSel, rectSel, setPair}
}

function initScatter(model){
  var isLock = false
  var sel = model.sel.select('.scatter').on('mouseleave', d => isLock = false)

  var titleSel = sel.append('div.small-title')

  var c = d3.conventions({
    sel,
    layers: 'scs',
    width: 200,
    height: 200,
    margin: {bottom: 50, right: 20}
  })

  c.svg.append('rect')
    .at({width: c.width, height: c.height, fill: '#eee'})

  c.x.interpolate(d3.interpolateRound)
  c.y.interpolate(d3.interpolateRound)
  c.xAxis.tickFormat(d3.format('.0%')).ticks(5).tickSize(c.height)
  c.yAxis.tickFormat(d3.format('.0%')).ticks(5).tickSize(c.height)

  d3.drawAxis(c)
  var xAxisSel = c.svg.select('.x').translate(0, 0)
  var yAxisSel = c.svg.select('.y').translate(c.width, 0)
  
  addAxisLabel(c, ' ', ' ')
  xAxisSel.select('.label').translate(c.height, 1)
  yAxisSel.select('.label').at({y: -c.width + 10})

  c.svg.append('clipPath#line-clip')
    .append('rect').at({width: c.width, height: c.height})

  var lineSel = c.svg.append('path')
    .at({stroke: '#555', strokeWidth: 2, clipPath: 'url(#line-clip)', strokeDasharray: '2 2'})

  var ctx = c.layers[1]

  var svg2 = c.layers[2]
  svg2.append('rect')
    .at({width: c.width, height: c.height, fillOpacity: 0})
    .parent()
    .on('mousemove', function(){
      if (isLock) return
      var [x, y] = d3.mouse(this)
      globalSetScenario(c.x.invert(x), c.y.invert(y))
    })
    .on('click', function(){
      var [x, y] = d3.mouse(this)
      globalSetScenario(c.x.invert(x), c.y.invert(y))
      isLock = !isLock
    })
    .st({cursor: 'pointer'})

  var circleSel = svg2.append('circle')
    .at({stroke: 'orange', r: 3, fill: 'none', strokeWidth: 2 })

  var hPathSel = svg2.append('path').at({stroke: 'orange', strokeWidth: .5})
  var vPathSel = svg2.append('path').at({stroke: 'orange', strokeWidth: .5})

  var xData = d3.range(40000)
  var yData = d3.range(40000)

  function calcExtent(pair){
    xData = model.stateData[pair.indexA]
    if (!xData){
      xData = model.stateData[pair.indexA] = d3.range(40000).map(i => model.maps[i*states.length + pair.indexA]/10000)
    }

    yData = model.stateData[pair.indexB]
    if (!yData){
      yData = model.stateData[pair.indexB] = d3.range(40000).map(i => model.maps[i*states.length + pair.indexB]/10000)
    }

    return d3.extent(xData.concat(yData))
  }

  function drawPair({indexA, indexB}, extent){
    var pair = _.find(model.pairs, {indexA, indexB})

    titleSel.html(`
      ${model.strShort} ${pair.strA}-${pair.strB} correlation: 
      <span style='padding: 1px; border: 2px solid ${corColor(pair.cor)}'> ${d3.format('+.2f')(pair.cor)} </span>`)

    c.x.domain(extent)
    c.y.domain(extent)

    c.svg.select('.x').call(c.xAxis).selectAll('.tick').classed('bold', d => d == .5)
    c.svg.select('.y').call(c.yAxis).selectAll('.tick').classed('bold', d => d == .5)
    ctx.clearRect(-c.margin.left, -c.margin.right, c.totalWidth, c.totalWidth)
    
    xAxisSel.select('.label').text('Trump Vote Share in ' + pair.strA)
    yAxisSel.select('.label').text('Trump Vote Share in ' + pair.strB)

    ctx.fillStyle = 'rgba(0,0,0,.2)'
    xData.slice(0, 5000).forEach((_, i) => {
      ctx.beginPath()
      ctx.rect(c.x(xData[i]), c.y(yData[i]), 1, 1)
      ctx.fill()
    })

    var l = ss.linearRegressionLine(pair)
    var [x0, x1] = extent.map(d => d*10000)

    lineSel.at({d: `M ${c.x(x0/10000)} ${c.y(l(x0)/10000)} L ${c.x(x1/10000)} ${c.y(l(x1)/10000)}`})

    if (model.activeScenarioIndex > -1){
      drawScenario(null, null, model.activeScenarioIndex)
    }
  }

  function drawScenario(x, y, minI=-1){
    var skipMap = true
    if (minI > -1){
      x = xData[minI]
      y = yData[minI]
    } else {
      skipMap = false
      var minDist = Infinity
      xData.forEach((xVal, i) => {
        var dx = x - xVal
        var dy = y - yData[i]

        var dist = dx*dx + dy*dy

        if (dist < minDist){
          minDist = dist
          minI = i
        }
      })
    }



    circleSel.translate([c.x(xData[minI]), c.y(yData[minI])])
    hPathSel.at({d: 'M 0 ' + c.y(y) + ' H ' + c.x(x)})
    vPathSel.at({d: 'M ' + c.x(x) + ' ' + c.height + ' V ' + c.y(y)})

    model.activeScenarioIndex = minI

    if (!skipMap) model.map.drawScenario(minI)
  }

  return {drawPair, calcExtent, drawScenario}
}

function initMap(model, us, stateVotes){
  var width = 275

  var sel = model.sel.select('.map')
  var titleSel = sel.append('div.small-title')
    .text('')
  var c = d3.conventions({
    sel,
    layers: 's',
    width,
    height: width,
    margin: {bottom: 0, left: 0, right: 0}
  })

  us.land = us.land || topojson.feature(us, us.objects.nation)
  var path = d3.geoPath().projection(d3.geoAlbersUsa().fitSize([width, width], us.land))
  
  var stateSel = c.svg.appendMany('path.states', topojson.feature(us, us.objects.states).features)
    .at({d: path})
    .each(d => {
      d.state = _.find(stateVotes, {name: d.properties.name})
    })
    .filter(d => d.state)

  us.stateMesh = us.stateMesh || path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b }))
  c.svg.append('path.state-borders')
    .at({stroke: '#fff', strokeWidth: .4, fill: 'none', d: us.stateMesh})

  var dSel = c.svg.append('g.small-title').append('text').st({fill: '#648DCF'}).translate([60, 36])
  var rSel = c.svg.append('g.small-title').append('text').st({fill: '#BC5454'}).translate([170, 36])

  function drawScenario(scenarioIndex){
    var rVotes = 0
    stateSel.at({fill: d => {
      var isR = model.maps[scenarioIndex*states.length + d.state.i] > 5000
      if (isR) rVotes += +d.state.votes
      return isR ? '#BC5454' : '#648DCF'
    }})

    dSel.text('Biden ' + (538 - rVotes))
    rSel.text('Trump ' + rVotes)
  }

  var rv = {drawScenario}
  model.map = rv
  return rv
}


function initCorScatter(){
  var sel = d3.select('.cor-scatter').html('').st({margin: '0px auto'})

  var c = d3.conventions({
    sel: sel,
    width: 500,
    height: 500,
    margin: {bottom: 50, right: 20, top: 50}
  })

  c.svg.append('g.axis').append('text.small-title')
    .text('Pairwise Correlations Between States')
    .at({textAnchor: 'middle', x: c.width/2, y: -20})
    .st({fontSize: 14})


  c.x.domain([-.5, 1])
  c.y.domain([-.5, 1])

  c.svg.append('rect')
    .at({width: c.width, height: c.height, fill: '#eee'})

  c.x.interpolate(d3.interpolateRound)
  c.y.interpolate(d3.interpolateRound)
  c.xAxis.tickFormat(d3.format('.2f')).ticks(10).tickSize(c.height)
  c.yAxis.tickFormat(d3.format('.2f')).ticks(10).tickSize(c.height)

  d3.drawAxis(c)
  c.svg.selectAll('.tick').classed('bold', d => d == 0)


  var xAxisSel = c.svg.select('.x').translate(0, 0)
  var yAxisSel = c.svg.select('.y').translate(c.width, 0)
  
  addAxisLabel(c, 'Economist Correlation', '538 Correlation')
  xAxisSel.select('.label').translate(c.height, 1)
  yAxisSel.select('.label').at({y: -c.width + 10})

  modelEco.pairs.forEach((d, i) => {
    d.cor538 = model538.pairs[i].cor
  })

  var circleSel = c.svg.appendMany('circle', modelEco.pairs.filter(d => d.indexA < d.indexB))
    .translate((d, i) => [c.x(d.cor), c.y(d.cor538)])
    .at({r: 1.5, fillOpacity: 0, stroke: '#444', opacity: d => d.cor < .99 ? 1 : 0})
    .call(d3.attachTooltip)
    .on('mouseover', pair => {
      var i = pair.pairIndex

      var corEco = modelEco.pairs[i].cor
      var cor538 = model538.pairs[i].cor

      ttSel.html(`
        <b>${pair.strA}-${pair.strB}</b>
        <br>
        <span style='margin-right: 0px; padding: 1px; border: 2px solid ${corColor(corEco)}'> ${d3.format('+.2f')(corEco)}</span>
        Economist correlation
        <br>

        <span style='margin-right: 0px; padding: 1px; border: 2px solid ${corColor(cor538)}'> ${d3.format('+.2f')(cor538)}</span>
        538 correlation
      `)

      globalSetPair(pair)
    })

  var activeCircle = c.svg.append('circle')
    .at({r: 0, stroke: '#000', r: 5, strokeWidth: 2, pointerEvents: 'none', fill: 'none'})

  function setPair(pair){
    var i = pair.pairIndex
    activeCircle
      .translate([c.x(modelEco.pairs[i].cor), c.y(model538.pairs[i].cor)])
      .at({r: 0})

    circleSel
      .at({
        r: d => d.canonicalStr == pair.canonicalStr ? 3 : 1.5, 
      })
      .classed('active', d => d.canonicalStr == pair.canonicalStr)

  }

  return {setPair}
}

function initStateSm(){
  var sel = d3.select('.state-sm').html('')

  // copy(_.sortBy(modelEco.stateData.map((d, i) => ({i, v: d3.mean(d)})), d => d.v).map(d => d.i))
  var meanOrder = [7, 11, 46, 4, 19, 20, 34, 47, 39, 6, 8, 31, 37, 14, 32, 21, 5, 45, 23, 30, 22, 48, 33, 38, 9, 27, 3, 10, 12, 35, 43, 0, 40, 24, 26, 25, 16, 18, 15, 42, 29, 41, 1, 2, 44, 17, 28, 13, 36, 49, 50] 

  var stateSel = d3.select('.state-sm').html('')
    .appendMany('div.state', meanOrder.map(i => states[i]))
    .st({width: 230})
    .st({margin: 5, marginTop: 10, marginBottom: 10, fontSize: 14, height: 66})
  

  var drawQueue = []
  stateSel.each(addToDrawQueue)
  function addToDrawQueue(symptom, i){
    drawQueue.push(() => drawState(symptom, i, d3.select(this)))
  }

  function drawNext(){
    d3.range(1).forEach(() => {
      var fn = drawQueue.shift()
      if (fn) fn()     
    })

    if (drawQueue.length) window.drawNextTimeout = d3.timeout(drawNext, 50)
  }
  if (window.drawNextTimeout) window.drawNextTimeout.stop()
  d3.timeout(drawNext, 100)


  function drawState(state, i, sel){
    var c = d3.conventions({
      sel: sel.append('div'),
      height: 50,
      width: 200,
      layers: 'sc',
      margin: {top: 0, left: 10, right: 0, bottom: 10}
    })

    var stateIndex = state.stateIndex
    if (!model538.stateData[stateIndex]){
      model538.stateData[stateIndex] = d3.range(40000).map(i => model538.maps[i*states.length + stateIndex]/10000)
    }
    if (!modelEco.stateData[stateIndex]){
      modelEco.stateData[stateIndex] = d3.range(40000).map(i => modelEco.maps[i*states.length + stateIndex]/10000)
    }

    var nBuckets = 200

    var h538 = d3.range(nBuckets + 1).map(i => ({v: 0, i}))
    model538.stateData[state.stateIndex].forEach(d => {
      h538[Math.round(d*nBuckets)].v++
    })

    var hEco = d3.range(nBuckets + 1).map(i => ({v: 0, i}))
    modelEco.stateData[state.stateIndex].forEach(d => {
      hEco[Math.round(d*nBuckets)].v++
    })


    c.x.domain([0, nBuckets])
    c.y.domain([0, 4000])

    c.svg.append('rect')
      .at({width: c.width, height: c.height, fill: '#eee'})

    c.x.interpolate(d3.interpolateRound)
    c.y.interpolate(d3.interpolateRound)
    c.xAxis
      .tickFormat(d => {
        return d3.format('.0%')(d/nBuckets) + (d == 100 ? ' R' : '')
        return d3.format('.0%')(d/nBuckets) + ' R'

        d3.format('.0%')((.5 - d/nBuckets)*2) + (d/nBuckets < .5 ? ' D' : ' R')

      })
      .ticks(5)
      .tickSize(c.height)

    c.yAxis.tickFormat(d => (d/1000 + 'k').replace('0k', '')).ticks(2).tickSize(c.width)

    d3.drawAxis(c)
    c.svg.selectAll('.tick').classed('bold', d => d == 100)
    c.svg.selectAll('.tick text').at({fontWeight: 400})

    // c.svg.select('.x text').at({textAnchor: 'start', x: -10})

    c.svg.append('text.small-title').text(state.str)
      .translate([c.width - 20, 15])
      .st({fontWeight: 600})

    var xAxisSel = c.svg.select('.x').translate(0, 0)
    var yAxisSel = c.svg.select('.y').translate(c.width, 0)

    var line = d3.line()
      .x((d, i) => c.x(i))
      .y(d => c.y(d.v))
      .defined(d => d.v > 0)

    c.svg.append('path')
      .at({d: line(hEco), stroke: '#C2190F', fill: 'none'})

    c.svg.append('path')
      .at({d: line(h538), stroke: '#000', fill: 'none'})


    var ctx = c.layers[1]

    ctx.fillStyle = '#000'
    ctx.beginPath()
    h538.forEach(d => {
      if (d.v == 0) return
      if (d.v > 10) return
      ctx.fillRect(c.x(d.i), c.height, 1, 1)
    })
    ctx.fill()

    ctx.fillStyle = '#C2190F'
    ctx.beginPath()
    hEco.forEach(d => {
      if (d.v == 0) return
      if (d.v > 10) return
      ctx.fillRect(c.x(d.i), c.height, 1, 1)
    })
    ctx.fill()
  }

}


function calcIndex2Cluster(model538, modelEco){
  states.forEach(state => {
    state.position538 = []
    state.positionEco = []
  })

  model538.pairs.forEach(d => states[d.indexA].position538[d.indexB] = d.cor)
  modelEco.pairs.forEach(d => states[d.indexA].positionEco[d.indexB] = d.cor)

  states.forEach(d => d.position = d.position538.concat(d.positionEco))
  states.forEach(d => d.position = d.positionEco)
  states.forEach(d => d.position = d.position538)

  var index2cluster = []
  var clusteredStates = cluster = hcluster()
    .distance('angular') 
    .linkage('avg')        
    .data(states)
    .orderedNodes()
    .forEach((d, i) => {
      index2cluster[d.stateIndex] = i
    })

  return index2cluster
}


function addAxisLabel(c, xText, yText){
  if (xText){
    c.svg.select('.x').append('g')
      .translate([c.width/2, 35])
      .append('text.label')
      .text(xText)
      .at({textAnchor: 'middle'})
      .st({fill: '#000'})
  }

  if (yText){
    c.svg.select('.y')
      .append('g')
      .translate([-50, c.height/2])
      .append('text.label')
      .text(yText)
      .at({textAnchor: 'middle', transform: 'rotate(-90)'})
      .st({fill: '#000'})
  }
}
