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
  var renderFns = []
  function render(val){ renderFns.forEach(fn => fn(val)) }

  function drawSlider(){
    var sel = d3.select('.' + type + '-slider').html('')
    var textSel = sel.append('div.streak-val')
    var sliderSel = sel.append('input')
      .at(isStreak ? 
        {type: 'range', min: .01, max: 16, value: 0.01, step: .01} :
        // {type: 'range', min: 1,   max: 3650, value: 1})
        {type: 'range', min: 1,   max: 60, value: 1})
      .on('input', function(){ render(this.value) })

    renderFns.push(val => textSel.text(isStreak ? d3.format('.2f')(val) + '″' : val + ' day' + (val > 1 ? 's' : '')))
  }
  drawSlider()

  var streakDaily = daily.filter(d => d.year > '1879')
  var byYear = d3.nestBy(streakDaily, d => d.year)
  byYear.forEach((year, yearIndex) => {
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
    layers: 'sc',
    margin: {top: 0},
  })
  util.setFullWidth(c.sel, c.totalWidth)

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
        daily[i][type] = sum
      }
    }

    var [minVal, maxVal] = d3.extent(streakDaily, d => d[type])
    if (isStreak){
      var color = d3.scaleSequential(d3.interpolateTurbo).domain([0, maxVal])
    } else {
      var colorRaw = d3.scaleSequential(d3.interpolateCool).domain([minVal, maxVal])
      var color = d => d < .015 ? '#000' : colorRaw(d)
      // var color = d3.scaleSequential(d3.interpolateCool).domain([maxVal, minVal])
      // var color = d3.scaleSequential(d3.interpolateTurbo).domain([maxVal, minVal])
      // var color = d3.scaleSequential(d3.interpolateOranges).domain([maxVal, 0])
    }

    var ctx = c.layers[1]
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

    // var shortMonths = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."]
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    c.svg.append('g.axis').append('text').text(months[month.key - 1] + ' Total Precipitation')
      .at({textAnchor: 'middle', x: c.width/2, y: c.height + 33, fontFamily: 'sans-serif', fontSize: 12})

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
          .html(`${d3.round(d.total_prcp, 2)}″ of precipitation in ${months[d[0].month - 1]} ${d[0].year}`)
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

