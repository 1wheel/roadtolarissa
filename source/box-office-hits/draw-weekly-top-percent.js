var annotations = [
  {key: '1982 20', align: 'r', str: 'Conan'},
  {key: '1984 21', align: '', str: 'Temple of Doom'},
  {key: '1987 21', align: 'l', str: 'Beverly Hills Cop II'},
  {key: '1992 20', align: 'l', str: 'Lethal Weapon 3'},
  {key: '1984 21', align: '', str: 'Temple of Doom'},
  {key: '1994 51', align: '', str: 'Street Fighter'},
  {key: '1996 19', align: '', str: 'Twister'},
  {key: '2002 18', align: '', str: 'Spider-Man'},
  {key: '2007 18', align: 'l', str: 'Spider-Man 3'},
  {key: '2010 19', align: '', str: 'Iron Man 2'},
  {key: '2012 18', align: 'l', str: 'The Advengers'},
  {key: '2015 18', align: 'l', str: 'Age of Ultron'},
  {key: '2018 17', align: '', str: 'Infinity War', y: -1},
  {key: '2019 17', align: 'l', str: 'Avengers: Endgame', y: 8, x: -5},
  {key: '2021 51', align: 'l', weight: 700, str: 'Spider-Man: No Way Home'},
  {key: '1992 25', align: 'l', str: 'Batman Returns'},
  {key: '1996 19', align: '', str: 'Twister'},
  {key: '1993 24', align: 'l', str: 'Jurassic Park'},
  {key: '1996 19', align: '', str: 'Twister'},
  {key: '1996 19', align: '', str: 'Twister'},
]
var key2annotation = {}
annotations.forEach(d => key2annotation[d.key] = d)

window.drawWeeklyTopPercent = function({byWeek, byMovie}){
  var sel = d3.select('.weekly-top-percent').html('')
  
  var c = d3.conventions({
    sel: sel.append('div'),
    width: 800,
    height: 500,
    margin: {left: 30, bottom: 40, top: 10}
  })

  c.sel.append('h3')


  c.x.domain([1982, 2022])

  c.xAxis.tickFormat(d => d)
  c.yAxis.tickFormat(d3.format('.0%'))
  d3.drawAxis(c)
  util.ggPlot(c)

  c.svg.select('.y .tick:last-child')
    .append('text')
    .text(`of Weekend Box Office Taken by The Top Grossing Movie`)
    .text(`of weekend's box office taken by the top grossing movie`)
    .at({textAnchor: 'start', dy: '.33em'})
    .parent()
    .select('path').at({d: `M ${c.x(1994)} 0 H ${c.width}`})

  byWeek.forEach(d => d.annotation = key2annotation[d.year + ' ' + d.week])

  var circleSel = c.svg.appendMany('circle', byWeek)
    .translate(d => [c.x(d.year + d.week/52), c.y(d[0].percent)])
    .at({r: 2, fill: 'rgba(0,0,0,0)', stroke: '#000'})
    .st({display: d => d.isHidden ? 'none' : ''})
    .call(d3.attachTooltip)
    .st({opacity: d => d.gross > 10000000 ? 1 : .1})
    .on('mouseover', week => {
      var movie = byMovie.idLookup[week[0].id].filter(d => d.isTop)

      hoverCircleSel
        .at({opacity: 0})
        .filter(i => movie[i])
        .at({opacity: 1})
        .translate(i => [
          c.x(movie[i].year + movie[i].week/52), 
          c.y(movie[i].percent)
        ])

      var dateStr = d3.timeFormat('%Y-%m-%d')(d3.timeParse('%Y %U')(week.year + ' ' + week.week))
      var dateStr = d3.timeFormat('%B %d, %Y')(d3.timeParse('%Y %U')(week.year + ' ' + week.week))
      var dateStr = d3.timeFormat('%b %d')(d3.timeParse('%Y %U')(week.year + ' ' + week.week))

      window.ttSel.html(`
        <div>
        <b>${week.top}</b> 

        <br>
        $${d3.format(',')(Math.round(week[0].gross))} 
        gross on the weekend of ${dateStr} — <br>
        ${d3.format('.0%')(week[0].percent)} of the domestic box office.
      `)

      console.log(week.year + ' ' + week.week)
    })
    .at({strokeWidth: d => d.annotation?.weight ? 2 : ''})

  var hoverCircleSel = c.svg.appendMany('circle', d3.range(60))
    .at({fill: '#f0f', stroke: '#f0f', fillOpacity: .4, opacity: 0, r: 4, pointerEvents: 'none'})


  c.svg.appendMany('text.annotation', byWeek.filter(d => d.annotation))
    .translate(d => [c.x(d.year + d.week/52), c.y(d[0].percent)])
    .text(d => d.annotation.str)
    .at({
      textAnchor: d => ({l: 'end', r: 'start'}[d.annotation.align] || 'middle'),
      dy: -5,
      x: d => d.annotation.x || 0,
      y: d => d.annotation.y || 0,
      fontWeight: d => d.annotation.weight || '',
    })

}

if (window.init) window.init()
