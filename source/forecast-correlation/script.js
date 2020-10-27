console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')


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
}

window.globalSetScenario = function(scenarioIndex){
  map538.drawScenario(scenarioIndex)
  mapEco.drawScenario(scenarioIndex)
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
    .st({width: totalWidth, marginLeft: colMarginLeft})

  var [model538, modelEco] = ['538', 'eco'].map((str, i) => {
    var sel = d3.select('.col-' + str)
      .html(`<div class='matrix'></div><div class='scatter'></div><div class='map'></div>`)
    var pairs = res[i]
    var strLong = ['538', 'Economist'][i]
    var strShort = ['538', 'Econ'][i]

    pairs.forEach(d => {
      d.canonicalStr = [d.strA, d.strB].sort().join(' ')
    })

    return {str, strLong, strShort, i, sel, pairs}
  })
  window.model538 = model538
  window.modelEco = modelEco

  var index2cluster = calcIndex2Cluster(model538, modelEco)
  window.matrix538 = initMatrix(model538, index2cluster)
  window.matrixEco = initMatrix(modelEco, index2cluster)


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
  window.globalSetScenario(23)
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
      width: bs - .1,
      height: bs - .1,
      // fill: d => d.indexA == d.indexB ? '#fff' : d3.interpolatePiYG(corScale(d.cor))
      fill: d => corColor(d.cor),
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
  addAxisLabel(c, model.strLong)

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
    .at({stroke: '#555', strokeWidth: 1, strokeDasharray: '2 2', clipPath: 'url(#line-clip)'})

  var ctx = c.layers[1]

  var xData = d3.range(1000)
  var yData = d3.range(1000)

  function calcExtent(pair){
    xData.forEach((_, i) => {
      xData[i] = model.maps[i*states.length + pair.indexA]/10000
      yData[i] = model.maps[i*states.length + pair.indexB]/10000
    })

    return d3.extent(xData.concat(yData))
  }

  function drawPair({indexA, indexB}, extent){
    var pair = _.find(model.pairs, {indexA, indexB})

    titleSel.html(`
      ${model.strShort} ${pair.strA}-${pair.strB} correlation: 
      <span style='padding: 1px; border: 2px solid ${corColor(pair.cor)}'> ${d3.format('+.2f')(pair.cor)} </span>`)

    c.x.domain(extent)
    c.y.domain(extent)

    c.svg.select('.x').call(c.xAxis)
    c.svg.select('.y').call(c.yAxis)
    ctx.clearRect(-c.margin.left, -c.margin.right, c.totalWidth, c.totalWidth)
    
    xAxisSel.select('.label').text('Trump Vote Share in ' + pair.strA)
    yAxisSel.select('.label').text('Trump Vote Share in ' + pair.strB)

    ctx.fillStyle = 'rgba(0,0,0,.2)'
    xData.forEach((_, i) => {
      ctx.beginPath()
      ctx.rect(c.x(xData[i]), c.y(yData[i]), 1, 1)
      ctx.fill()
    })

    var l = ss.linearRegressionLine(pair)
    var [x0, x1] = extent.map(d => d*10000)

    lineSel.at({d: `M ${c.x(x0/10000)} ${c.y(l(x0)/10000)} L ${c.x(x1/10000)} ${c.y(l(x1)/10000)}`})
  }

  return {drawPair, calcExtent}
}

function initMap(model, us, stateVotes){
  var width = 275

  var sel = model.sel.select('.map')
  var titleSel = sel.append('div.small-title')
  var c = d3.conventions({
    sel,
    layers: 's',
    width,
    height: width,
    margin: {bottom: 50, left: 0, right: 0}
  })

  us.land = us.land || topojson.feature(us, us.objects.nation)
  var path = d3.geoPath().projection(d3.geoAlbersUsa().fitSize([width, width], us.land))
  
  var stateSel = c.svg.appendMany('path.states', topojson.feature(us, us.objects.states).features)
    .at({d: path})
    .call(d3.attachTooltip)
    .each(d => {
      d.state = _.find(stateVotes, {name: d.properties.name})
    })
    .filter(d => d.state)

  us.stateMesh = us.stateMesh || path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b }))
  c.svg.append('path.state-borders')
    .at({stroke: '#fff', strokeWidth: .4, fill: 'none', d: us.stateMesh})

  function drawScenario(scenarioIndex){
    var rVotes = 0
    stateSel.at({fill: d => {
      var isR = model.maps[scenarioIndex*states.length + d.state.i] > 5000
      if (isR) rVotes += d.state.votes
      return isR ? '#BC5454' : '#648DCF'
    }})
  }

  return {drawScenario}
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
