window.util = (function(){
  function parseData(){
    var year2inflation = {}
    window.__datacache[2].forEach(d => year2inflation[+d.year] = +d.price_per_ticket)

    window.weekendData = parsePeriod(window.__datacache[0])
    window.weeklyData  = parsePeriod(window.__datacache[0])

    function parsePeriod(tidy){
      tidy.forEach(d => {
        d.yearweek = d.year + d.week

        d.rawGross = +d.gross
        d.year = +d.year
        d.week = +d.week

        d.gross = d.rawGross*year2inflation[2020]/year2inflation[d.year]
      })

      var yearweek2index = {}
      d3.nestBy(tidy, d => d.yearweek).forEach((d, i) => yearweek2index[d.key] = i) 

      tidy.forEach(d => {
        d.weekIndex = yearweek2index[d.yearweek]
      })

      var byYear = d3.nestBy(tidy, d => d.year)
        .filter(d => d.key > 1981)

      var byWeek = []
      byYear.forEach(year => {
        year.byWeek = d3.nestBy(year, d => d.week)
          .filter(d => d.length > 1)

        year.byWeek.forEach(week => {
          week.gross = d3.sum(week, d => d.gross)
          week.forEach(d => {
            d.percent = d.gross/week.gross
          })
          week.top = week[0].name
          week[0].isTop = true

          byWeek.push(week)
        })
      })

      byWeek.forEach(d => {
        d.week = d[0].week
        d.year = d[0].year
        // Wonky christmas weekend data
        d.isHidden = (d.week == 51 || d.week == 52) && (d.year == 1988 || d.year ==1989)
      })

      var byMovie = d3.nestBy(tidy, d => d.id)
      byMovie.idLookup = {}
      byMovie.forEach(movie => {
        movie.name = movie[0].name
        movie.maxPercent = d3.max(movie, d => d.percent)
        byMovie.idLookup[movie.key] = movie

        movie.weekIndex0 = movie[0].weekIndex
        movie.year = movie[0].year
        movie.gross = d3.sum(movie, d => d.gross)
        movie.highestWeeklyGross = d3.sum(_.sortBy(movie, d => -d.gross).slice(0, 1), d => d.gross)
        movie.highestGrossPercent = movie.highestWeeklyGross/movie.gross

        movie.forEach(d => {
          d.weeksSinceRelease = d.weekIndex - movie.weekIndex0
        })

      })

      return {tidy, byWeek, byYear, byMovie}
    }

    return {weekendData, weeklyData}
  }

  function addAxisLabel(c, xText, yText, xOffset=40, yOffset=-40){
    c.svg.select('.x').append('g')
      .translate([c.width/2, xOffset])
      .append('text.axis-label')
      .text(xText)
      .at({textAnchor: 'middle'})
      .st({fill: '#000', fontSize: 14})

    c.svg.select('.y')
      .append('g')
      .translate([yOffset, c.height/2])
      .append('text.axis-label')
      .text(yText)
      .at({textAnchor: 'middle', transform: 'rotate(-90)'})
      .st({fill: '#000', fontSize: 14})
  }

  function ggPlot(c, isBlack=true){
    // if (isBlack){
    c.svg.append('rect.bg-rect')
      .at({width: c.width, height: c.height, fill: '#eee'})
      .lower()
    // }

    c.svg.selectAll('.tick').selectAll('line').remove()
    c.svg.selectAll('.y .tick')
      .append('path').at({d: 'M 0 0 H ' + c.width, stroke: '#fff', strokeWidth: 1})
    c.svg.selectAll('.y text').at({x: -3})
    c.svg.selectAll('.x .tick')
      .append('path').at({d: 'M 0 0 V -' + c.height, stroke: '#fff', strokeWidth: 1})

    // c.svg.selectAll('.y .tick').filter(d => d == 0).remove()
  }


  return {addAxisLabel, ggPlot, parseData}
})()


if (window.init) window.init()