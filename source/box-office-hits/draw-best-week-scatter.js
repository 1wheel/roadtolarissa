var oscarWinners = d3.csvParse(`year,name
2021,Nomadland
2020,Parasite
2019,Green Book
2018,The Shape of Water
2017,Moonlight
2016,Spotlight
2015,Birdman
2014,12 Years a Slave
2013,Argo
2012,The Artist
2011,The King's Speech
2010,The Hurt Locker
2009,Slumdog Millionaire
2008,No Country for Old Men
2007,The Departed
2006,Crash
2005,Million Dollar Baby
2004,The Lord of the Rings: The Return of the King
2003,Chicago
2002,A Beautiful Mind
2001,Gladiator
2000,American Beauty
1999,Shakespeare in Love
1998,Titanic
1997,The English Patient
1996,Braveheart
1995,Forrest Gump
1994,Schindler’s List
1993,Unforgiven
1992,The Silence of the Lambs
1991,Dances With Wolves
1990,Driving Miss Daisy
1989,Rain Man
1988,The Last Emperor
1987,Platoon
1986,Out of Africa
1985,Amadeus
1984,Terms of Endearment
1983,Gandhi
1982,Chariots of Fire
1981,Ordinary People
1980,Kramer vs. Kramer
1979,The Deer Hunter
1978,Annie Hall
1977,Rocky
1976,One Flew over the Cuckoo's Nest
1975,The Godfather Part II
1974,The Sting
1973,The Godfather
1972,The French Connection
1971,Patton`)


window.drawBestWeekScatter = function({byMovie}){
  var isOscar = {}
  oscarWinners.forEach(d => isOscar[d.name] = d.year)
  byMovie.forEach(d => {
    d.isOscar = isOscar[d.name] && Math.abs(isOscar[d.name] - d.year) < 2
  })

  var topMovies = byMovie
    .filter(d => d.gross > 10000000)
    // .filter(d => d.gross > 200000000)
    .filter(d => 1981 < d.year && d.year < 2022)
    .filter(d => d.highestGrossPercent < .9)

  var sel = d3.select('.best-week-scatter').html('')

  var c = d3.conventions({
    sel: sel.append('div'),
    width: 800,
    height: 500,
    margin: {left: 30, bottom: 40, top: 10}
  })

  c.x.domain([1982, 2022])
  c.y.domain([0, .8])

  c.xAxis.tickFormat(d => d)
  c.yAxis.tickFormat(d3.format('.0%'))
  d3.drawAxis(c)
  util.ggPlot(c)

  var rScale = d3.scaleSqrt().domain([0, 1e9]).range([0, 10])
  var circleSel = c.svg.appendMany('circle', topMovies)
    .translate(d => [c.x(d.year + d[0].week/52), c.y(d.highestGrossPercent)])
    .at({
      r: d => rScale(d.gross),
      fill: 'rgba(0,0,0,.1)', 
      stroke: '#000',
    })
    .call(d3.attachTooltip)
    .on('mouseover', d => {
      window.ttSel.html(`
        <div>
        <b>${d.name}</b> 

        <br>
        Grossed $${d3.format(',')(Math.round(d.gross))} — 
        
        ${d3.format('.0%')(d.highestGrossPercent)} during its best week.
      `)

      var c = d3.conventions({
        sel: window.ttSel.append('div'),
        height: 100,
        width: 26*8,
        margin: {left: 40, top: 10, right: 0, bottom: 15},
      })

      var movie = d
      c.x.domain([0, movie.length])
      c.x.domain([0, 26])
      c.y.domain([0, d3.max(movie, d => d.gross)])

      c.xAxis.ticks(0)
      c.yAxis.ticks(3).tickFormat(d => '$' + d/1000000 + 'M')
      d3.drawAxis(c)

      c.svg.select('.x').append('text')
        .text('Weeks since release →')
        .at({x: c.x(0), y: 12, textAnchor: 'start'})

      c.svg.selectAll('.y .tick line').at({x1: -3})

      c.svg.appendMany('rect', movie)
        .at({
          x: (d, i) => c.x(i),
          y: d => Math.min(c.height - 1, c.y(d.gross)) + 1,
          height: d => Math.max(1, c.height - c.y(d.gross)),
          width: c.x(1) - c.x(0) - 1,
        })



    })



  var state = {minGross: 200000000, isOscar: true}

  function renderCircles(){
    circleSel
      .st({display: d => d.gross <= state.minGross ? 'none' : ''})

    if (state.isOscar){
      circleSel
        .filter(d => d.isOscar)
        .at({stroke: '#f0f', fill: 'rgba(255,0,255,.2)'})
        .raise()
    } else{
      circleSel.order((a, b) => a.gross - b.gross)
    }
  }

  // renderCircles()


  function addSliders(){
    var width = 140
    var height = 30
    var color = '#000'

    var sliders = [
      {key: 'minGross', label: 'Minimum Gross', r: [10000000, 200000000]},
    ]
    sliders.forEach(d => {
      d.value = state[d.key]
      d.xScale = d3.scaleLinear().range([0, width]).domain(d.r).clamp(1)
    })

    var svgSel = sel
      // .st({marginTop: 5, marginBottom: 5})
      .appendMany('div.slider-container', sliders)
      .st({width: 140})
      .translate((c.width - 140)/2, 0)
      .append('svg').at({width, height})
      .append('g').translate([10, 25])

    var sliderSel = svgSel
      .on('click', function(d){
        d.value = d.xScale.invert(d3.mouse(this)[0])
        renderSliders(d)
      })
      .classed('slider', true)
      .st({cursor: 'pointer'})

    var textSel = sliderSel.append('text')
      .at({y: -15, fontWeight: 300, textAnchor: 'middle', x: 140/2})
      .st({fontSize: 12, fontFamily: 'sans-serif'})

    sliderSel.append('rect')
      .at({width, height, y: -height/2, fill: 'rgba(0,0,0,0)'})

    sliderSel.append('path').at({
      d: `M 0 -.5 H ${width}`, 
      stroke: color,
      strokeWidth: 1
    })

    var leftPathSel = sliderSel.append('path').at({
      d: `M 0 -.5 H ${width}`, 
      stroke: color,
      strokeWidth: 3
    })

    var drag = d3.drag()
      .on('drag', function(d){
        var x = d3.mouse(this)[0]
        d.value = d.xScale.invert(x)
        
        renderSliders(d)
      })

    var circleSel = sliderSel.append('circle').call(drag)
      .at({r: rScale(200000000) + 2, stroke: '#000'})

    var innerCircleSel = sliderSel.append('circle').call(drag)
      .at({fill: '#ccc'})

    function renderSliders(d){
      if (d) state[d.key] = d.value

      circleSel
        .at({cx: d => d.xScale(d.value)})
      innerCircleSel
        .at({cx: d => d.xScale(d.value), r: rScale(state.minGross)})
      leftPathSel.at({d: d => `M 0 -.5 H ${d.xScale(d.value)}`})
      textSel
        // .at({x: d => d.xScale(d.value)})
        .text(d => 'Minimum Gross: ' + d3.format('$,')(Math.round(d.value)))
      renderCircles()
    }
    renderSliders()
  }
  addSliders()

}


if (window.init) window.init()