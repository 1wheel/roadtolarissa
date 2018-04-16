console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var isMobile = innerWidth < 800
var isNoBar = false
d3.select('html').classed('is-no-bar', isNoBar)

var curYear = 1990

var psel = d3.select('#panel').html('')
var p = d3.conventions({sel: psel.append('div'), margin: {left: 10, top: 60}, height: 4000, layers: 'sd'})

p.y.domain([2019, 1993])

p.svg.appendMany('text.axis', d3.range(1993, 2019))
  .text(d => d)
  .at({dy: '.33em', y: d => p.y(d)}) 

var months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')
var month2index = {
  'Jan': 0,
  'Feb': 1,
  'Mar': 2,
  'Apr': 3,
  'May': 4,
  'Jun': 5,
  'Jul': 6,
  'Aug': 7,
  'Sep': 8,
  'Oct': 9,
  'Nov': 10,
  'Dec': 11,
}

p.layers[1].append('div')
  .translate(p.y(2019.0), 1)
  .st({background: '#f5f5f5', xfontFamily: "'Roboto Slab', serif", fontSize: 10})
  .html(`
    <div><a href='https://www.axios.com/black-panther-box-office-titanic-top-3-north-america-avatar-star-wars-32a35770-59fc-4ccc-bd5b-3a85d7144266.html'>Chart idea</a> from Axios.</div>
    <br>
    <div>Data from Box Office Mojo via Axios. Only top 100 grossing movies of all time are included, but the chart just shows the first 26 weeks of the initial theatical run.</div>

    <br>
    <div><a href='https://github.com/1wheel/roadtolarissa/blob/master/source/top-3-movies/_script.js'>code</a></div>
    `)

d3.loadData('https://gist.githubusercontent.com/1wheel/56488ad9de83ed0c4e90a026a53eb145/raw/cd97bdf639787733b59377ba7da7fce6af122c8a/movies2.csv', (err, res) => {
  movies = res[0]
  // tidy data
  // movies = res[0].filter(d => d.week_num != 0).filter(d => d.week_num <= 26)
  // movies.forEach(d => {
  //    'weekly_gross release_date total_gross rank'
  //     .split(' ')
  //     .forEach(key => delete d[key])
  // })
  // copy(d3.csvFormat(movies))

  movies.forEach(d => {
    var [month, day] = d.date.split('–')[0].split(' ')
    d.yearNum = +d.year + month2index[month]/12 + day/365

    d.gross_to_date = +d.gross_to_date
  })

  // movies = _.sortBy(movies, d => d.yearNum)

  var sel = d3.select('#graph').html('').append('div')
  var c = d3.conventions({sel, margin: {right: 50, top: isMobile ? 120 : 30, left: 0}, totalHeight: innerHeight, layers: 'sd'})

  var yMatch = -c.margin.top + p.margin.top
  c.svg.append('path')
    .at({
      d: `M -180 ${yMatch} h ${p.totalWidth}`,
      stroke: '#333',
      strokeDasharray: '3 3',
    })


  c.x.domain([1, 26])
  c.y.domain([0, 1000000000])

  c.yAxis = d3.axisRight().scale(c.y).tickFormat(d => d/1000000 + 'm')
  c.xAxis.ticks(isMobile ? 4 : 5).tickFormat((d, i) => i ? d : 'week ' + d)
  d3.drawAxis(c)
  var yTickSel = c.svg.selectAll('.y .tick')
  c.svg.selectAll('.y').translate(c.width, 0)


  byMovie = d3.nestBy(movies, d => d.title)

  byMovie.forEach(d => {
    d.gross = _.last(d).gross_to_date
    d.release = d[0].yearNum
    d.title = d.key.split(':')[0]
  })

  byMovie = _.sortBy(byMovie, d => d.gross).reverse()
  byMovie.forEach(m => {
    byMovie
      .filter(d => d.release <= m.release)
      .some((d, i) => {
        if (d != m) return
        m.contempRank = i
        return true
      })
  })

  var scrollTextSel = p.svg.appendMany('text.movie', byMovie.slice().reverse())
    .at({
      y: d => p.y(d.release),
      dy: '.33em',
      x: 35,
    })
    .classed('top', d => d.contempRank < 3)
    .tspans(d => d3.wordwrap(d.title, 25), 10)


  var line = d3.line()
    .x(d => c.x(d.week_num))
    .y(d => c.y(d.gross_to_date))
    .defined(d => d.yearNum <= curYear)
    .curve(d3.curveMonotoneY)

  var movieSel = c.svg.appendMany('g.movie', byMovie.slice().reverse())
    .on('mouseover', function(){ d3.select(this).raise() })
  var lineSel = movieSel.append('path.movie')
    .call(d3.attachTooltip)
    .at({strokeLinecap: 'round'})
  var titleSel = movieSel.append('text.movie-hover')
    .text(d => d.title)
    .at({textAnchor: d => d.length < 8 ? 'start' : 'end', dy: '-.33em'})

  var graphTitleSel = c.layers[1]
    .st({pointerEvents: 'none', zIndex: isMobile ? -1 : 1})
    .append('div')
    .translate([5, yMatch- 10])
    .at({fontWeight: 700})
    .st({
      fontSize: isMobile ? 12 : '', 
      zIndex: -1, 
      lineHeight: '1.2em',
      width: c.width + 20
    })

  var bodyNode = d3.select('body').node()
  function getScrollY(){
    return isNoBar ? bodyNode.scrollTop : scrollY
  }

  var topPos = p.sel.node().getBoundingClientRect().top + getScrollY()
  d3.select(isNoBar ? 'body' : window).on('scroll', update)
  update()
  function update(){
    curYear = d3.clamp(1993, p.y.invert(getScrollY() - topPos), 2018.3)

    movies.forEach(d => {
      d.active = d.yearNum <= curYear
    })
    byMovie.forEach(d => {
      d.l = _.last(d.filter(d => d.active)) || {}
      d.lgross = d.l.gross_to_date || 0
    })
    c.y.domain([0, d3.max(byMovie, d => d.lgross)])

    var topBar = _.sortBy(byMovie, d => -d.lgross)[2].lgross
    movieSel
      .classed('top', d => d.lgross >= topBar)
      .classed('hide', d => !d.lgross)
    lineSel.at({d: line})

    titleSel
      .st({opacity: 0})
      .filter(d => d.release <= curYear)
      .st({opacity: isMobile ? 0 : .4})
      .translate(d => [c.x(d.l.week_num), c.y(d.l.gross_to_date)])

    yTickSel
      .translate(c.y, 1)
      .st({opacity: d => c.y(d) >= -20 ? 1 : 0})
    var year = Math.floor(curYear)
    var monthStr = months[Math.floor((curYear - year)*12)]
    graphTitleSel.text('Top Grossing Movies as of ' + monthStr + '. ' + year)
  }

})
