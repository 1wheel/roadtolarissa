window.visState = window.visState || {
  streak: .01,
  rolling: 1,
}

window.init = function(){
  console.clear()

  daily.forEach(d => {
    var [year, month, day] = d.DATE.replaceAll('/', '-').split('-')
    d.year = year
    d.month = month
    d.day = day
    d.PRCP = +d.PRCP
  })

  initDailyRain('streak')
  initDailyRain('rolling')

  initByMonth()
}

function initDailyRain(type){
  var isStreak = type == 'streak'
  var renderFns = [val => visState[type] = val]
  function render(val){ renderFns.forEach(fn => fn(val)) }

  function drawSlider(){
    var sel = d3.select('.' + type + '-slider').html('')
    var textSel = sel.append('div.streak-val')

    var scale = d3.scalePow().range(isStreak ? [.01, 50] : [1, 3652]).exponent(2)
    if (!isStreak) scale.interpolate(d3.interpolateRound)
    var sliderSel = sel.append('input')
      .at({type: 'range', min: 0, max: 1, value: 0, step: .001})
      .on('input', function(){ render(scale(this.value)) })

    renderFns.push(val => textSel.text(isStreak ? d3.format('.2f')(val) + '″' : val + ' day' + (val > 1 ? 's' : '')))
  }
  drawSlider()

  var streakDaily = daily.filter(d => d.year > '1879')
  var byYear = d3.nestBy(streakDaily, d => d.year)
  byYear.forEach((year, yearIndex) => {
    year.yearIndex = yearIndex
    year.forEach((d, dayIndex) =>{
      d.yearIndex = yearIndex
      d.dayIndex = dayIndex
    })
  })

  var dw = 3
  var yh = 4
  var c = d3.conventions({
    sel: d3.select('.' + type).html(''),
    width: (366 + 1)*dw,
    height: (d3.max(daily, d => d.yearIndex) + 1)*yh,
    layers: 'cs',
    margin: {top: 0},
  })
  util.setFullWidth(c.sel, c.totalWidth)

  c.svg.append('g.axis').appendMany('text', util.shortMonths)
    .text(d => d)
    .translate((d, i) => [dw*(i*30 + 15), c.height + 12])
    .at({textAnchor: 'middle'})

  c.svg.append('g.axis').appendMany('g', byYear.filter(d => d.key[3] == '0'))
    .translate(d => [-14, yh*(d.yearIndex)])
    .append('text')
    .text(d => d.key)
    .at({textAnchor: 'middle', dy: '.33em'})

  c.svg.append('rect').at({width: c.width, height: c.height, opacity: 0})
    .call(d3.attachTooltip)
    .on('mousemove mouseover', function(){
      var ttSel = d3.select('.tooltip')//.html('')

      var [mx, my] = d3.mouse(this)

      var year = byYear[Math.floor(Math.max(0, my)/yh)]
      var d = year && year[Math.floor(mx/dw)]
      if (!d) return ttSel.classed('.tooltip-hidden', 1)

      ttSel.html(`
        <div><b>${d.DATE}</b></div>

        <div>${d3.format('.2f')(d.PRCP) + '″'} of precipitation</div>

        <div>${d.streak} prior days ${visState.streak > .01 ? 
          `to get to ${d3.format('.2f')(visState.streak) + '″'} of precipitation` :
          `of no precipitation`
        }</div>

        <div>${visState.rolling > 1 ? 
          `Over the last ${visState.rolling} days, ${d3.format('.2f')(d.rolling) + '″'} of precipitation` :
          ``
        }</div>
      `)



    })

  renderFns.push(val => {
    if (isStreak){
      var sum = 0
      var start = 0
      for (var i = 0; i < daily.length; i++) {
        sum += daily[i].PRCP
        daily[i][type] = i - start + 1
        
        while (sum >= val && start <= i) {
          sum -= daily[start].PRCP
          start++
          daily[i][type] = i - start + 1
        }
      }
    } else {
      var sum = 0
      for (var i = 0; i < daily.length; i++) {
        sum += daily[i].PRCP
        if (i >= val) sum -= daily[i - val].PRCP
        daily[i][type] = sum < .001 ? 0 : sum
      }
    }

    var [minVal, maxVal] = d3.extent(streakDaily, d => d[type])
    if (isStreak){
      var color = d3.scaleSequential(d3.interpolateTurbo).domain([0, maxVal])
    } else {
      // var byVal = streakDaily.map(d => +d[type]).sort((a, b) => a - b)
      // var maxVal = d3.quantile(byVal, 0.999)

      var colorRaw = d3.scaleSequential(d3.interpolateCool).domain([minVal, maxVal])
      
      // var colorRaw = d3.scaleQuantile()
      //   .domain(streakDaily.map(d => d[type]))
      //   .range(d3.schemePuOr[11].slice().reverse())
      // var color = d3.scaleSequential(d3.interpolateCool).domain([maxVal, minVal])
      // var color = d3.scaleSequential(d3.interpolateTurbo).domain([maxVal, minVal])
      // var color = d3.scaleSequential(d3.interpolateOranges).domain([maxVal, 0])

      var color = d => d < .005 ? '#000' : colorRaw(d)

    }

    var ctx = c.layers[0]
    ctx.clearRect(0, 0, c.width, c.height)
    streakDaily.forEach(d =>{
      ctx.beginPath()
      ctx.rect(dw*d.dayIndex, yh*d.yearIndex, dw, yh)
      ctx.fillStyle = color(d[type])
      ctx.fill()
    })
  })

  render(isStreak ? .01 : 1)
}


function initByMonth(){
  var byMonth = d3.nestBy(daily, d => d.month)
  byMonth.forEach(month => {
    month.byYear = d3.nestBy(month, d => d.year)
    month.byYear.forEach(arr => arr.total_prcp = d3.sum(arr, d => +d.PRCP))
  })

  var byMonthSel = d3.select('.by-month').html('')
  util.setFullWidth(byMonthSel, 1200)

  byMonthSel
    .appendMany('div.month', byMonth)
    .each(drawMonth)
    .st({display: 'inline-block'})

  var monthYearSel = byMonthSel.selectAll('.month-year')
    .on('mouseover', d => setActiveYear(d[0].year))

  function setActiveYear(year){
    monthYearSel.classed('active', d => d[0].year == year)
  }
  setActiveYear(2024)

  function drawMonth(month){
    var c = d3.conventions({
      sel: d3.select(this),
      height: 100,
      margin: {left: 35, right: 35, top: 10}
    })

    var max = 10
    var nBuckets = 30
    var bucketSize = max/nBuckets

    c.x.domain([0, max]).clamp(1).interpolate(d3.interpolateRound)
    c.y.domain([0, 14])
    c.xAxis.tickFormat(d => d + '″' + (d == max ? '+' : ''))
    d3.drawAxis(c)
    c.svg.select('.y').remove()
    c.x.interpolate(d3.interpolateNumber)

    c.svg.append('g.axis').append('text').text(util.months[month.key - 1] + ' Total Precipitation')
      .at({textAnchor: 'middle', x: c.width/2, y: c.height + 33})
      .st({fontSize: 12})

    // filter out 1924 data and incomplete 2024 data
    var byYear = month.byYear.filter(d => d.key > '1924' && (d.key < '2024' || d[0].month < '11'))
    byYear.forEach(d => d.xPos = c.x(Math.round(d.total_prcp/bucketSize)*bucketSize))
    d3.nestBy(byYear, d => d.xPos).forEach(bucket => {
      bucket.forEach((byYear, bucketIndex) => byYear.bucketIndex = bucketIndex)
    })
    // console.log(d3.max(byYear, d => d.bucketIndex))

    c.svg.appendMany('text.month-year', byYear)
      .text(d => d.key.slice(2))
      .translate(d => [d.xPos, c.y(d.bucketIndex)])
      .at({dy: -1, textAnchor: 'middle'})
      .call(d3.attachTooltip)
      .on('mousemove', d => {
        d3.select('.tooltip')
          .html(`${d3.round(d.total_prcp, 2)}″ of precipitation in ${util.months[d[0].month - 1]} ${d[0].year}`)
      })
  }
}


if (!window.daily){
  d3.loadData('https://roadtolarissa.com/data/central-park-daily-weather.csv', (err, res) => {
    window.daily = res[0]
    init()
  })
} else{
  init()
}

