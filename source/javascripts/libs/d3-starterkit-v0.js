d3.conventions = function(c){
  c = c || {}

  c.width  = c.width  || 750
  c.height = c.height || 500

  c.margin = c.margin || {top: 5, right: 5, bottom: 20, left: 20}

  c.parentSel = c.parentSel || d3.select('body')

  c.svg = c.svg || c.parentSel.append("svg")
      .attr("width", c.width + c.margin.left + c.margin.right)
      .attr("height", c.height + c.margin.top + c.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + c.margin.left + "," + c.margin.top + ")")

  c.color   = c.color   || d3.scale.category10()
  c.x       = c.x       || d3.scale.linear().range([0, c.width])
  c.y       = c.y       || d3.scale.linear().range([c.height, 0])
  c.rScale  = c.rScale  || d3.scale.sqrt().range([5, 20])
  c.line    = c.line    || d3.svg.line()


  c.xAxis = c.xAxis || d3.svg.axis().scale(c.x).orient("bottom");
  c.yAxis = c.yAxis || d3.svg.axis().scale(c.y).orient("left")


  c.drawAxis = function(){
    c.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + c.height + ")")
        .call(c.xAxis);

    c.svg.append("g")
        .attr("class", "y axis")
        .call(c.yAxis);
  }
  
  return c
}

d3.attachTooltip = function(sel, fieldFns){
  sel 
      .on('mouseover', ttDisplay)
      .on('mousemove', ttMove)
      .on('mouseout',  ttHide)

  var d = sel.datum()
  fieldFns = fieldFns || d3.keys(d)
    .filter(function(str){
      return typeof(d[str]) === 'string' || typeof(d[str]) === 'number' })
    .map(function(str){
      return function(d){ return str + ': <b>' + d[str] + '</b>'} })

  function ttDisplay(d){
    d3.select('.tooltip')
        .classed('tooltip-hidden', false)
        .html('')
      .dataAppend(fieldFns, 'div')
        .html(function(fn){ return fn(d) })

    d3.select(this).classed('tooltipped', true)
  }

  function ttMove(d){
    var tt = d3.select('.tooltip')
    if (!tt.size()) return
    var e = d3.event,
      x = e.clientX,
      y = e.clientY,
      doctop = (window.scrollY)? window.scrollY : (document.documentElement && document.documentElement.scrollTop)? document.documentElement.scrollTop : document.body.scrollTop;
      n = tt.node(),
      nBB = n.getBoundingClientRect()

    tt.style('top', (y+doctop-nBB.height-18)+"px");
    tt.style('left', Math.min(Math.max(0, (x-nBB.width/2)), window.innerWidth - nBB.width)+"px");
  }

  function ttHide(d){
    d3.select('.tooltip').classed('tooltip-hidden', true);

    d3.selectAll('.tooltipped').classed('tooltipped', false)
  }
}


d3.selection.prototype.dataAppend = function(data, name){
  return this.selectAll('#zzzzzz')
      .data(data).enter()
    .append(name)
}