console.clear()
var ttSel = d3.select('body').selectAppend('div.tooltip.tooltip-hidden')


var listURLs = `https://pitchfork.com/features/lists-and-guides/7893-the-top-50-albums-of-2010/
https://pitchfork.com/features/lists-and-guides/8727-the-top-50-albums-of-2011/
https://pitchfork.com/features/lists-and-guides/9017-the-top-50-albums-of-2012/
https://pitchfork.com/features/lists-and-guides/9293-the-top-50-albums-of-2013/
https://pitchfork.com/features/lists-and-guides/9558-the-50-best-albums-of-2014/
https://pitchfork.com/features/lists-and-guides/9764-the-50-best-albums-of-2015/
https://pitchfork.com/features/lists-and-guides/9980-the-50-best-albums-of-2016/
https://pitchfork.com/features/lists-and-guides/the-50-best-albums-of-2017/
https://pitchfork.com/features/lists-and-guides/the-50-best-albums-of-2018/
https://pitchfork.com/features/lists-and-guides/best-albums-2019/`
  .split('\n')

var h1Html = d3.select('h1').text()
  .replace('Year', `<span class='h1-year'>Year</span>`)
  .replace('Decade', `<span class='h1-decade'>Decade</span>`)
d3.select('h1')
  .html(h1Html)

d3.loadData('albums.tsv', (err, res) => {
  albums = res[0]

  albums.forEach(d => {
    d.releaseYear = +d.date.split(',')[1]
    d.rank = +d.rank
    d.year = d.year.replace('.htm', '')

    if (d.artist.includes('Ariel Pink')) d.artist = 'Ariel Pink'
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

  // byYear.forEach(year => {
  //   year.forEach((d, i) => {
  //     d.yearIndex = i
  //   })
  // })


  byArtist = d3.nestBy(bySlug, d => d.artist)
  byArtist.forEach(d => {
    d.minDecadeRank = d3.min(d, d => d.decadeRank)
  })

  drawYearGrid() 
})


function drawYearGrid(){
  var colWidth = Math.floor((Math.max(980, innerWidth) - 90)/10)
  var width = colWidth*10
  var colMarginLeft =  -(width - 750)/2 + 40

  var sel = d3.select('#year-grid').html('')
    .st({width, marginLeft: colMarginLeft})

  var byYearSel = sel.appendMany('div.year-col', byYear)
    .st({width: colWidth - 10, display: 'inline-block'})

  sel.append('div.year-col')
    .st({position: 'absolute', left: -25, top: 25})
    .appendMany('div.row.album.index', d3.range(1, 51))
    .text(d => d3.format('02')(d))

  sel.append('div.year-col')
    .st({position: 'absolute', left: -32, top: 1})
    .append('div.year-rank-header')
    .html('year <br> rank')

  sel.append('div.year-col')
    .st({position: 'absolute', left: -25, top: 797})
    .append('div.year-rank-header')
    .html('unranked')

  byYearSel.append('b')
    .text(d => d.key)
    .st({cursor: 'pointer', textDecoration: 'xunderline'})
    .on('click', (d, i) => window.open(listURLs[i], '_blank'))

  var rowSel = byYearSel.appendMany('div.row.album', d => d)
    .call(d3.attachTooltip)
    .on('mouseover', d => {
      ttSel.html('')
      ttSel.append('div').append('b').text(d.artist)
      ttSel.append('i').text(d.album)
      // ttSel.append('div').text('' + d.date)
      ttSel.append('div').text(' ')
      ttSel.append('br')

      var yearRankText = d.yearRank == '999' ? 'Unranked in ' + d.year : '#' + d.yearRank + ' in ' + d.year
      var decadeRankText = d.decadeRank == '999' ? 'Unranked in the 2010s' : '#' + d.decadeRank + ' in the 2010s'

      ttSel.append('div').text(yearRankText)
      ttSel.append('div').text(decadeRankText)

      if (!d[0].spotify){
        ttSel.append('br').parent().append('div').text('not streaming on spotify')
        .st({fontFamily: 'monospace', fontSize: 13})
      }

      rowSel
        .classed('active', 0)
        .filter(e => e.artist == d.artist)
        .classed('active', 1)
    })
    .on('mouseout', d => rowSel.classed('active', 0))
    .st({background: '#dde', marginBottom: d => d.yearRank == 50 ? 20 : 1 })
    .on('click', d => {
      if (!d[0].spotify) return
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
      background: '#0ff', 
      width: d => bgScale(d.decadeRank) + '%',
      opacity: d => d.decadeRank == 999 ? 0 : 1,
      color: '#000',
    })

  rowSel.append('div.text')
    .text(d => d.artist)
    .st({
      color: d => d.decadeRank == 999 ? '#888' : '#000',
      position: 'absolute'
    })
    // .text(d => d.artist)

  // rowSel.filter(d => d.year == 2010)
  //   .append('div.year-rank')
  //   .text(d => d.decadeRank)
  //   .st({left: -20, position: 'absolute', overflow: 'visible'})




  // add swoops
  d3.select('#arrow-container').html('').append('svg')
    .st({zIndex: 100000, position: 'relative', pointerEvents: 'none'})
    .appendMany('path.swoop', [
      [[-5, 35], [colMarginLeft - 5 + colWidth/4, -150]],
      [[145, 35], [colMarginLeft + colWidth*2 - 15, -176]],
    ])
    .attr('marker-end', 'url(#arrowhead)')
    .attr('d', (d, i) => swoopyArrow().angle(Math.PI/2).clockwise(1)(d))

  // add key


  var keyRowSel = sel.append('div.year-col')
    .st({position: 'absolute', left: -32, top: -130})
    .append('div.year-rank-header')
    .html('decade <br> rank')
    .parent()
    // .appendMany('div.row.album.index', [1, 4, 16, 64, 200])
    .appendMany('div.row.album.index', [1, 5, 10, 20, 50, 100])
    // .appendMany('div.row.album.index', [1, 5, 20, 50, 100, 200])
    .st({width: colWidth, position: 'relative', top: 10})

  keyRowSel.append('div.color')
    .st({position: 'absolute'})
    .html('&nbsp;')
    .st({
      background: '#0ff', 
      width: d => bgScale(d) + '%',
      color: '#000',
    })

  keyRowSel.append('div.text')
    .text(d => d)
    .st({color: '#000', position: 'absolute', left: 2})


}













