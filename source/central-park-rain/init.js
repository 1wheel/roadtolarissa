window.init = function(){
  console.clear()

  daily.forEach(d => {
    var [year, month, day] = d.DATE.replaceAll('/', '-').split('-')
    d.year = year
    d.month = month
    d.day = day
  })

  initByMonth()
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
}

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
      console.log('hi')
      d3.select('.tooltip')
        .html(`${d3.round(d.total_prcp, 2)}″ of precipitation in ${months[d[0].month - 1]} ${d[0].year}`)
    })
}



if (!window.daily){
  d3.loadData('https://roadtolarissa.com/data/central-park-daily-weather.csv', (err, res) => {
    window.daily = res[0]
    init()
  })
} else{
  init()
}

