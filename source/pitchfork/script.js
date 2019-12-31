console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')



d3.loadData('albums.tsv', (err, res) => {
  albums = res[0]

  albums.forEach(d => {
    d.releaseYear = +d.date.split(',')[1]
    d.rank = +d.rank
    d.year = d.year.replace('.htm', '')
  })

  byDup = d3.nestBy(albums, d => d.year + d.rank).filter(d => d.length > 1)
  byDup.forEach(dup => {
    dup.forEach((d, i) => d.dupRemove = i)
  })

  albums = albums.filter(d => !d.dupRemove)


  bySlug = d3.nestBy(
    albums.filter(d => d.year != '2010-2014'), 
    d => d.slug
  )
  
  bySlug.forEach(d => {
    d.decadeRank = 999
    d.yearRank = 999

    d.year = d[0].releaseYear
    d.artist = d[0].artist
    d.album = d[0].album
    d.genre = d[0].genre
    d.date = d[0].date
    // d.slug = d[0].slug
    delete d.key


    d.forEach(e => {
      if (e.year == '2010-2019'){
        d.decadeRank = e.rank
      } else {
        d.yearRank = e.rank
        d.year = +e.year
      }
    })

    if (d[0].slug == 'Lady Gaga - The Fame Monster') d.year = 2010
  })

  bySlug = _.sortBy(bySlug, d => d.yearRank*10000 + d.decadeRank)

  byYear = d3.nestBy(bySlug, d => d.year)
  byYear = _.sortBy(byYear, d => d.key)
    .filter(d => d.key > 2009)

  byYear.forEach(year => {
    year.forEach((d, i) => {
      d.yearIndex = i
    })
  })


  byArtist = d3.nestBy(bySlug, d => d.artist)


  drawYearGrid() 
})




function drawYearGrid(){


  var colorScale = d3.scaleSequential(d3.interpolateTurbo)
    .domain([250, 1])

  var background = d => d.decadeRank == 999 ? '#eee' : colorScale(d.decadeRank)
  var color = d => d.decadeRank == 999 ? '#999' : d.decadeRank > 40 ? '#000' : '#eee'


  var colorScale = d3.scaleSequential(d3.interpolateMagma)
    .domain([250, 1])

  var background = d => d.decadeRank == 999 ? '#eee' : colorScale(d.decadeRank)
  var color = d => d.decadeRank == 999 ? '#999' : d.decadeRank < 100 ? '#000' : '#777'

  var colWidth = Math.floor((innerWidth - 40)/10)
  var width = colWidth*10

  var sel = d3.select('#year-grid').html('')
    .st({width, marginLeft: -(width - 750)/2 + 40/2})

  var byYearSel = sel.appendMany('div.year-col', byYear)
    .st({width: colWidth - 10, display: 'inline-block'})

  sel
    .append('div.year-col')
    .st({position: 'absolute', left: -25, top: 25})
    .appendMany('div.row.album.index', d3.range(1, 51))
    .text(d => '' + d3.format('02')(d))

  byYearSel.append('b').text(d => d.key)

  var rowSel = byYearSel.appendMany('div.row.album', d => d)
    .on('mouseover', d => {
      rowSel
        .classed('active', 0)
        .filter(e => e.artist == d.artist)
        .classed('active', 1)
    })
    .on('mouseout', d => rowSel.classed('active', 0))
    .call(d3.attachTooltip)
    .st({background: '#dde', marginBottom: d => d.yearRank == 50 ? 20 : 1 })
    .on('click', d => {
      // console.log(d[0].spotify)
      window.open('http://open.spotify.com/album/' + d[0].spotify, '_blank')
      // window.open('spotify:show/' + d[0].spotify, '_blank')
    })

  var bgScale = d3.scaleLinear()
    .domain([1, 200]).range([100, 10])
    .domain([1, 20, 200]).range([100, 50, 10])
    .domain([1, 10, 200, 201]).range([100, 50, 10, 0])

  var bgScale = d3.scalePow()
    .domain([1, 200]).range([100, 1]).exponent(.01)

  var bgScale = d3.scaleLog()
    .domain([1, 200]).range([100, 1])

  rowSel.append('div.color')
    .st({position: 'absolute'})
    .html('&nbsp;')
    .st({
      background, 
      background: '#0ff', 
      width: d => bgScale(d.decadeRank) + '%',
      opacity: d => d.decadeRank == 999 ? 0 : 1,
      color: '#000',
    })

  rowSel.append('div.text')
    .text(d => d.artist)
    .st({
      color,
      color: d => d.decadeRank == 999 ? '#888' : '#000',
      position: 'absolute'
    })
    // .text(d => d.artist)

  // rowSel.filter(d => d.year == 2010)
  //   .append('div.year-rank')
  //   .text(d => d.decadeRank)
  //   .st({left: -20, position: 'absolute', overflow: 'visible'})
}





