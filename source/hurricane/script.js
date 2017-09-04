console.clear()

// draw points on canvas
d3.loadData('2607.csv', 'states.json', (err, [data, states]) => {
  var width = 700
  var height = 286

  var ctx = d3.select('#graphic-0')
    .html('')
    .append('canvas')
    .at({width, height})
    .node()
    .getContext('2d')

  var color = d3.scaleLinear().range(['rgba(255,0,0,0)', 'rgba(255,0,0,1)'])
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


  var color = d3.scaleLinear().range(['rgba(255,0,0,0)', 'rgba(255,0,0,1)'])
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

  var ctx = d3.select('#graphic-2')
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


  var color = d3.scaleLinear().range(['rgba(255,0,0,0)', 'rgba(255,0,0,1)'])
  data.forEach(d =>{
    ctx.beginPath()
    var [x, y] = projection([d.Lon, d.Lat])
    ctx.rect(x, y, 3, 3)
    ctx.fillStyle = color(d.Globvalue)
    ctx.fill()
  })
})


// animation first pass
d3.loadData('points.json', 'states.json', (err, [points, states]) => {
  var width = 572
  var height = width/2

  var ctx = d3.select('#graphic-3')
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
  
  var svg = d3.select('#graphic-3')
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
  var color = d3.scaleLinear().range(['rgba(255,0,0,0)', 'rgba(255,0,0,1)'])

  var times = _.uniq(_.flatten(points.map(d => d3.keys(d.vals)))).sort()
  var times = d3.range(24).map(d => '26' + d3.format('02')(d))
  var curTimeIndex = 0
  if (window.animationtimer) window.animationtimer.stop()
  window.animationtimer = d3.interval(() => {
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
})


