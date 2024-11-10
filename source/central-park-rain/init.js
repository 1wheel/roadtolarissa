d3.loadData('https://roadtolarissa.com/data/central-park-daily-weather.csv', (err, res) => {
  console.clear()

  window.daily = res[0]



  daily.forEach(d => {
    var [year, month, day] = d.DATE.replaceAll('/', '-').split('-')
    d.year = year
    d.month = month
    d.day = day
  })

  window.byYearMonth = d3.nestBy(daily, d => d.year + '-' + d.month)

  window.byMonth = d3.nestBy(daily, d => d.month)
  byMonth.forEach(month => {
    month.byYear = d3.nestBy(month, d => d.year)
    month.byYear.forEach(arr => arr.total_prcp = d3.sum(arr, d => +d.PRCP))
  })


  d3.select('.by-month').html('').appendMany('div.month', byMonth)
    .each(drawMonth)
    .st({display: 'inline-block'})

})


function drawMonth(month){
  var sel = d3.select(this)

  var c = d3.conventions({
    sel: sel.append('div'),
    height: 200,
    width: 300,
    margin: {left: 5, right: 30}
  })

  var max = 12
  var nBuckets = 30
  var bucketSize = max/nBuckets

  c.x.domain([0, max]).clamp(1)
  c.y.domain([0, 30])
  d3.drawAxis(c)
  c.svg.select('.y').remove()

  month.byYear.forEach(d => {
    d.total_prcp_rnd = Math.round(d.total_prcp/bucketSize)*bucketSize
  })
  d3.nestBy(month.byYear, d => d.total_prcp_rnd).forEach(bucket => {
    bucket.forEach((byYear, bucketIndex) => byYear.bucketIndex = bucketIndex)
  })

  c.svg.appendMany('text.month-year', month.byYear)
    .text(d => d.key.slice(2))
    .translate(d => [c.x(d.total_prcp_rnd), c.y(d.bucketIndex)])
    .at({dy: -5, textAnchor: 'middle'})
    .call(d3.attachTooltip)


}