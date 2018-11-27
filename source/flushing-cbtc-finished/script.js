console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var data = `date,link,cost,finish,endDate
2011-07-28,http://web.mta.info/mta/news/books/archive/110627_1345_CPOC.pdf,550,November 2016,2016-11-30
2012-07-23,http://web.mta.info/mta/news/books/archive/120723_1400_CPOC.pdf,550,November 2016,2016-11-30
2013-04-22,http://web.mta.info/mta/news/books/archive/130422_1300_Cpoc.pdf,550,November 2016,2016-11-30
2013-11-12,http://web.mta.info/mta/news/books/archive/131112_1345_CPOC.pdf,550,4th Quarter 2016 to 2nd Quarter 2017,2017-03-31
2015-04-27,http://web.mta.info/mta/news/books/archive/150427_1315_CPOC.pdf,550,2nd Quarter 2017,2017-06-30
2015-10-26,http://web.mta.info/mta/news/books/archive/151026_1345_CPOC.pdf,550 + 20M, 3rd Quarter 2017 (Delayed from 2nd Quarter 2017),2017-09-30
2016-07-25,http://web.mta.info/mta/news/books/archive/160725_1345_CPOC.pdf,  ,4th Qtr. 2017 - delayed by 1 Qtr.,2017-12-31
2017-07-24,http://web.mta.info/mta/news/books/pdf/170724_1345_CPOC.pdf,595M,4th Qtr. 2017,2017-12-31
2017-12-11,http://web.mta.info/mta/news/books/pdf/171211_1330_CPOC.pdf,588M,In-Service projected for 2nd Quarter 2018; previously 4th Quarter 2017,2018-06-30
2018-01-22,http://web.mta.info/mta/news/books/pdf/180122_1400_CPOC.pdf,563.6M,2nd Qtr 2018,2018-06-30
2018-04-23,http://web.mta.info/mta/news/books/pdf/180423_1330_CPOC.pdf,$588,2nd - 4th Quarter 2018 ,2018-12-31
2018-07-23,http://web.mta.info/mta/news/books/pdf/180723_1400_CPOC.pdf,563.6M,Oct- 18,2018-10-31
2018-10-22,http://web.mta.info/mta/news/books/pdf/181022_1330_CPOC.pdf,563.6M,Nov-17,2018-11-30
2018-11-13,http://web.mta.info/mta/news/books/pdf/181113_1400_CPOC.pdf,588,11/26/2018,2018-11-26
2018-11-26,http://web.mta.info/mta/news/books/pdf/181113_1400_CPOC.pdf,588,11/26/2018,2018-11-26`

data = d3.csvParse(data)
var timeFmt = d3.timeParse('%Y-%m-%d')

data.forEach((d, i) => {
  d.i = i

  var prev = i ? data[i - 1] : d
  d.prev = prev

  d.rawDate = d.date
  d.rawEndDate = d.endDate

  // TK don't be lazyyy
  d.date = timeFmt(d.date)
  d.endDate = timeFmt(d.endDate)

  d.remain0 = (+d.prev.endDate - d.date)/24/60/60/1000
  d.remain1 = (+d.endDate - d.date)/24/60/60/1000
})

var isMobile = innerWidth < 800
var sel = d3.select('#two-years').html('').append('div')
var c = d3.conventions({
  sel, 
  margin: isMobile ? {left: 30, right: 2, top: 8} : {left: 70, right: 70},
  height: isMobile ? innerWidth/2 : 400,
  width: isMobile ? 0 : 700
})

var {width, height} = c

c.svg.append('mask#draw-area').append('rect').at({width, height, fill: '#fff'})


var allDates = data.map(d => d.date).concat(data.map(d => d.endDate))

c.x = d3.scaleTime()
  .domain(d3.extent(allDates))
  .domain(['2015-01-01', '2018-11-26'].map(timeFmt))
  .range(c.x.range())

c.y 
  .domain([0, 365*3])
  .domain([0, 830])

c.xAxis = d3.axisBottom(c.x).ticks(5)

c.yAxis.ticks(isMobile ? 5 : 10)
d3.drawAxis(c)

c.svg.selectAll('.y text').at({x: -3})
c.svg.select('.y text').at({x: -6}).remove()

if (!isMobile){
  c.svg.selectAll('.y .tick').filter(d => d == 800)
    .append('text').text('days to')
    .at({fill: '#000', y: 0, dy: '.32em', x: -3})
    .parent()
    .append('text').text('completion')
    .at({fill: '#000', y: 12, dy: '.32em', x: -3})
    .parent().st({fontWeight: 700})
    .select('text')
    .at({y: -12})
}

var topPath = 'M' + data.map(d => {
  return [c.x(d.date), c.y(d.remain0)] + ' L ' + [c.x(d.date), c.y(d.remain1)]
}).join(' L ')

var baseSel = c.svg.append('g').at({mask: 'url(#draw-area)'})

baseSel.append('path')
  .at({
    d: topPath + ` V ${c.height} H 0 Z`,
    fill: '#BE00C1',
    opacity: .1,
  })

baseSel.appendMany('line', isMobile ? [200, 400, 600, 800] : c.y.ticks())
  .at({x1: width, stroke: '#f5f5f5', strokeWidth: 1.5})
  .translate(c.y, 1)

baseSel.append('path')
  .at({
    d: topPath,
    stroke: '#BE00C1',
    fill: 'none',
    strokeWidth: 2,
  })





// baseSel.appendMany('circle', data)
//   .at({r: 3, fill: '#fff', stroke: '#000'})
//   .translate(d => [c.x(d.date), c.y(d.remain0)])
//   .call(d3.attachTooltip)

// baseSel.appendMany('circle', data)
//   .at({r: 3, fill: '#fff', stroke: '#f0f'})
//   .translate(d => [c.x(d.date), c.y(d.remain1)])
//   .call(d3.attachTooltip)


var initDays = -(c.x.domain()[0] - data[0].endDate)/24/60/60/1000
baseSel.append('path#original')
  .at({
    d: `M ${[0, c.y(initDays)]} L ${[c.x(data[0].endDate), c.height]}`,
    stroke: '#000',
    strokeDasharray: '5 5'
  })

baseSel.append('text')
  .at({dy: -5, x: -5})
  .append('textPath')
  .text('Original Completion Date →')
  .at({href: '#original', textAnchor: 'end'})
  .attr('startOffset', '100%')


    // 2015-10-26
    //  additional time required for testin and commissioning
    // Shadow mode operations start was delayed several months
    // CBTC car equipment installations has not progressed as planned. 
    // http://web.mta.info/mta/news/books/archive/151026_1345_CPOC.pdf


    // 2016-07-25
    // http://web.mta.info/mta/news/books/archive/160725_1345_CPOC.pdf
    // Stability of the system software is taking longer than expected


// 2017-12-11
// http://web.mta.info/mta/news/books/pdf/171211_1330_CPOC.pdf
// Reliable and stable system software is needed
// Additional hardware and software issues have been identified. 
// implemented an interim fix to address hardware failures 
// The issues impacting project progress are complex and require extensive effort and time to resolve
// Additional software and hardware modifications could be
// identified as passenger service expands to operate with full
// CBTC functionalities during rush hours service.
// - Availability of General Orders to complete commissioning
// activities.
// - Need for an updated System Performance Analysis that
// reflects current operational data.


// 2018-04-23
// http://web.mta.info/mta/news/books/pdf/180423_1330_CPOC.pdf
// Progress was made in expanding CBTC revenue service
// north of 74th Street. However, system performance issues
// and lack of system stability are impacting the project
// team’s ability to extend CBTC operation to the remaining
// section of the Line.

// Schedule: NYCT is currently evaluating a revised schedule
// for remaining commissioning activities that was recently
// submitted by Thales.
// - The IEC is of the opinion that completion of in-service
// activities in the 2nd Quarter (as was reported to the Board in
// December) is no longer achievable.
// - System performance within the next few weeks will
// determine when CBTC operation can expand to the entire
// line.
// - Budget: The project remains within the approved budget.
// The project has $5M in reserve. However, additional
// funds may be required in the event of further delays to inservice
// activities.
// IEC Observations:
// - Progress was made in expanding CBTC passenger service
// operation between Main Street & 74th Street to AM, PM and
// limited rush hours.
// - The contractor has implemented a number of software
// modifications to address identified CBTC system issues.
// - System performance issues continue to delay CBTC
// migration south of 74th Street
// - The project team implemented an interim fix for damages to
// speed sensor hardware that caused speed measurement
// failures
// - A permanent fix based on a redundant architecture is
// planned for after completion of in-service activities

// IEC Concerns:
// - Communication issues continue to impact system
// performance. The root cause of communication failures has
// not been determined
// - Additional design/software modifications are required
// - Software updates are needed to address Automatic Train
// Supervision (ATS) failures
// - System issues are causing system interruptions
// - Rescheduling of General Orders to support commissioning
// activities south of 74th Street could be challenging
// Recommendation:
// The IEC recommends a third party comprehensive, in-depth
// review of the Data Communication System (DCS) design

// Project Risks
// - Remaining system issues continue to delay critical project
// milestones (achieving full CBTC service North of 74th Street &
// achieving CBTC system stability), which continue to impact
// full revenue service & Substantial Completion
// - Migrating CBTC operation to south of 74th Street requires a
// high level of system stability
// - Limited existing wayside signals to support passenger
// service in the event of CBTC failure

var annos = 
[
  {
    "x": "2015-10-26",
    "y": 650,
    "path": "M -5,-68 A 31.223 31.223 0 0 0 -8,-12",
    "text": "More testing time to validate and verify safety",
    "textOffset": [
      3,
      -81
    ]
  },
  {
    "x": "2016-07-25",
    "y": 480,
    "path": "M 3,-60 A 29.471 29.471 0 0 0 -11,-10",
    "text": "Various anomalies discovered during CBTC monitoring",
    "textOffset": [
      14,
      -67
    ]
  },
  {
    "x": "2017-12-11",
    "y": 120,
    "path": "M -53,-58 A 42.66 42.66 0 0 0 -10.99999713897705,-9.999998092651367",
    "text": "Reliable and stable system software is needed",
    "textOffset": [
      -100,
      -95
    ]
  },
  {
    "x": "2018-04-23",
    "y": 180,
    "path": "M 3,-60 A 29.471 29.471 0 0 0 -11,-10",
    "text": "Software updates are needed to address ATS failures",
    "textOffset": [
      14,
      -90
    ]
  }
]

var swoopy = d3.swoopyDrag()
  .x(d => c.x(timeFmt(d.x)))
  .y(d => c.y(d.y))
  .draggable(0)
  .annotations(annos)

var swoopySel = c.svg.append('g.swoopy').call(swoopy).st({opacity: isMobile ? 0 : 1})

swoopySel.selectAll('path')
  .attr('marker-end', 'url(#arrow)')
  .at({fill: 'none', stroke: '#000', strokeWidth: .6})

swoopySel.selectAll('text')
    .each(function(d){
      d3.select(this)
          .text('')                        //clear existing text
          .tspans(d3.wordwrap(d.text, 20)) //wrap after 20 char
    })


c.svg.append('marker')
  .attr('id', 'arrow')
  .attr('viewBox', '-10 -10 20 20')
  .attr('markerWidth', 17)
  .attr('markerHeight', 17)
  .attr('orient', 'auto')
  .append('path')
  .attr('d', "M8,0 L0,-4 L 0,4Z")





sel.append('div.source')
  .st({marginLeft: c.margin.left, bottom: -25, position: 'absolute'})
  .html(`
    <a href='http://web.mta.info/mta/news/books/cpoc_materials.htm'>Capital Program Oversight Committee</a>
`)






















