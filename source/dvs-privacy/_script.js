console.clear()
var ttSel = d3.select('body').selectAppend('div.tooltip.tooltip-hidden')


var colors = [
  '#DDB32B',
  '#2DB2A5',
  '#A05E9C'
]

var slides = [
`<p>Over 3,000 people have joined the <a href='https://www.datavisualizationsociety.com/'>Data Visualization Society</a>. The glyphs here represent their self reported skill levels at different aspects of charting.  

<p>The data released by DVS lists city and submission time, but doesn't include the raw responses to the nine skill questions on the survey. To protect respondents' privacy, the questions were combined into three categories—<b class='text-d'>data</b>, <b class='text-v'>visualization</b> and <b class='text-s'>society</b>—and averaged together. `,

`<p>Even with that dimensionality reduction, it's still hard to pick out patterns in the data. 

<p>We can simplify more by reducing the granularity of the data. Instead of trying to show every skill at its exact level, we can bucket them as low, medium or high. 

<p>We can see more already! Medium in all three categories is the modal choice. 
`,

`
<p>Grouping glyphs with the same bucketed skills removes noise from the chart, making it easier to find little insights. 

<p>It looks like high <b class='text-s'>society</b> skills are less common than <b class='text-d'>data</b> or <b class='text-v'>visualization</b> skills, for example.
`,

`<p>This method of grouping is flexible. I've added back some granularity, using six buckets for each skill to match the original 0-5 scale. All 0s are way more common than straight 5s.

<p>In the biggest groups all the skills are within a point of each other. More variance isn't as common; I think there's a high <b class='text-d'>data</b> / <b class='text-v'>visualization</b> and low <b class='text-s'>society</b> group with just me in it!

<p>In total, there are <span id='circle-icon'> </span> 28  groups  here with just one person in them.
`,

`<p>Adding back even more granularity—remember each skill slice represents the average of three questions, so fractional values are possible—there are about 600 people who have a unique combination of averaged skills.
`,

`<p>In addition to the redacted survey data, DVS also created PNG and SVG badges visualizing every member's response to the nine questions. Here's a bit of one:

<xmp><path d="M49,0L93,74L7,76Z"/> 
<path d="M50,36L62,56L38,57Z"/> 
<path d="M55,18L78,67L98,75Z"/> 
</xmp>

<p>By <a href='https://github.com/1wheel/datavizsociety/blob/master/script.js
'>extracting</a> the nine raw responses from the SVGs, I was able to link them to 600 people’s submission times and locations by calculating the skill category averages.

<p>This linked data was intentionally not released.    

`,

`<p>Significantly more detailed <a href='https://github.com/emeeks/data_visualization_survey/tree/master/data
'>information</a> about the visualization community has been published before, so the impact of this inadvertent leakage of survey data is quite low. But it does point to the difficulties of releasing data on the internet. 

<p>I'm conflicted about this. Two of my favorite <a href='https://www.nytimes.com/2016/09/02/upshot/new-geography-of-prisons.html'>NYT</a> <a href='https://www.nytimes.com/interactive/2018/03/19/upshot/race-class-white-and-black-men.html'>pieces</a> required detailed, administrative data about sensitive topics. How can we use data to understand the world if the most important and interesting data is impossible to share?

<p>One common solution, <a href='https://en.wikipedia.org/wiki/K-anonymity'>k-anonymity</a>, selectively reduces granularity to guarantee that there'll always be several people in any given grouping. This gets tricky with higher dimensional data. 

<p>The state-of-the-art <a href='https://en.wikipedia.org/wiki/Differential_privacy'>differential privacy</a> uses random noise and cryptographic math to construct summary statistics that don’t reveal any single individual's response. I'm not aware of an <a href='http://blog.mrtz.org/2015/03/13/practicing-differential-privacy.html'>easy way</a> to use it though.

<p>In this instance, the much maligned "security through obscurity" would have been sufficient. If the badges were only released as PNGs I definitely wouldn't have taken the time to parse them. 

<p style='font-family: monospace'><a href='https://github.com/1wheel/roadtolarissa/blob/master/source/dvs-privacy/_script.js'>chart code</a></p>
`

]


var slideSel = d3.select('#slides').html('')
  .appendMany('div.slide', slides)
  .append('div').html(d => d)

gs = d3.graphScroll()
  .eventId('lol-scroll')
  .container(d3.select('#container'))
  .sections(slideSel)
  .offset(innerHeight - 100)


var c = d3.conventions({
  sel: d3.select('html').selectAppend('div#graph').html(''),
  layers: 'ds',
  margin: {left: innerWidth < 500 ? 10 : 20, top: 10, right: 10, bottom: 10}
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
    .filter(d => d.length == 1 && d[0].match)
    .map(d => d[0])

  var s = Math.sqrt(c.width*c.height/data.length)
  var nCols = Math.ceil(c.width/s)
  var r = s/2 - 1*0
  data.forEach((d, i) => {
    d.flatPos = [s*(i % nCols), s*(Math.floor(i/nCols))]
    d.i = i
  })

  var s9 = Math.sqrt(c.width*c.height/byVal9.length)
  var nCols = Math.floor(c.width/s9)
  var r9 = s9/2 - 1*0
  byVal9.forEach((d, i) => {
    d.pos9 = [s9*(i % nCols + .3), s9*(.5 + Math.floor(i/nCols))]
    d.i9 = i
  })
  _.shuffle(byVal9).forEach((d, i) => {
    d.ir = i
  })


  var rScale = d3.scaleSqrt().range([1, r])
  var rScale = d3.scaleLinear().range([0, r])
  var rScale9 = d3.scaleLinear().range([0, r9])

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

    var yForce = d3.forceY(d => c.y(d.mean)).strength(.5)

    if (key == '2to6-transition'){
      xForce = d3.forceX(d => d[0].combined2.x).strength(1)
      yForce = d3.forceY(d => d[0].combined2.y).strength(1)
    }

    var sim = d3.forceSimulation(array)
      .force('x', xForce)
      .force('y', yForce)
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

  function randCircleBorder(){
    var θ = Math.random()*Math.PI*2

    return [Math.cos(θ), Math.sin(θ)]
  }

  function phyllotaxis(i) {
    var radius = r*Math.sqrt(i)*.6
    var θ = Math.PI*(3 - Math.sqrt(5))*i
    return [radius*Math.cos(θ), radius*Math.sin(θ)]
  }

  // third slide
  runSim(byVal2, 'combined2', 200)

  // calc 0 -> 2 transition
  // data.forEach(d => {
  //   var c = d.combined2

  //   var [r0, r1] = randCirclePos()
  //   d.pos2 = [r0*(c.r - r) + c.x, r1*(c.r - r) + c.y]
  // })

  byVal2.forEach(c => {
    c.forEach((d, i) => {
      var [x, y] = phyllotaxis(i)
      d.pos2 = [x + c.x, y + c.y]
    })
  })
  
  _.sortBy(byVal2, d => d[0].i).forEach((d, i) => {
    d.animationIndex = i
  })




  glphySel2 = layer2Sel.appendMany('g', byVal2)
    .translate(d => [d.x, d.y])
    .call(d3.attachTooltip)

  glphySel2.append('circle.combined')
    .at({r: d => d.r})
    // .st({stroke: d => d.count == 1 && d[0].match ? 'red' : ''})

  glphySel2.appendMany('path', d => pie(d.groups))
    .at({
      d: arc.outerRadius(d => rScale1(d.data)),
      fill: (d, i) => colors[i]
    })


  // fourth slide
  runSim(byVal6, 'combined6', 300)

  byVal6.forEach(d => d.pos = [d.x, d.y])
  _.sortBy(byVal6, d => d.x).forEach((d, i) => d.animationIndex = i)

  // calc 2 -> 6 transition
  d3.nestBy(byVal6, d => d[0].combined2).forEach(c2 =>{
    var sorted = _.sortBy(c2, d => -d.length)
    sorted[0].is2to6Max = true

    var c = c2[0][0].combined2
    sorted.forEach((d, i) => {
      var θ = Math.PI*2*i/(c2.length - 1)

      var [r0, r1] =  [Math.cos(θ), Math.sin(θ)]
      d.pos2 = [r0*.8*(c.r - d.r) + c.x, r1*.8*(c.r - d.r) + c.y]

      if (d.is2to6Max) d.pos2 = [c.x, c.y]
    })
  })


  glphySel6 = layer6Sel.appendMany('g', byVal6)
    .translate(d => d.pos2)
    .call(d3.attachTooltip)

  glphySel6.append('circle.combined')
    .at({r: d => d.r})
    .st({stroke: d => d.count == 1 && d[0].match ? 'red' : ''})
    .filter(d => d.count == 1)
    .st({stroke: '#000', strokeWidth: 1.5})

  glphySel6.appendMany('path', d => pie(d.groups))
    .at({
      d: arc.outerRadius(d => rScale1(d.data)),
      fill: (d, i) => colors[i]
    })



  // calc 6 -> 9 transition
  d3.nestBy(byVal9, d => d.val6Key).forEach(c6 =>{
    var sorted = _.sortBy(c6, d => -d.length)
    sorted[0].is6to9Max = true

    var c = c6[0].combined6
    sorted.forEach((d, i) => {
      var θ = Math.PI*2*i/(c6.length - 1)

      var [r0, r1] =  [Math.cos(θ), Math.sin(θ)]
      d.pos6to9 = [r0*.8*(c.r - r) + c.x, r1*.8*(c.r - r) + c.y]
      // throw 'up'
      if (d.is6to9Max) d.pos6to9 = [c.x, c.y]
    })
  })


  // last two slides
  glphySel9 = layer9Sel.appendMany('g', byVal9)
    .translate(d => d.pos6to9)
    .call(d3.attachTooltip)

  var circleSel9 = glphySel9.append('circle.combined')
    .at({r})
    .st({strokeWidth: .5})

  byVal9.forEach(d => {
    d.groups9 = [] 

    d.match.triangles.forEach(tri => {
      var vals = tri.vals.map(d => d/5)
      var mean = d3.mean(vals)

      vals.forEach(val => {
        d.groups9.push({d, val, mean})
      })
    })
  })

  var sliceSel9 = glphySel9.appendMany('path', d => pie(d.groups9))
    .at({
      d: arc.outerRadius(d => rScale(d.data.mean)),
      fill: (d, i) => colors[Math.floor(i/3)],
      stroke: '#fff',
      strokeWidth: .1
    })

  var locTimeSel = layer9Sel.append('g')









  var prevI = 4
  onScroll(0)
  // onScroll(5)

  function onScroll(i){
    var isNormal = i - prevI == 1

    console.log({i, prevI, isNormal})

    if (i == 0){

      sliceSel0
        .transition().duration(0)
        .at({d: arc.outerRadius(d => rScale(d.data.val))})
    }
    if (i == 1){
      var l = byVal2.length
      sliceSel0
        .transition()
        .duration(5000/l)
        .delay(d => d.data.d.combined2.animationIndex/l*5000)
        .at({d: arc.outerRadius(d => rScale(d.data.val2))})

      // sliceSel0
      //   .at({d: arc.outerRadius(d => rScale(d.data.val2))})
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
        layer2Sel.transition().duration(500)
          .st({opacity: 0})

        layer6Sel.transition().duration(500)
          .st({opacity: 1})

        var l = byVal2.length
        glphySel6
          .transition()
          .duration(500)
          .delay(d => d.animationIndex/l*200 + 1000)
          .translate(d => d.pos)
      }

      if (i == 4){
        layer6Sel.transition().duration(500)
          .st({opacity: 0})

        layer9Sel.transition().duration(500)
          .st({opacity: 1})

        var l = byVal6.length
        glphySel9
          .transition()
          .duration(500)
          .delay((d, i) => i/l*500 + 1000)
          .translate(d => d.pos9)
      }
      if (i == 5){
        sliceSel9.transition().duration(150).delay(d => d.data.d.ir*300)
          .at({d: arc.outerRadius(d => rScale9(d.data.mean))})
          .transition().delay(200).duration(700)
          .at({d: arc.outerRadius(d => rScale9(d.data.val))})

        circleSel9.transition().duration(150).delay(d => d.ir*300)
          .at({r: r9})
          .on('start', d => {
            var isShowing = d.ir % 3 == 0 || true
            var sel = locTimeSel.append('g.loctime')
              .translate([
                d.pos9[0] - r9, 
                d.pos9[1] + (isShowing ? r9 + 8 : -r9 - 14)
              ])
              .st({fontSize: 10, fontFamily: 'monospace'})

            sel.transition().duration(isShowing ? 3000 : 0)
              .st({opacity: 0})
              .remove()


            sel.append('text').at({y: 12})
              // .at({textAnchor: 'middle'})
              // .text([d.lat, d.long].map(Math.round).map(d3.format('02')).join(', '))
              .text([d.lat, d.long].map(d3.format('04.1f')))
              // .text([d.lat, d.long].map(d => d3.format('05.1f')(d)))
                // .join(', '))

            sel.append('text')
              // .at({textAnchor: 'middle'})
              .text(d.date_with_hour.replace('/2019', '') + (+d.hour < 12 ? 'AM' : 'PM'))
              .text(d.date_with_hour.replace('/2019', '') + ':00')

          })

      }

    } else {
      glphySel0.transition().duration(0)
        .translate(d => d.flatPos)
      glphySel6.transition().duration(0)
        .translate(d => i < 3 ? d.pos2 : d.pos)
      glphySel9.transition().duration(0)
        .translate(d => i < 4 ? d.pos6to9 : d.pos9)

      layer0Sel.transition().duration(0)
        .st({opacity: i < 2 ? 1 : 0})
      layer2Sel.transition().duration(0)
        .st({opacity: i == 2 ? 1 : 0})
      layer6Sel.transition().duration(0)
        .st({opacity: i == 3 ? 1 : 0})
      layer9Sel.transition().duration(0)
        .st({opacity: i > 3 ? 1 : 0})

      if (i < 5){
        sliceSel9.transition().duration(0)
          .at({d: arc.outerRadius(d => rScale(d.data.mean))})

        circleSel9.transition().duration(0)
          .at({r})
      }
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






