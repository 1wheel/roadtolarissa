console.clear()
var ttSel = d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var slides = [
`
  <p>The Data Visualization Society released a survey 
`,

`Aggrarting the responses; only showing high and low self rating for each of the categoies makes this easier'`,

`
<p>The impact of this is not very high -- the yearly survey have far more detailed information -- but point to the difficulties of releasing data on the internet. 

<p>I'm conflicted about this. Two of the projects I'm proudest of at the NYT (prisons and income dots) were required access to detailed admisintstrative data. 
`

]

var colors = [
  '#DDB32B',
  '#2DB2A5',
  '#A05E9C'
]

var slideSel = d3.select('#slides').html('')
  .appendMany('div.slide', slides)
  .append('div').html(d => d)

gs = d3.graphScroll()
  .eventId('lol-scroll')
  .on('active', function(i){
    console.log(i)
  })
  .container(d3.select('#container'))
  .sections(slideSel)


var c = d3.conventions({
  sel: d3.select('html').selectAppend('div#graph').html(''),
  layers: 'dsc',
  margin: {left: 10, top: 10, right: 10, bottom: 10}
})

var ctx = c.layers[2]

if (window.data){
  init()
} else {
  // d3.loadData('https://roadtolarissa.com/data/dvs/membership.json', (err, res) => {
  //   data = res[0]
  //   init()
  // })
  d3.loadData('membership.json', (err, res) => {
    data = res[0]
    init()
  })
}

function init(){
  data = data//.slice(0, 100)


  data.forEach((d, i) => {
    d.groups = [
      {d, type: 'data', val: d.data/5},
      {d, type: 'visualization', val: d.visualization/5},
      {d, type: 'society', val: d.society/5},
    ]

    d.groups.forEach(d => {
      d.val1 = Math.round(d.val*2)/2
    })

    d.sum1 = d3.sum(d.groups, d => d.val1)

    d.val1Key = d.groups.map(d => d.val1).join(' ')
  })

  data = _.sortBy(data, d => d.sum1)
  data = _.sortBy(data, d => d.val1Key)
  byVal1 = d3.nestBy(data, d => d.val1Key)

  var s = Math.sqrt(c.width*c.height/data.length)
  var nCols = Math.floor(c.width/s)
  var r = s/2 - 1*0

  data.forEach((d, i) => {
    d.flatPos = [s*(i % nCols), s*(Math.floor(i/nCols))]
    d.i = i
  })


  var rScale = d3.scaleSqrt().range([1, r])
  var rScale = d3.scaleLinear().range([0, r])

  var arc = d3.arc()
    .outerRadius(d => rScale(d.data.val))
    .innerRadius(0)

  var pie = d3.pie()
    .sort(null)
    .value(d => 1)


  glphySel = c.svg.appendMany('g', data)
    .translate(d => d.flatPos)

  glphySel.append('circle')
    .at({
      r,
      stroke: '#ddd',
      fill: 'none',
      strokeWidth: .5,
    })

  var sliceSel = glphySel.appendMany('path', d => pie(d.groups))
    .at({
      d: arc,
      fill: (d, i) => colors[i]
    })


  gs.on('active', i => {
    console.log(i)
    if (i == 0){
      sliceSel
        // .transition().duration(10)
        // .transition().delay(d => d.data.d.i/2).duration(0)
        .at({d: arc.outerRadius(d => rScale(d.data.val))})
    }
    if (i == 1){
      sliceSel
        // .transition().duration(10)
        // .transition().delay(d => d.data.d.i/2).duration(0)
        .at({d: arc.outerRadius(d => rScale(d.data.val1))})
    }
  })

}
















