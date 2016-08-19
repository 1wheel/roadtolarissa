var ƒ = d3.f
var width = 187
var height = width/2
var colors = ['#F44336', '#2196F3', '#4CAF50', '#9C27B0', '#ccc','#FF9800', '#795548']

function sizeCanvas(sel){
  sel
      .at({width: width, height: height})
      .st({width: width*2 + 'px', height: height*2 + 'px'})
}


//set up html
var sel = d3.select('#map-container').html('')
sel.appendMany(['map', 'cotton-candy', 'melting'], 'canvas').at('id', ƒ())

//sliders
var controlSel = sel.append('div#controls')

var sliders = controlSel.appendMany('λφγ'.split(''), 'div')
sliders.append('span').text(ƒ())
var inputes = sliders.append('input')
    .at({type: 'range', min: -3, max: 3, step: .001})
    .each(function(d, i){ this.value = +!i })

//drop down
var projections = d3.keys(d3).filter(function(d){
  return d.slice(0, 3) == 'geo' && 
  !~d.indexOf('Raw') && 
  !~d.indexOf('Modified') &&
  ~(''+d3[d]).indexOf('Projection')
}).sort(d3.ascendingKey(function(d){ return d.replace('geoSinusoidal', '') }))

var menu = controlSel.append('select#menu')
    .on('change', function(){
      projection = d3[projections[this.selectedIndex]]()
        .rotate(projection.rotate())
        .fitSize([width, height], land)
      path.projection(projection)
    })

menu.appendMany(projections, 'option')
    .text(function(d){ return d.replace('geo', '') })



//set up globe
var ctx = d3.select('#map').call(sizeCanvas).node().getContext('2d')

var projection = d3.geoSinusoidal()

var path = d3.geoPath().projection(projection).context(ctx)
var land

d3.json('world-1000m.json', function(err, world){
  land = topojson.feature(world, world.objects.countries)
  projection.fitSize([width, height], land)

  var byContinent = d3.nest()
    .key(ƒ('properties', 'continent'))
    .entries(world.objects.countries.geometries)
    .map(function(d){ return topojson.merge(world, d.values) })

  byContinent.sort(d3.descendingKey(ƒ('coordinates', 'length')))

  if (window.timer) window.timer.stop()
  window.timer = d3.timer(function(t){
    var r = projection.rotate()
    controlSel.selectAll('input').each(function(d, i){
      r[i] += +this.value
    })

    projection.rotate(r)
    ctx.clearRect(0, 0, width, height)

    byContinent.forEach(function(d, i){
      ctx.fillStyle = colors[i]
      
      ctx.beginPath(), path(d), ctx.fill()
    })

    drawPoints(getPoints())
  })
})


//convert projection to pixels
var s = 1
function getPoints(){
  var img = ctx.getImageData(0, 0, width, height).data

  var pts = []
  for (var x = 0; x < width; x += s) {
    for (var y = 0; y < height; y += s) {
      var i = (x + y*width)*4
      if (img[i] > 2) pts.push([x, y, img[i], img[i + 1], img[i + 2]])
    }
  }

  return pts   
}


var ctx2 = d3.select('#cotton-candy').call(sizeCanvas)
    .node().getContext('2d')

var ctx3 = d3.select('#melting').call(sizeCanvas)
    .node().getContext('2d')


function drawPoints(pts){
  //draw top map
  ctx2.clearRect(0, 0, width, height)

  d3.nest()
    .key(ƒ(1))
    .entries(pts)
    .map(ƒ('values'))
    .forEach(function(d){
      d.forEach(function(e, i){
        e.x = i*s + Math.round(width/2 - d.length/2)
      })
    })

  d3.nest()
    .key(function(d){ return 'rgb(' + [d[2], d[3], d[4]] + ')' })
    .entries(pts)
    .forEach(function(d){
      ctx2.fillStyle = d.key
      ctx2.beginPath()
      d.values.forEach(function(d){ ctx2.rect(d.x, d[1], s, s) })
      ctx2.fill()    
  })

  //draw bot map
  ctx3.clearRect(0, 0, width, height)

  d3.nest()
    .key(ƒ(0))
    .entries(pts)
    .map(ƒ('values'))
    .forEach(function(d){
      d.forEach(function(e, i){
        e.y = i*s + Math.round(height/2 - d.length/2)
      })
    })

  d3.nest()
    .key(function(d){ return 'rgb(' + [d[2], d[3], d[4]] + ')' })
    .entries(pts)
    .forEach(function(d){
      ctx3.fillStyle = d.key
      ctx3.beginPath()
      d.values.forEach(function(d){ ctx3.rect(d[0], d.y, s, s) })
      ctx3.fill()    
  })

}



//topojson -p -q 1e3 -s .0005 world-110m.json > world-1000m.json && ll
