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

<p>The released data lists city and submission time, but doesn't include the raw responses to nine skill questions on the survey. To protect privacy, the questions were combined into three categories--<b class='text-d'>data</b>, <b class='text-v'>visualization</b> and <b class='text-s'>society</b>--and averaged together. 
`,

`<p>Even with that dimensionality reduction, it is still hard to see patterns in the data. 

<p>We can simplify more by reducing the granularity of the data. Instead of trying to show every skill at its exact level, we can bucket them as low, medium or high. 

<p>We can see more already! Medium in all three categories is the modal choice. 

`,

`
<p>Grouping glyphs with the same bucketed skills removes noise from the chart, making it easier to pick out little insights. 

<p>We can see that high <b class='text-s'>society</b> skills are less common than <b class='text-d'>data</b> or <b class='text-v'>visualization</b> skills, for example.
`,

`<p>This method of grouping is flexable. Here I've added back some granularity, using six buckets for each skill to match the original 0-5 scale. All 0s are way more common than straight 5s.

<p>In the biggest groups all the skills are within a point of each other. More variance isn't as common; I think there's a high <b class='text-d'>data</b> / <b class='text-v'>visualization</b> and low <b class='text-s'>society</b> group with just me in it!

<p>In all there are *circle* 28 groups here with just one person in them.
`,

`<p>Adding back even more granularity—remember each slice skill slice repesents the average of three questions, so fractional values are possible—we can see the 600 people who have unique combination of averaged skills.
`,

`<p>In addition to the redacted survey data, DVS also created PNG and SVG badges visualizing every member's response to the nine question. Here's a bit of one:

<xmp>
<path fill="#ddb32b" d="M49,0L93,74L7,76Z"/> 
<path fill="#2db2a5" d="M50,36L62,56L38,57Z"/> 
<path fill="#A05E9C" d="M55,18L78,67L98,75Z"/> 
</xmp>

<p>By extracted the nine raw responses from the SVGs, I was able to link them to submission times and locations by calculing the skill category averages—data that was intentially not published.    

<p>
`,

`<p>Signifignelty more detailed infomation about the visualzation community has been published on the internet. The impact of this is quite low, but does point to the difficulties of releasing data on the internet. 

<p>I'm conflicted about this. Two of the projects I'm proudest of at the NYT (prisons and income dots) required access to detailed administrative data. 

<p>One common solution, k-anonymity, selectivly reduce the granularity of the released data to guarantee that they'll always be several people in any given grouping. This gets tricky with higher dimensional data. 

<p>The state of the art, differential privacy, uses random noise and cryptographic math to release summary statistics while no leaking indiviudal responses. I'm not aware of an <a href='http://blog.mrtz.org/2015/03/13/practicing-differential-privacy.html'>easy way</a> to use it though.

<p>In this instance, the much maligned security through obscurity would have been suffient. If the badges were only released as PNGs I definently wouldn't have taken the time to parse them. 



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
  margin: {left: 20, top: 10, right: 10, bottom: 10}
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
      d.val2 = Math.round(d.val*2)/2
      d.val6 = Math.round(d.val*5)/5
      d.val9 = d.val
    })

    d.val2Key = d.groups.map(d => d.val2).join(' ')
    d.val6Key = d.groups.map(d => d.val6).join(' ')
    d.val9Key = d.groups.map(d => d.val9).join(' ')
  })

  data = _.sortBy(data, d => d3.sum(d.groups, d => d.val2))
  data = _.sortBy(data, d => d.val2Key)
  byVal2 = d3.nestBy(data, d => d.val2Key)
  byVal6 = d3.nestBy(data, d => d.val6Key)
  byVal9 = d3.nestBy(data, d => d.val9Key)

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

  layer0Sel = c.svg.append('g.layer0')
  layer2Sel = c.svg.append('g.layer2')
  layer6Sel = c.svg.append('g.layer6')
  layer9Sel = c.svg.append('g.layer9')


  // first two slides
  glphySel0 = layer0Sel.appendMany('g', data)
    .translate(d => d.flatPos)
    .call(d3.attachTooltip)

  glphySel0.append('circle')
    .at({
      r,
      stroke: '#ddd',
      fill: 'none',
      strokeWidth: .5,
    })

  var sliceSel0 = glphySel0.appendMany('path', d => pie(d.groups))
    .at({
      d: arc,
      fill: (d, i) => colors[i]
    })


  function runSim(array, key, numTicks){
    array.forEach(combined => {
      combined.forEach(d => {
        d[key] = combined
      })

      combined.vals = combined.key.split(' ').map(d => d)
      combined.groups = combined.vals.map(d => d*combined.length)
      combined.r = rScale1(combined.length)

      combined.mean = d3.mean(combined.vals)

      combined.count = combined.length
    })

    array = _.sortBy(array, d => d.length).reverse()

    var total = 0
    array.slice().reverse().forEach((d, i) => {
      total += d.length
      d.total = total
    })

    c.y.domain([1, 0])
    c.x.domain(d3.extent(array, d => d.length))
    c.x.domain([0, data.length])

    // var sim1 = d3.forceSimulation(byVal2)
    //   .force('x', d3.forceX(c.width / 2).strength(.1))
      // .force('x', d3.forceX(d => c.x(d.variance)).strength(.1))
      // .force('x', d3.forceX(d => c.x(d.length)).strength(.1))
    //   .force('y', d3.forceY(c.height / 2).strength(1))
    //   .force('collide', d3.forceCollide(d => d.r + 2).strength(1.5))
    //   .stop()

    if (key == 'combined9'){
      array.forEach(d => {
        if (d.length > 1) return

        d.x = Math.random()*c.width
        d.y = Math.random()*c.height
      })
      array = array.filter(d => d.length > 1)
    }

    var xForce = key == 'combined2' ? 
      d3.forceX(c.width / 2).strength(.05) :
      d3.forceX(d => c.x(d.total)).strength(.3)

    var sim = d3.forceSimulation(array)
      .force('x', xForce)
      .force('y', d3.forceY(d => c.y(d.mean)).strength(.5))
      .force('collide', d3.forceCollide(d => d.r + 2).strength(1.5))
      .force('container', forceContainer([[0, 0],[c.width, c.height]]).strength(1.5))
      .stop()

    for (var i = 0; i < numTicks; ++i){
      sim.tick()
      array.forEach(d => {
        if (i % 10 != 9) return
        d.x = d3.clamp(d.r*.5, d.x, c.width - d.r*.5)
        d.y = d3.clamp(d.r*.5, d.y, c.height - d.r*.5)
      })
    }

  }




  rScale1 = d3.scaleSqrt()
    .domain([0, 100])
    .range([1, r*8])

  function randCirclePos(){
    var r0 = 1
    var r1 = 1

    while (r0*r0 + r1*r1 > 1){
      r0 = Math.random()*2 - 1
      r1 = Math.random()*2 - 1
    }

    return [r0, r1]
  }

  // third slide
  runSim(byVal2, 'combined2', 100)
  data.forEach(d => {
    var c = d.combined2

    var [r0, r1] = randCirclePos()
    d.pos2 = [r0*(c.r - r) + c.x, r1*(c.r - r) + c.y]
  })
  _.sortBy(byVal2, d => d[0].i).forEach((d, i) => {
    d.animationIndex = i
  })

  glphySel2 = layer2Sel.appendMany('g', byVal2)
    .translate(d => [d.x, d.y])
    .call(d3.attachTooltip)

  glphySel2.append('circle.combined')
    .at({r: d => d.r})
    .st({stroke: d => d.count == 1 && d[0].match ? 'red' : ''})

  glphySel2.appendMany('path', d => pie(d.groups))
    .at({
      d: arc.outerRadius(d => rScale1(d.data)),
      fill: (d, i) => colors[i]
    })


  // fourth slide
  runSim(byVal6, 'combined6', 300)

  glphySel6 = layer6Sel.appendMany('g', byVal6)
    .translate(d => [d.x, d.y])
    .call(d3.attachTooltip)

  glphySel6.append('circle.combined')
    .at({r: d => d.r})
    .st({stroke: d => d.count == 1 && d[0].match ? 'red' : ''})
    .filter(d => d.count == 1)
    .st({stroke: '#f0f', strokeWidth: 1.5})

  glphySel6.appendMany('path', d => pie(d.groups))
    .at({
      d: arc.outerRadius(d => rScale1(d.data)),
      fill: (d, i) => colors[i]
    })

  // fourth slide
  // console.time('hm')
  // runSim(byVal9, 'combined9', 1)
  // console.timeEnd('hm')

  // glphySel9 = layer9Sel.appendMany('g', byVal9)
  //   .translate(d => [d.x, d.y])
  //   .call(d3.attachTooltip)

  // glphySel9.append('circle.combined')
  //   .at({r: d => d.r})
  //   .st({stroke: d => d.count == 1 && d[0].match ? 'red' : ''})


  // glphySel9.appendMany('path', d => pie(d.groups))
  //   .at({
  //     d: arc.outerRadius(d => rScale1(d.data)),
  //     fill: (d, i) => colors[i]
  //   })





  onScroll(0)

  var prevI = -1
  function onScroll(i){
    var isNormal = i - prevI == 1

    console.log({i, isNormal})

    if (i == 0){

      sliceSel0
        .at({d: arc.outerRadius(d => rScale(d.data.val))})
    }
    if (i == 1){
      sliceSel0
        .at({d: arc.outerRadius(d => rScale(d.data.val2))})
    }

    if (isNormal){
      if (i == 2){
        // var l = data.length
        // glphySel0
        //   .transition().duration(0).delay((d, i) => i/l*5000)
        //   .translate(d => d.pos2)
        var l = byVal2.length
        glphySel0
          .transition()
          .duration(5000/l)
          .delay(d => d.combined2.animationIndex/l*5000)
          .translate(d => d.pos2)

        layer0Sel.transition().duration(1000).delay(5000)
          .st({opacity: 0})

        layer2Sel.transition().duration(1000).delay(5000)
          .st({opacity: 1})
      }

      if (i == 3){
        // TODO move dots
        layer2Sel.transition().duration(500).delay(500)
          .st({opacity: 0})

        layer6Sel.transition().duration(500).delay(500)
          .st({opacity: 1})
      }

      if (i == 4){
        // TODO move dots
        layer6Sel.transition().duration(500).delay(500)
          .st({opacity: 0})

        layer9Sel.transition().duration(500).delay(500)
          .st({opacity: 1})
      }

    } else {
      if (i < 2){
        glphySel0.transition().duration(0)
          .translate(d => d.flatPos)
      }


      layer0Sel.transition().duration(0)
        .st({opacity: i < 2 ? 1 : 0})
      layer2Sel.transition().duration(0)
        .st({opacity: i == 2 ? 1 : 0})
      layer6Sel.transition().duration(0)
        .st({opacity: i == 3 ? 1 : 0})
      layer9Sel.transition().duration(0)
        .st({opacity: i == 4 ? 1 : 0})
    }

    layer0Sel.st({pointerEvents: i < 2 ? 'all' : 'none'})
    layer2Sel.st({pointerEvents: i == 2 ? 'all' : 'none'})
    layer6Sel.st({pointerEvents: i == 3 ? 'all' : 'none'})
    layer9Sel.st({pointerEvents: i == 4 ? 'all' : 'none'})

    prevI = i
  }

  gs.on('active', onScroll)

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






