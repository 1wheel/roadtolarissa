function initLine(){
  var sel = d3.select('#graph').html('')
  var bSel = sel.append('div')
    .st({marginBottom: -16})
    .append('b')
    
  var c = d3.conventions({
    sel: sel.append('div'), 
    totalHeight: 286, 
    margin: {left: 32, right: 30, top: 20},
    layers: 'cs',
  })
  var ctx = c.layers[0]

  // console.log(c.width)

  var {width, height} = c
  c.svg.append('rect')
    .at({width, height: height + 1, fill: '#000', fillOpacity: .6})

  c.svg.append('rect')
    .at({x: width, width: c.margin.right, height: height + 1, fill: '#f5f5f5'})
  c.svg.append('rect')
    .at({x: -c.margin.left, width: c.margin.left, height: height + 1, fill: '#f5f5f5'})


  var y = d3.scaleLog()
    .domain([50, 10000])
    .range(c.y.range())
  
  c.yAxis.scale(y)
    .tickFormat(d => d/100 + '×')
    .tickValues([50, 100, 200, 500, 1000, 2000, 5000, 10000])
  d3.drawAxis(c)

  var xAxisSel = c.svg.select('.x')

  var red = 'rgb(155,17,14)'
  var green = '#0f0'

  var green1 = 'rgb(0,160,138)'

  var redL = '#f00'
  var greenL = '#3dea05'

  c.svg.append('mask#line-mask').append('rect')
    .at({width: c.width, y: -30, height: c.height + 30, fill: '#fff'})
  var drawG = c.svg.append('g').at({mask: 'url(#line-mask)'})




  var curT = 1
  var startIFn = t => 0
  var endIFn = t => 11910

  var returns
  var changes

  var lastDays = null

  return function(days, bT, sT, startI = startIFn(1), endI = endIFn(1)){

    if (window.updateDayConnector) window.updateDayConnector()
    d3.selectAll('.hover-rect').each(d => d.fn(bT, sT))
      
    if (days == lastDays){
      d3.selectAll('.slider-rect')
        .data(_.filter(gridCache, {bT: gbT, sT: gsT}))
        .at({fill: d => color(d.y2017/70)})
    }
    lastDays = days      

    var startTransition = false
    if (startI != startIFn(1) || endI != endIFn(1) && arguments.length > 3){

      startIFn = d3.interpolate(startIFn(curT), startI)
      endIFn = d3.interpolate(endIFn(curT), endI)

      curT = 0

      startTransition = true
    }

    bSel.html('')
    bSel.append('span')
      .st({paddingBottom: 0, borderBottom: `2px solid ${greenL}`})
      .text(`Buy After ${pctFmtLng(bT)}`)
    bSel.append('span').html('&nbsp')
    bSel.append('span')
      .st({paddingBottom: 0, borderBottom: `2px solid ${redL}`})
      .text(`Sell After ${pctFmtLng(sT)}`)
    bSel.append('span').html('&nbsp')

    if (c.width > 150){
      bSel.append('span')
        .text(`${days} Day Change`)
    }

    b = calcChangeVector(days, bT, 0)
    s = calcChangeVector(days, sT, 1)

    returns = calcReturnVector(b, s)

    changes = returns.meta.changeIndices.map((d, i) => {
      var n = returns.meta.changeIndices[i + 1] || data.length
      return {i, v: d, n}
    })

    drawFrame(curT)
    if (startTransition){
      if (window.linetimer) linetimer.stop()
      linetimer = d3.timer(t => {
        curT += .03
        if (curT > 1) return linetimer.stop()

        drawFrame()
      })
    }

    function drawFrame(){
      var cubicT = d3.easeCubicInOut(curT)
      startI = Math.round(startIFn(cubicT))
      endI = Math.round(endIFn(cubicT))

      c.x.domain([startI, endI])

      var yTicks = yearIndex.filter(d => startI <= d.i && d.i <= endI).map(d => d.i)
      var dTicks = decadeIndex.map(d => d.i).concat(data.length - 60)

      var xTicks = (yTicks.length < 16 ? yTicks : dTicks)
          .filter(d => -20 <= c.x(d) && c.x(d) <= c.width + 20)

      c.xAxis
        .tickFormat(d => data[d].year)
        .tickValues(c.width < 150 ? [xTicks[0], xTicks.pop()] : xTicks)

      xAxisSel.selectAll('.tick').remove()
      xAxisSel.call(c.xAxis)

      drawG.selectAll('*').remove()

      ctx.clearRect(0, 0, c.width, c.height)

      changes.forEach(d => d.x = c.x(d.v))
      changes.forEach((d, i) => {
        if (d.x > c.width) return
        if (changes[i + 1] && changes[i + 1].x < 0) return
        // if ()

        ctx.beginPath()
        ctx.fillStyle = returns[d.v].isHolding ? green1 : red
        ctx.rect(
          d.x, 
          0, 
          c.x(d.n) - d.x, 
          c.height)
        ctx.fill()
      })


      var line = d3.line()
        .x(d => c.x(d.i))
        .y(d => y(d.v))

      drawG.append('path')
        .at({
          d: line(data),
          fill: 'none',
          stroke: '#ccc',
          strokeWidth: 1
        })

      // var initRatio = data[startI].v/returns[startI].v
      // var initRatio = 1
      // line.y(d => y(d.v*initRatio))

      drawG.append('path')
        .at({
          d: line(returns.filter(d => d.changed)),
          fill: 'none',
          stroke: '#0f0',
          strokeWidth: 2
        })
        .st({stroke: greenL})

      drawG.append('path')
        .at({
          d: line.defined(d => !d.isHolding)(returns),
          fill: 'none',
          stroke: '#df3610',
          strokeWidth: 2
        })
        .st({stroke: redL})

    }

  }

}


if (window.initAll) initAll()
