console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var maxMargin = .15
window.renderFns = []

d3.loadData('https://roadtolarissa.com/data/2022-wp.json', (err, [times]) => {
  window.tidy = []
  times.forEach(time => {
    time.races.forEach(race => {
      race.scrapeTime = time.scrapeTime
      tidy.push(race)

      if (race.leader?.party_caucus == 'DEM'){
        race.margin = race.margin.map(d => -d).reverse()
      }

      if (race.wapo?.votes){
        var {dem, gop} = race.wapo.votes
        race.wapoMargin = [
          calcMargin(dem['upper_0.9'], gop['lower_0.9']),
          calcMargin(dem.pred, gop.pred),
          calcMargin(dem['lower_0.9'], gop['upper_0.9']),
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

  var byRace = d3.nestBy(tidy, d => d.nyt_id)
  byRace = _.sortBy(byRace, d => -d.key.includes('-S-'))

  drawChamber('all')
  // drawChamber('s')
  // drawChamber('h')
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
    var width = Math.floor(innerWidth/360)*360
    var colMarginLeft =  -(width - 750)/2 + 40
    var sel = d3.select('.chamber-' + chamber).html('')
      .st({width, marginLeft: colMarginLeft})

    var races = chamber != 'all' ? byRace.filter(d => d.key.includes(`G-${chamber.toUpperCase()}-`)) : byRace
    races.forEach(race => drawRace(sel, race))
  }

  function drawRace(sel, race){
    var c = d3.conventions({
      sel: sel.append('div.race'),
      width: 200,
      height: 200,
      margin: {left: 20, right: 50, bottom: 40}
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
      .select('path').st({strokeWidth: 3, xstroke: '#000'})

    var raceSlug = race.key.replace('-G', '').replace('-2022-11-08', '')
    c.svg.append('text.race-title').text(raceSlug)
      .at({textAnchor: 'middle', x: c.width/2, y: -2, fontSize: 14, fontFamily: 'monospace'})


    var rectSel = c.svg.append('rect').st({opacity: .15})
    var rectBgSel = c.svg.append('rect').st({opacity: .15})
    var circleSel = c.svg.append('circle').at({r: 3, stroke: '#f0f', strokeWidth: 2, fill: 'none'})

    renderFns.push(curIndex => {
      // if (raceSlug != 'AZ-S') return
      var curData = race[curIndex]
      if (!curData ){
        rectSel.st({opacity: 0})
        circleSel.st({opacity: 0})
        return 
      }
      c.svg.st({opacity: curData.isFakeWapo ? .4 : 1})

      var y = c.y(curData.wapoMargin[2])
      var height = c.y(curData.wapoMargin[0]) - y

      var x = c.x(curData.margin[0])
      rectSel.at({y, height, x, width: c.x(curData.margin[4]) - x})

      var x = c.x(curData.margin[1])
      rectBgSel.at({y, height, x, width: c.x(curData.margin[3]) - x})
      
      circleSel.at({cy: c.y(curData.wapoMargin[1]), cx: c.x(curData.margin[2])})
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

  c.svg.selectAll('.tick').selectAll('line').remove()
  c.svg.selectAll('.y .tick')
    .append('path').at({d: 'M 0 0 H ' + c.width, stroke: '#fff', strokeWidth: 1})
  c.svg.selectAll('.y text').at({x: -3})
  c.svg.selectAll('.x .tick')
    .append('path').at({d: 'M 0 0 V -' + c.height, stroke: '#fff', strokeWidth: 1})
}
