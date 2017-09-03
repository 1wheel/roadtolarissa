console.clear()

d3.loadData('2607.csv', 'states.json', (err, [data, states]) => {

  // chart 0
  var width = 700
  var height = 286

  var canvas = d3.select('#graphic-0')
    .html('')
    .append('canvas')
    .at({width, height})
    .node()

  var ctx = canvas.getContext('2d')

  var color = d3.scaleLinear().range(['rgba(255,0,0,0)', 'rgba(255,0,0,1)'])
  data.forEach(d =>{
    ctx.beginPath()
    ctx.fillStyle = color(d.Globvalue)
    ctx.rect(d.Hrapx, d.Hrapy, 1, 1)
    ctx.fill()
  })


  // chart 1
  !(function(){
    var width = 572
    var height = width/2
    

    var canvas = d3.select('#graphic-1')
      .html('')
      .append('canvas')
      .at({width, height})
      .node()
    var ctx = canvas.getContext('2d')

    var bounds = { 
      "type": "LineString",
      "coordinates": [ [-99.2, 27.5], [-91.1, 30.5] ]
    }

    // https://github.com/veltman/d3-stateplane#nad83--texas-south-epsg32141
    var projection = d3.geoConicConformal()
      .parallels([26 + 10 / 60, 27 + 50 / 60])
      .rotate([98 + 30 / 60, -25 - 40 / 60])
      .fitSize([width, height], bounds)
    
    var path = d3.geoPath().projection(projection)

    var svg = d3.select('#graphic-1')
      .append('svg')
      .at({width: width, height: height})

    var pathStr = path(topojson.mesh(states, states.objects.states))
    svg.append('path')
      .at({d: pathStr, fill: 'none', stroke: '#000', strokeWidth: .5})

    var color = d3.scaleLinear()
      .domain([0, 1])
      .range(['rgba(255,0,0,0)', 'rgba(255,0,0,1)'])
      
    data.forEach(d =>{
      var [x, y] = projection([d.Lon, d.Lat])

      ctx.beginPath()
      ctx.fillStyle = color(d.Globvalue)
      ctx.rect(x, y, 3, 3)
      ctx.fill()
    })

    var cities = [
      {name: 'Houston', cord: [-95.369, 29.760]},
      {name: 'Austin',  cord: [-97.743, 30.267]}
    ]
    var citySel = svg.appendMany(cities, 'g')
      .translate(d => projection(d.cord))
    citySel.append('circle').at({r: 1})
    citySel.append('text').text(d => d.name).at({textAnchor: 'middle', dy: -5})

  })()




})