console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var maxMargin = .2
window.renderFns = []

d3.loadData('https://roadtolarissa.com/data/2024-wp.json', (err, [times]) => {
  window.tidy = []

  // times = times.filter(d => d.scrapeTime < '2024-11-09T11:38:35.067Z')

  times.forEach(time => {
    time.races.forEach(race => {
      race.scrapeTime = time.scrapeTime
      tidy.push(race)

      if (race.leader?.party_caucus == 'DEM'){
        race.margin = race.margin.map(d => -d).reverse()
      }

      if (race.wapo?.dem){
        var {dem, gop} = race.wapo
        race.wapoMargin = [
          calcMargin(dem['upper_09'], gop['lower_09']),
          calcMargin(dem.prediction, gop.prediction),
          calcMargin(dem['lower_09'], gop['upper_09']),
        ]
        function calcMargin(d, r){
          return (r - d)/(d + r)
        }
      } else {
        race.wapoMargin = [-maxMargin, 0, maxMargin]
        race.isFakeWapo = true
      }
    })
  })

  var byRace = d3.nestBy(tidy, d => d.state_id)
  byRace = _.sortBy(byRace, d => d.key)

  drawChamber('all')
  drawSlider()
  
  function renderIndex(index){
    renderFns.forEach(d => d(index))
  }

  function drawSlider(){
    var sel = d3.select('.slider').html('')
    var lastIndex = times.length - 1

    var timeSel = sel.append('div.time')

    var sliderSel = sel.append('input')
      .at({ type:'range', min: 0, max: lastIndex, step: 1, value: lastIndex})
      .on('input', function(){
        renderIndex(this.value)
      })

    renderFns.push(curIndex => {
      var str = new Date(times[curIndex].scrapeTime) + ''
      str = str.split('GMT')[0]
      timeSel.text(str)
    })

    renderIndex(lastIndex)
  }


  function drawChamber(chamber){
    var sel = d3.select('.chamber-' + chamber).html('')

    var width = innerWidth - 20
    var pWidth = d3.select('p').node().offsetWidth
    var marginLeft = -(width - pWidth)/2
    sel.st({width, marginLeft})
    
    var races = chamber != 'all' ? byRace.filter(d => d.key.includes(`G-${chamber.toUpperCase()}-`)) : byRace
    races.forEach(race => drawRace(sel, race, width))
  }

  function drawRace(sel, race, chamberWidth){
    var nCols = innerWidth > 800 ? 6 : Math.ceil(chamberWidth/250)
    var margin = {left: 30, right: 30, bottom: 40}
    var chartSize = Math.floor(chamberWidth/nCols - margin.left - margin.right)

    var c = d3.conventions({
      sel: sel.append('div.race'),
      width: chartSize,
      height: chartSize,
      margin,
    })

    c.x.domain([-maxMargin, maxMargin])
    c.y.domain([-maxMargin, maxMargin])

    var tickFmt = d => {
      if (!d) return '0%'
      var str = d3.format('+.0%')(d)
      if (str.includes(20)) return ''
      return (d < 0 ? 'D ' : 'R ') + str.replace('-', '+') 
    }
    c.xAxis.ticks(3).tickFormat(tickFmt)
    c.yAxis.ticks(3).tickFormat(tickFmt)
    d3.drawAxis(c)
    ggPlot(c)
    addAxisLabel(c, 'nyt', 'wapo')

    c.svg.selectAll('.tick').filter(d => d == 0).raise()
      .select('path').st({strokeWidth: 1.5, stroke: '#000'})

    var raceSlug = race.key.replace('-G', '').replace('-2024-11-08', '')
    c.svg.append('text.race-title').text(raceSlug)
      .at({textAnchor: 'middle', x: c.width/2, y: -2, fontSize: 14, fontFamily: 'monospace'})

    c.svg.appendMany('circle', race)
      .at({r: 1, fill: '#f0f'})
      .translate(d => [c.x(d.nyt[2]), c.y(d.wapoMargin[1])])

    var line = d3.line()
      .x(d => c.x(d.nyt[2]))
      .y(d => c.y(d.wapoMargin[1]))
    c.svg.append('path.data-el').at({d: line(race), fill: 'none', stroke: '#f0f', opacity: .3})

    var rectSel = c.svg.append('rect.data-el').st({opacity: .15})
    var rectBgSel = c.svg.append('rect.data-el').st({opacity: .15})
    var circleSel = c.svg.append('circle.data-el').at({r: 3, stroke: '#f0f', strokeWidth: 2, fill: 'none'})



    renderFns.push(curIndex => {
      // if (raceSlug != 'AZ-S') return
      var curData = race[curIndex]
      if (!curData ){
        rectSel.st({opacity: 0})
        circleSel.st({opacity: 0})
        return 
      }
      c.svg.classed('is-disabled', curData.isFakeWapo)

      var y = c.y(curData.wapoMargin[2])
      var height = c.y(curData.wapoMargin[0]) - y

      var x = c.x(curData.nyt[0])
      rectSel.at({y, height, x, width: c.x(curData.nyt[4]) - x})

      var x = c.x(curData.nyt[1])
      rectBgSel.at({y, height, x, width: c.x(curData.nyt[3]) - x})
      
      circleSel.at({cy: c.y(curData.wapoMargin[1]), cx: c.x(curData.nyt[2])})
    })

  }
})







function addAxisLabel(c, xText, yText, xOffset=30, yOffset=-30){
  c.svg.select('.x').append('g')
    .translate([c.width/2, xOffset])
    .append('text.axis-label')
    .text(xText)
    .at({textAnchor: 'middle'})

  c.svg.select('.y')
    .append('g')
    .translate([yOffset, c.height/2])
    .append('text.axis-label')
    .text(yText)
    .at({textAnchor: 'middle', transform: 'rotate(-90)'})
}

function ggPlot(c, isBlack=true){
  c.svg.append('rect.bg-rect')
    // .st({height: c.height, width: c.width, fill: '#eee'}).lower()

  c.svg.selectAll('.tick').selectAll('line').remove()
  c.svg.selectAll('.y .tick')
    .append('path').at({d: 'M 0 0 H ' + c.width, stroke: '#999', strokeWidth: .5})
  c.svg.selectAll('.y text').at({x: -3})
  c.svg.selectAll('.x .tick')
    .append('path').at({d: 'M 0 0 V -' + c.height, stroke: '#999', strokeWidth: .5})
}
