console.clear()
var ttSel = d3.select('body').selectAppend('div.tooltip.tooltip-hidden')


var colors = [
  '#DDB32B',
  '#2DB2A5',
  '#A05E9C'
]

var slides = [
`
<p>Over 3,000 people have joined the Data Visualization Society. The glyphs here represent their self reported skill levels at different aspects of data visualization.  

<p>The released data lists city and submission time, but doesn't include the raw responses to nine skill questions on the survey. To protect privacy, the questions were grouped into three categories--<b class='text-d'>data</b>, <b class='text-v'>visualization</b> and <b class='text-s'>society</b>--and averaged together. 
`,

`<p>Even with that dimensionality reduction, it is still hard to see patterns in the data. 

<p>We can simplify more by reducing the granularity of the data. Instead of trying to show every skill at its exact level, we can bucket them as low, medium or high. 

<p>We can see more already! Medium in all three categories is the modal choice. 

`,

`
<p>Grouping glyphs with the same bucketed skills removes noise from the chart, making it easier to pick out little insights. 

<p>We can see that high <b class='text-s'>society</b> skills are less common than <b class='text-d'>data</b> or <b class='text-v'>visualization</b> skills, for example.
`,

`<p>This method of grouping is flexable. Here I've added back some granularity, using six buckets for each skill to match the original 0-5 scale.

<p>You can see TKTK
`,

`<p>Adding even more granularity, harder to see. 600 responses are unique now.
`,

`<p>For those 600 responses, it is actually possible to reconstruct

<p>In addition to the redacted survey data, DVS also posted SVGs of all the members responses.   
`,


`<p>The impact of this is not very high -- the yearly survey have far more detailed information -- but point to the difficulties of releasing data on the internet. 

<p>I'm conflicted about this. Two of the projects I'm proudest of at the NYT (prisons and income dots) were required access to detailed administrative data. 


`

]


var slideSel = d3.select('#slides').html('')
  .appendMany('div.slide', slides)
  .append('div').html(d => d)

gs = d3.graphScroll()
  .eventId('lol-scroll')
  .container(d3.select('#container'))
  .sections(slideSel)
  .offset(innerHeight - 200)


var c = d3.conventions({
  sel: d3.select('html').selectAppend('div#graph').html(''),
  layers: 'ds',
  margin: {left: 10, top: 10, right: 10, bottom: 10}
})


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
  var nCols = Math.ceil(c.width/s)
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

  var layer0Sel = c.svg.append('g.layer0')
  var layer1Sel = c.svg.append('g.layer1')
  var layer2Sel = c.svg.append('g.layer2')


  // first two slides
  // glphySel0 = layer0Sel.appendMany('g', data)
  //   .translate(d => d.flatPos)
  //   .call(d3.attachTooltip)

  // glphySel0.append('circle')
  //   .at({
  //     r,
  //     stroke: '#ddd',
  //     fill: 'none',
  //     strokeWidth: .5,
  //   })

  // var sliceSel0 = glphySel0.appendMany('path', d => pie(d.groups))
  //   .at({
  //     d: arc,
  //     fill: (d, i) => colors[i]
  //   })



  // second slide
  rScale1 = d3.scaleSqrt()
    .domain([0, 100])
    .range([1, r*8])

  byVal1.forEach(combined => {
    combined.forEach(d => {
      d.combined1 = combined
    })


    combined.groups = combined.key.split(' ')
      .map(d => d*combined.length)

    combined.vals = combined.key.split(' ')
      .map(d => d)

    combined.r = rScale1(combined.length)
    combined.x = 100 
    combined.y = 100

    combined.mean = d3.mean(combined.vals)
    combined.variance = d3.variance(combined.vals)
  })

  byVal1 = _.sortBy(byVal1, d => d.length).reverse()

  c.y.domain([1, 0])
  c.x.domain(d3.extent(byVal1, d => d.length))

  // var sim1 = d3.forceSimulation(byVal1)
  //   .force('x', d3.forceX(c.width / 2).strength(.1))
  //   .force('y', d3.forceY(c.height / 2).strength(1))
  //   .force('collide', d3.forceCollide(d => d.r + 2).strength(1.5))
  //   .stop()

  var sim1 = d3.forceSimulation(byVal1)
    .force('x', d3.forceX(d => c.x(d.variance)).strength(.1))
    .force('x', d3.forceX(d => c.x(d.length)).strength(.1))
    .force('x', d3.forceX(c.width / 2).strength(.05))
    .force('y', d3.forceY(d => c.y(d.mean)).strength(.5))
    .force('collide', d3.forceCollide(d => d.r + 2).strength(1.5))
    .force('container', forceContainer([[0, 0],[c.width, c.height]]).strength(1.5))
    .stop()

  for (var i = 0; i < 300; ++i){
    sim1.tick()
    byVal1.forEach(d => {
      if (i % 10 != 9) return
      d.x = d3.clamp(d.r*.5, d.x, c.width - d.r*.5)
      d.y = d3.clamp(d.r*.5, d.y, c.height - d.r*.5)
    })
  }


  glphySel1 = layer1Sel.appendMany('g', byVal1)
    .translate(d => [d.x, d.y])
    .call(d3.attachTooltip)
    // .st({opacity: d => d.length == 1 ? 1 : .1})

  glphySel1.append('circle')
    .at({
      r: d => d.r,
      stroke: '#aaa',
      fill: '#f5f5f5',
      strokeWidth: .5,
    })


  glphySel1.appendMany('path', d => pie(d.groups))
    .at({
      d: arc.outerRadius(d => rScale1(d.data)),
      fill: (d, i) => colors[i]
    })





  gs.on('active', i => {
    console.log(i)
    return;
    if (i == 0){

      sliceSel0
        // .transition().duration(10)
        // .transition().delay(d => d.data.d.i/2).duration(0)
        .at({d: arc.outerRadius(d => rScale(d.data.val))})
    }
    if (i == 1){
      sliceSel0
        // .transition().duration(10)
        // .transition().delay(d => d.data.d.i/2).duration(0)
        .at({d: arc.outerRadius(d => rScale(d.data.val1))})
    }
  })

}









function forceContainer (bbox){
  var nodes, strength = 1;;

  if (!bbox || bbox.length < 2) bbox = [[0, 0], [100, 100]]


  function force(alpha) {
    var i,
        n = nodes.length,
        node,
        x = 0,
        y = 0;

    for (i = 0; i < n; ++i) {
      node = nodes[i], x = node.x, y = node.y, r = node.r;

      if (x - r < bbox[0][0]) node.vx += (bbox[0][0] - x + r)*alpha*strength
      if (y - r < bbox[0][1]) node.vy += (bbox[0][1] - y + r)*alpha*strength
      if (x + r > bbox[1][0]) node.vx += (bbox[1][0] - x - r)*alpha*strength 
      if (y + r > bbox[1][1]) node.vy += (bbox[1][1] - y - r)*alpha*strength
    }
  }

  force.initialize = function(_){
    nodes = _;
  };

  force.bbox = function(_){
    return arguments.length ? (bbox = +_, force) : bbox;
  };
  force.strength = function(_){
    return arguments.length ? (strength = +_, force) : strength;
  }

  return force;
}






