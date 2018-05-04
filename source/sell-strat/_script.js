var ttSel = d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var gDays = null
var gbT = 1.08
var gsT = .92
var gStartI = () => 0
var gEndI = () => 11910
var gT = 0 

var isMobileGrid = innerWidth < 720

var r2 = Math.sqrt(2)
var color = d3.scaleThreshold()
  .domain([1/2, 1/r2, 1, r2, 2, 2*r2])
  .range(["#b35806","#f1a340","#fee0b6","#f7f7f7","#d8daeb","#998ec3","#542788"])
  .domain([1/4, 1/2*r2, 1/2, 1/r2, 1, r2, 2, 2*r2, 4, 4*r2])
  .range(["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"].reverse())

// http://tristen.ca/hcl-picker/#/clh/6/29/693508/FCDDBA
//#643803,#87541A,#A97337,#C9945B,#E5B887,#FBDEBA
// http://tristen.ca/hcl-picker/#/clh/6/231/1C5478/EDE1CF
// #1C5478,#426F92,#698AA9,#93A7BA,#BFC4C7,#EDE1CF

lcolors = '#1C5478,#426F92,#698AA9,#93A7BA,#BFC4C7,#eee'.split(',')
rcolors = '#643803,#87541A,#A97337,#C9945B,#E5B887'.split(',').reverse()
color.range(lcolors.concat(rcolors).reverse())

if (window.data){
  initAll()
} else {
  var datapre = 'https://gist.githubusercontent.com/1wheel/18b49093b0a41888d4ff45281cb66f66/raw/37c4c6f85b3455bc5d6243ac7c638cf013e081e3/'

  d3.loadData(datapre + 'NASDAQCOM.csv', datapre + 'grid-cache.csv', (err, res) => {
    data = res[0].filter(d => d.val != '.')

    gridCache = res[1] || []

    initAll()
  })
}


function initAll(){
  drawLine = initLine()
  gDays = null

  if (gridCache.length){
    gridCache.forEach(d => {
      d.bT = +d.bT
      d.sT = Math.floor(200*d.sT)/200
    })
  }

  data.forEach((d, i) => {
    d.v = +d.val
    d.i = i

    var p = i ? data[i - 1] : d
    d.change = d.v/p.v

    d.year = d.date.split('-')[0]
  })

  decadeIndex = d3.nestBy(data, d => d.year.substr(0, 3))
    .map(d => ({year: d[0].year, i: d[0].i}))
  decadeIndex.forEach((d, i) => {
    d.ei = i != 4 ? decadeIndex[i + 1].i : data.length - 1
    d.decadeIndex = i
  })

  yearIndex = d3.nestBy(data, d => d.year)
    .map(d => ({year: d[0].year, i: d[0].i}))

  // buy if +5% over last week
  bVector = calcChangeVector(14, 1.06, 0)
  sVector = calcChangeVector(14,  .94, 1)

  returns = calcReturnVector(bVector, sVector)

  // save grid data
  if (0){
    d3.range(2, 32).forEach(day => calcGridData(day, true))
    var fmt = d3.format('.5f')
    gridCache.forEach(d => {
      d.y1970 = fmt(d.vHash['1970'], 6) 
      d.y1980 = fmt(d.vHash['1980'], 6) 
      d.y1990 = fmt(d.vHash['1990'], 6) 
      d.y2000 = fmt(d.vHash['2000'], 6) 
      d.y2010 = fmt(d.vHash['2010'], 6) 
      d.y2017 = fmt(d.vHash['2017'], 6) 
      delete d.vHash
    })
  }

  if (!window.day2gridData) day2gridData = {}
  initSlider(10)
  drawDay(10)

}

function drawDay(days){

  if (days == gDays) return
  gDays = days
  
  gridData = gridCache.filter(d => d.days == days)
  
  drawGrid(days, 0, data.length - 1, null, null, 2017)
  var decadeSel = d3.select('#decade-sm').html('').appendMany('div', decadeIndex)
  decadeSel.each(function(d){
    var sel = d3.select(this)
    var year = d.year.replace('71', '70')

    sel.append('div.year-label').html('&nbsp;' +year + 's')

    drawGrid(days, d.i, d.ei, sel, d, year)
  })

  drawLine(gDays, gbT, gsT)

}

function initSlider(days){
  var isMobile = innerWidth < 720

  var sel = d3.select('#slider-span')

  var scale = d3.scaleLinear()
    .clamp(true)
    .domain([-50, 50])
    .range([2, 31])

  sel
    .call(d3.drag()
      .subject(() => ({x: scale.invert(days), y: 0}))
      .on('drag', () => {
          days = Math.round(scale(d3.event.x))
          sel.text(days)
          drawDay(days)
      }))
  // debugger
  var boxSel = d3.select('#slider-chart').html('').st({height: 0})
  var c = d3.conventions({
    sel: boxSel.append('div.slide-inner').st({width: 9*31}),
    margin: {left: 0, right: 0, top: 0, bottom: 0}
  })
  c.x.domain([2, 31])

  var s = c.x(3)
  var slideRectSel = c.svg.append('g').appendMany('rect.slider-rect', _.filter(gridCache, {bT: gbT, sT: gsT}))
    .translate(d => c.x(d.days), 0)
    .at({width: s - 1, height: s, fill: d => color(d.y2017/70)})
    // .call(d3.attachTooltip)

  var connectorPath = c.svg.append('path')
    .at({stroke: '#000', strokeWidth: 2, fill: 'none'})

  var hSpace = 13
  window.updateDayConnector = function(){
    var mobilePath = [
      'M', c.x(gDays) + s/2, 0,
      'v', -hSpace/2,
      'H', 220,
      'v', -hSpace/2
    ].join(' ') 

    var path = [
      'M', c.x(gDays) + s/2, 0,
      'v', -10,
      'H', -120,
    ].join(' ')

    connectorPath.at({d: isMobile ? mobilePath : path})


    slideRectSel
      .classed('active', d => d.days == gDays)
      .filter(d => d.days == gDays)
      .raise()
  }


  c.svg.append('rect')
    .at({width: c.width + 9, height: c.height + 20, fillOpacity: 0, y: isMobile ? -10 : -10})
    .on('mousemove', function(){
      var days = Math.round(c.x.invert(d3.mouse(this)[0]))
      days = Math.min(31, days)
      drawDay(days)
      sel.text(days)
    })


}

function calcGridData(days, isAddToCache){
  bVectors = d3.range(1.01, 1.10, .005).map(d => calcChangeVector(days, d, 0))
  sVectors = d3.range(.99, .90, -.005) .map(d => calcChangeVector(days, d, 1))

  gridData = d3.cross(bVectors, sVectors).map(([b, s]) => {
    var v = calcReturnDecades(b, s)

    var vHash = {
      1970: v[0]/100,
      1980: v[1]/v[0],
      1990: v[2]/v[1],
      2000: v[3]/v[2],
      2010: v[4]/v[3],
      2017:  v[4]/100,
    }

    var bT = b.meta.changeTarget
    var sT = s.meta.changeTarget
    if (isAddToCache) gridCache.push({days, bT, sT, vHash})

    return {v, b, s, vHash, bT, sT}
  })

  return gridData
}

function pctFmtLng(d){
  return d3.format('+.1f')((d - 1)*100) + '%'
}

function drawGrid(days, startI, endI, sel, decadeObj, year){
  var isLeftAxis = year == 2017 || year == 1970 || (innerWidth < 970 && year == 1980)

  sel = sel || d3.select('#grid').html('')

  var keySel = sel.append('div')

  var width = sel.node().offsetWidth - 20

  if (width < 50) width = isMobileGrid ? 14*9 : 19*9
  var c = d3.conventions({
    sel: sel.append('div'), 
    height: width, 
    width: width, 
    margin: {left: year == 2017 ? 20: 10, right: 10, top: 0},
    layers: 'cs'
  })


  c.x.domain([1.01, 1.10 - .005])
  c.y.domain([.99, .90])

  function pctFmt(d){
    return d3.format('+.0f')((d - 1)*100) + '%'
  }

  var xTicks = [1.02, 1.04, 1.06, 1.08, 1.10]
  var yTicks = [.98, .96, .94, .92, .90]

  if (innerWidth < 800 && year != 2017){
    xTicks = xTicks.filter((d, i) => (i % 2))
    yTicks = yTicks.filter((d, i) => (i % 2))
  }
  c.xAxis.tickValues(xTicks).tickFormat(pctFmt)
  c.yAxis.tickValues(yTicks).tickFormat(pctFmt)
  d3.drawAxis(c)

  c.svg.select('.x').translate([-1, c.height])


  if (!isLeftAxis) c.svg.selectAll('.y').remove()

  var startVal = data[startI].v
  var endVal = data[endI].v

  var stockReturn = endVal/startVal


  if (year == 2017){
    c.svg.append('text.axis')  
      .st({
        fontSize: 12,
        fontWeight: 500
      })
      .translate([-30, -25])
      .tspans('Sell when the market//falls by this much...'.split('//'))

    c.svg.append('text.axis')  
      .st({
        fontSize: 12,
        fontWeight: 500,
        textAnchor: 'end'
      })
      .translate([c.width + 10, c.height + 30])
      .tspans('...Buy when the market//rises by this much'.split('//'))

    keySel.st({marginBottom: 50, marginLeft: -10, width: isMobileGrid ? 166 : 215})
    keySel.append('div').append('b').text('Returns v. NASDAQ').st({marginLeft: 0})
    keySel.appendMany('span', [1/4, 1/2, 1, 2, 4])
      .text(d => d == 1/4 ? '1/4' : d == 1/2 ? '1/2' : d)
      .text(d => d3.format('.0%')(d))
      .st({background: color, width: '20%', display: 'inline-block', textAlign: 'center', color: (d, i) => d == 1 ? '#888' : '#fff', fontSize: isMobileGrid ? 10 : 12})
  }
  var s = c.width/19

  var hoverRect = c.svg.append('rect.hover-rect')
    .at({width: s, height: s, strokeWidth: isMobileGrid ? 1.5 : 3, fill: 'none', stroke: '#000'})
    .translate(-100000, 0)
    .datum({fn: (bT, sT) => hoverRect.translate([c.x(bT), c.y(sT) - s])})

  var prevPosStr = ''
  var clicked = false
  c.svg.append('rect')
    .at({width: c.width + s, height: c.height, fillOpacity: 0})
    .st({cursor: 'pointer'})
    .call(d3.attachTooltip)
    .on('mousemove touchmove click', function(){
      if (clicked && !isMobileGrid && d3.event.type != 'click') return

      d3.event.preventDefault()
      d3.event.stopPropagation()

      var [x, y] = d3.mouse(this)
      var bT = gbT = Math.floor(200*c.x.invert(x))/200
      var sT = gsT = Math.floor(200*c.y.invert(y + s))/200

      var posStr = bT + '' + sT
      if (prevPosStr == posStr) return
      prevPosStr = posStr

      var d = _.find(gridData, {bT, sT})
      var percent = d['y' + year]/stockReturn
      ttSel.html([
        `&nbsp;Buy after ${days} day change of ` + pctFmtLng(bT),
        `Sell after ${days} day change of ` + pctFmtLng(sT),
        `<b style='color: #fff; background: ${color(percent)}; color: ${color(percent) == '#eee' ? '#888' : ''}; margin-right: 8px;'>&nbsp` + d3.format('.2%')(percent) + ' </b> of NASDAQ',
      ].join('<br>'))
      
      drawLine(days, bT, sT, startI, endI)
    })
    .on('click.disable-move', () => clicked = true)
    .on('mouseover', () => clicked = false)

  var ctx = c.layers[0]
  // return
  gridData.forEach(d => {
    ctx.beginPath()
    ctx.fillStyle = color(d['y' + year]/stockReturn)
    ctx.rect(c.x(d.bT), c.y(d.sT) - s, s, s)
    ctx.fill()
  })
}



function calcChangeVector(numDays, changeTarget, isLessThan){
  var rv = data.map((d, i) => {
    if (i < numDays) return false

    var change = d.v/data[i - numDays].v

    return isLessThan ? change < changeTarget : change > changeTarget
  })

  rv.meta = {numDays, changeTarget, isLessThan}

  return rv
}

function calcReturn(bVector, sVector){
  var isHolding = true  
  var v = 100

  data.forEach((d, i) => {
    if (isHolding) v = v*d.change

    if (isHolding && sVector[i]){
      isHolding = false
    } else if (!isHolding && bVector[i]){
      isHolding = true
    } 

  })

  return v
}

function calcReturnDecades(bVector, sVector){
  var isHolding = true  
  var v = 100

  var rv = []

  data.forEach((d, i) => {
    if (isHolding) v = v*d.change

    if (isHolding && sVector[i]){
      isHolding = false
    } else if (!isHolding && bVector[i]){
      isHolding = true
    }

    if (i == 2248 || i == 4776 || i == 7304 || i == 9819 || i == 11910) rv.push(v)
  })

  return rv
}


function calcReturnVector(bVector, sVector){
  var isHolding = true  
  var v = 100
  var changeIndices = [0]

  var rv = data.map((d, i) => {
    if (isHolding) v = v*d.change

    var changed = true

    if (isHolding && sVector[i]){
      isHolding = false
    } else if (!isHolding && bVector[i]){
      isHolding = true
    } else {
      changed = false
    }

    if (i == 0) changed = true
    if (i == data.length - 1) changed = true
    if (changed) changeIndices.push(i)

    return {v, i, isHolding, changed}
  })

  rv.meta = {bVector, sVector, changeIndices}

  return rv
}

