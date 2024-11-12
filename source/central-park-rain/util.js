window.util = (function(){
  function setFullWidth(sel, width){
    width = width || innerWidth - 20
    var pWidth = d3.select('p').node().offsetWidth
    var marginLeft = -(width - pWidth)/2
    sel.st({width, marginLeft})
  }

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
      // .st({height: c.height, width: c.width, fill: '#eee'}).lower()

    c.svg.selectAll('.tick').selectAll('line').remove()
    c.svg.selectAll('.y .tick')
      .append('path').at({d: 'M 0 0 H ' + c.width, stroke: '#999', strokeWidth: .5})
    c.svg.selectAll('.y text').at({x: -3})
    c.svg.selectAll('.x .tick')
      .append('path').at({d: 'M 0 0 V -' + c.height, stroke: '#999', strokeWidth: .5})
  }

  var shortMonths = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."]
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  return {addAxisLabel, ggPlot, setFullWidth, shortMonths, months}
})()

window.init?.()