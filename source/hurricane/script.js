console.clear()
if (window.animationtimer) window.animationtimer.stop()
if (window.accumulationtimer) window.accumulationtimer.stop()
if (window.circletimer) window.circletimer.stop()
if (window.clicktimer) window.clicktimer.stop()



// draw points on canvas
d3.loadData('2607.csv', 'states.json', (err, [data, states]) => {
  var width = 700
  var height = 500

  var ctx = d3.select('#graphic-0')
    .html('')
    .append('canvas')
    .at({width, height})
    .node()
    .getContext('2d')

  var color = d3.scaleLinear().range(['rgba(255,0,255,0)', 'rgba(255,0,255,1)'])
  data.forEach(d =>{
    ctx.beginPath()
    ctx.fillStyle = color(d.Globvalue)
    ctx.rect(d.Hrapx, d.Hrapy, 1, 1)
    ctx.fill()
  })
})


// project points and add state shapefile
d3.loadData('2607.csv', 'states.json', (err, [data, states]) => {
  var width = 572
  var height = width/2
  
  var ctx = d3.select('#graphic-1')
    .html('')
    .append('canvas')
    .at({width, height})
    .node()
    .getContext('2d')

  var projection = d3.geoConicConformal()
    .parallels([26 + 10 / 60, 27 + 50 / 60])
    .rotate([98 + 30 / 60, -25 - 40 / 60])
    .fitSize([width, height], { 
      "type": "LineString", "coordinates": [[-99.2, 27.5], [-91.1, 30.5]]
    })
  
  var svg = d3.select('#graphic-1')
    .append('svg')
    .at({width: width, height: height})

  var path = d3.geoPath().projection(projection)
  var pathStr = path(topojson.mesh(states, states.objects.states))
  svg.append('path')
    .at({d: pathStr, fill: 'none', stroke: '#000', strokeWidth: .5})


  var color = d3.scaleLinear().range(['rgba(255,0,255,0)', 'rgba(255,0,255,1)'])
  data.forEach(d =>{
    var [x, y] = projection([d.Lon, d.Lat])
    ctx.beginPath()
    ctx.rect(x, y, 3, 3)
    ctx.fillStyle = color(d.Globvalue)
    ctx.fill()
  })
})



// add an ocean mask and city labels
d3.loadData('2607.csv', 'states.json', (err, [data, states]) => {
  var width = 572
  var height = width/2

  var ctx = d3.select('#graphic-2').html('')
    .append('canvas')
    .at({width, height})
    .node()
    .getContext('2d')

  var projection = d3.geoConicConformal()
    .parallels([26 + 10 / 60, 27 + 50 / 60])
    .rotate([98 + 30 / 60, -25 - 40 / 60])
    .fitSize([width, height], { 
      "type": "LineString", "coordinates": [[-99.2, 27.5], [-91.1, 30.5]]
    })
  
  var svg = d3.select('#graphic-2')
    .append('svg')
    .at({width: width, height: height})

  var path = d3.geoPath().projection(projection)

  var pathStr = path(topojson.feature(states, states.objects.states))
  var mask = svg.append('mask#ocean')
  mask.append('rect').at({width, height, fill: '#fff'})
  mask.append('path').at({d: pathStr, fill: '#000'})
  svg.append('rect').at({mask: 'url(#ocean)', width, height, fill: '#fff'})

  pathStr = path(topojson.mesh(states, states.objects.states))
  svg.append('path')
    .at({d: pathStr, fill: 'none', stroke: '#000', strokeWidth: .5})

  var cities = [
    {name: 'Houston',     cord: [-95.369, 29.760]},
    {name: 'Austin',      cord: [-97.743, 30.267]},
    {name: 'San Antonio', cord: [-98.493, 29.424]}
  ]
  var citySel = svg.appendMany(cities, 'g')
    .translate(d => projection(d.cord))
  citySel.append('circle').at({r: 1})
  citySel.append('text').text(d => d.name).at({textAnchor: 'middle', dy: -5})


  var color = d3.scaleLinear().range(['rgba(255,0,255,0)', 'rgba(255,0,255,1)'])
  data.forEach(d =>{
    ctx.beginPath()
    var [x, y] = projection([d.Lon, d.Lat])
    ctx.rect(x, y, 3, 3)
    ctx.fillStyle = color(d.Globvalue)
    ctx.fill()
  })
})



d3.loadData('points.json', 'states.json', (err, [points, states]) => {
  animation(points, states)
  accumulation(points, states)
  circles(points, states)
})

  

function animation(points, states){
  var width = 572
  var height = width/2
  var sel = d3.select('#graphic-3').html('')
  var ctx = sel
    .append('canvas')
    .at({width, height})
    .node()
    .getContext('2d')

  var projection = d3.geoConicConformal()
    .parallels([26 + 10 / 60, 27 + 50 / 60])
    .rotate([98 + 30 / 60, -25 - 40 / 60])
    .fitSize([width, height], { 
      "type": "LineString", "coordinates": [[-99.2, 27.5], [-91.1, 30.5]]
    })
  
  var svg = sel
    .append('svg')
    .at({width: width, height: height})

  var path = d3.geoPath().projection(projection)

  var pathStr = path(topojson.feature(states, states.objects.states))
  var mask = svg.append('mask#ocean')
  mask.append('rect').at({width, height, fill: '#fff'})
  mask.append('path').at({d: pathStr, fill: '#000'})
  svg.append('rect').at({mask: 'url(#ocean)', width, height, fill: '#fff'})

  pathStr = path(topojson.mesh(states, states.objects.states))
  svg.append('path')
    .at({d: pathStr, fill: 'none', stroke: '#000', strokeWidth: .5})

  var cities = [
    {name: 'Houston',     cord: [-95.369, 29.760]},
    {name: 'Austin',      cord: [-97.743, 30.267]},
    {name: 'San Antonio', cord: [-98.493, 29.424]}
  ]
  var citySel = svg.appendMany(cities, 'g')
    .translate(d => projection(d.cord))
  citySel.append('circle').at({r: 1})
  citySel.append('text').text(d => d.name).at({textAnchor: 'middle', dy: -5})

  window.points = points
  var color = d3.scaleLinear().range(['rgba(255,0,255,0)', 'rgba(255,0,255,1)'])

  var times = _.uniq(_.flatten(points.map(d => d3.keys(d.vals)))).sort()
  var curTimeIndex = 0
  window.animationtimer = d3.interval(() => {
    var top = sel.node().getBoundingClientRect().top
    if (top < -500 || innerHeight < top) return

    drawTime(times[curTimeIndex++ % times.length])
  }, 200)

  function drawTime(time){
    ctx.clearRect(0, 0, width, height)
    points.filter(d => d.vals[time]).forEach(d =>{
      ctx.beginPath()
      var [x, y] = projection([d.lon, d.lat])
      ctx.rect(x, y, 3, 3)
      ctx.fillStyle = color(d.vals[time])
      ctx.fill()
    })
  }
}



function accumulation(points, states){
  var width = 572
  var height = width/2
  var sel = d3.select('#graphic-4').html('')

  var ctx2 = sel
    .append('canvas')
    .at({width, height})
    .node()
    .getContext('2d')

  var ctx = sel
    .append('canvas')
    .at({width, height})
    .node()
    .getContext('2d')

  var projection = d3.geoConicConformal()
    .parallels([26 + 10 / 60, 27 + 50 / 60])
    .rotate([98 + 30 / 60, -25 - 40 / 60])
    .fitSize([width, height], { 
      "type": "LineString", "coordinates": [[-99.2, 27.5], [-91.1, 30.5]]
    })
  
  var svg = sel
    .append('svg')
    .at({width: width, height: height})

  var path = d3.geoPath().projection(projection)

  var pathStr = path(topojson.feature(states, states.objects.states))
  var mask = svg.append('mask#ocean')
  mask.append('rect').at({width, height, fill: '#fff'})
  mask.append('path').at({d: pathStr, fill: '#000'})
  svg.append('rect').at({mask: 'url(#ocean)', width, height, fill: '#fff'})

  pathStr = path(topojson.mesh(states, states.objects.states))
  svg.append('path')
    .at({d: pathStr, fill: 'none', stroke: '#000', strokeWidth: .5})

  var cities = [
    {name: 'Houston',     cord: [-95.369, 29.760]},
    {name: 'Austin',      cord: [-97.743, 30.267]},
    {name: 'San Antonio', cord: [-98.493, 29.424]}
  ]
  var citySel = svg.appendMany(cities, 'g')
    .translate(d => projection(d.cord))
  citySel.append('circle').at({r: 1})
  citySel.append('text').text(d => d.name).at({textAnchor: 'middle', dy: -5})

  var color = d3.scaleLinear().range(['rgba(255,0,255,0)', 'rgba(255,0,255,1)'])

  var totalColor = d => d3.interpolateYlGnBu(d / 24)

  points.forEach(function(d){
    var total = 0
    d.totals = {}
    for (key in d.vals) {
      total += d.vals[key]
      d.totals[key] = total
    }

    d.pos = projection([d.lon, d.lat])
  })

  var times = _.uniq(_.flatten(points.map(d => d3.keys(d.vals)))).sort()
  var curTimeIndex = 0
  window.accumulationtimer = d3.interval(() => {
    var top = sel.node().getBoundingClientRect().top
    if (top < -500 || innerHeight < top) return

    drawTime(times[curTimeIndex++ % times.length])
  }, 200)

  function drawTime(time){
    ctx.clearRect(0, 0, width, height)
    if (time == times[0]) ctx2.clearRect(0, 0, width, height)

    points.filter(d => d.vals[time]).forEach(d =>{
      ctx2.beginPath()
      ctx2.rect(d.pos[0], d.pos[1], 3, 3)
      ctx2.fillStyle = totalColor(d.totals[time])
      ctx2.fill()

      ctx.beginPath()
      ctx.rect(d.pos[0], d.pos[1], 3, 3)
      ctx.fillStyle = color(d.vals[time])
      ctx.fill()

    })
  }

  // code for exploding 3d 
  var stacked = true
  sel.on('click', () => setLayering() || window.clicktimer.stop())
  setLayering()
  function setLayering(){
    stacked = !stacked
    var t = +stacked 
    sel.selectAll('canvas, svg')
      .st({
        'transform': (d, i) => {
          return `
            translate(0px, ${-t*5 - i*t*60}px)
            rotateX(${t*60}deg)
            rotateZ(${t*-30}deg)
            scale(1.0)
          `
        },
        background: `rgba(0,0,0,${t*.05})`,
        border: `1px solid rgba(0,0,0,${t})`,
        overflow: 'hidden'
    })
  }

  window.clicktimer = d3.interval(setLayering, 5000)
}



function circles(points, states){
  var width = 572
  var height = width/2
  var sel = d3.select('#graphic-5').html('')

  var ctx2 = sel
    .append('canvas').at({width, height})
    .node().getContext('2d')

  var ctx = sel
    .append('canvas').at({width, height})
    .node().getContext('2d')

  var projection = d3.geoConicConformal()
    .parallels([26 + 10 / 60, 27 + 50 / 60])
    .rotate([98 + 30 / 60, -25 - 40 / 60])
    .fitSize([width, height], { 
      "type": "LineString", "coordinates": [[-99.2, 27.5], [-91.1, 30.5]]
    })
  
  var svg = sel.append('svg').at({width: width, height: height})

  var path = d3.geoPath().projection(projection)

  var pathStr = path(topojson.feature(states, states.objects.states))
  var mask = svg.append('mask#ocean')
  mask.append('rect').at({width, height, fill: '#fff'})
  mask.append('path').at({d: pathStr, fill: '#000'})
  svg.append('rect').at({mask: 'url(#ocean)', width, height, fill: '#fff'})

  pathStr = path(topojson.mesh(states, states.objects.states))
  svg.append('path')
    .at({d: pathStr, fill: 'none', stroke: '#000', strokeWidth: .5})

  var cities = [
    {name: 'Houston',     cord: [-95.369, 29.760]},
    {name: 'Austin',      cord: [-97.743, 30.267]},
    {name: 'San Antonio', cord: [-98.493, 29.424]}
  ]
  var citySel = svg.appendMany(cities, 'g')
    .translate(d => projection(d.cord))
  citySel.append('circle').at({r: 1})
  citySel.append('text').text(d => d.name).at({textAnchor: 'middle', dy: -5})

  var color = d3.scaleLinear().range(['rgba(0,0,0,0)', 'rgba(0,0,0,1)'])
  var totalColor = d => d3.interpolateYlGnBu(d / 24)

  points = points.filter(d => d.px % 2 && d.py % 2)
  points.forEach(function(d){
    var total = 0
    d.totals = {}
    for (key in d.vals) {
      total += d.vals[key]
      d.totals[key] = total
    }

    d.pos = projection([d.lon, d.lat])
  })

  var times = _.uniq(_.flatten(points.map(d => d3.keys(d.vals)))).sort()
  var curTimeIndex = 0
  window.circletimer = d3.interval(() => {
    var top = sel.node().getBoundingClientRect().top
    if (top < -500 || innerHeight < top) return

    drawTime(times[curTimeIndex++ % times.length])
  }, 200)

  function drawTime(time){
    ctx.clearRect(0, 0, width, height)
    if (time == times[0]) ctx2.clearRect(0, 0, width, height)

    ctx.lineWidth = .3
    points.filter(d => d.vals[time]).forEach(d =>{
      ctx2.beginPath()
      ctx2.rect(d.pos[0] - 3, d.pos[1] - 3, 6, 6)
      ctx2.fillStyle = totalColor(d.totals[time])
      ctx2.fill()

      var r = Math.sqrt(d.vals[time])      
      ctx.beginPath()
      ctx.strokeStyle = color(d.vals[time])
      ctx.moveTo(d.pos[0] + r, d.pos[1])
      ctx.arc(d.pos[0], d.pos[1], r, 0, 2 * Math.PI)
      ctx.stroke()
    })
  }
}



