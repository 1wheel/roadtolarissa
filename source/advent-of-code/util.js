window.util = (function(){
  var params = (function(){
    var url = new URL(window.location)
    var searchParams = new URLSearchParams(url.search)

    return {
      set: (k, v) => {
        v === null || v === undefined ? searchParams.delete(k) : searchParams.set(k, encodeURIComponent(v))
        url.search = searchParams.toString()
        history.replaceState(null, '', url)
      },
      get: k => {
        var str = searchParams.get(k)
        return str && decodeURIComponent(str)
      },
      getAll: () => {
        var values = {}
        for (const [k, v] of searchParams.entries()){
          values[k] = decodeURIComponent(v)
        }
        return values
      },
    }
  })()

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
      .st({height: c.height, width: c.width, fill: '#0F0F22'}).lower()

    c.svg.selectAll('.tick').selectAll('line').remove()
    c.svg.selectAll('.y .tick')
      .append('path').at({d: 'M 0 0 H ' + c.width, stroke: '#fff', strokeWidth: .15})
    c.svg.selectAll('.y text').at({x: -3})
    c.svg.selectAll('.x .tick')
      .append('path').at({d: 'M 0 0 V -' + c.height, stroke: '#fff', strokeWidth: .15})
    c.svg.selectAll('.x text').at({y: 3})

  }

  var shortMonths = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."]
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  return {params, addAxisLabel, ggPlot, setFullWidth, shortMonths, months}
})()

window.init?.()