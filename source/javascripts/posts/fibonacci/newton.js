var rZ = 200;
var height = 300;

var svg = d3.select('#newton')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .append('g')
    .attr("transform", "scale(" + 1/rZ + ")")

updateNewton()
d3.selectAll('input').on('change', updateNewton)
function updateNewton(){
  svg.selectAll('*').remove();
  d3.select('table').selectAll('tr').remove();

  var eqStr = d3.select('#newton-eq').node().value;
  function phi(x){ //console.log(x, eval(eqStr)); 
    return eval(eqStr); }
  function toCord(point){ return [x(point[0]), y(point[1])]; }
  function xToPoint(x){ return [x, phi(x)]; }
  var xPosToCord = _.compose(toCord, xToPoint);

  function positionCircle(selection, xPos){
    selection.attr({cx: x(xPos), cy: y(phi(xPos))})
  }

  var xCur = +d3.select('#newton-x0').attr('value');
      xVals = [xCur],
      e = .000000000001;
  while (xVals.length < 10 && Math.abs(_.last(xVals) - xCur) > e || xVals.length === 1){
    xCur = _.last(xVals);
    var dx = (phi(xCur) - phi(xCur - e))/e;
    xVals.push(-phi(xCur)/(dx) + xCur);
  }
  var points = d3.range(-3, 6, .1)

  var rows = d3.select('table').style('margin-top', -height + 'px')
    .select('tbody').selectAll('tr')
      .data(xVals).enter()
    .append('tr')
  rows.append('td').text(function(d, i){ return i; })
  rows.append('td').text(d3.format('.10f'))
  rows.append('td').text(_.compose(d3.format('.10f'), phi))

  var x = d3.scale.linear()
      .domain(d3.extent(points))
      .range([0, width*rZ])

  var y = d3.scale.linear()
      .domain(d3.extent(points, phi))
      .range([height*rZ, 0])

  svg.append('path')
      .attr('d', d3.svg.line().x(x).y(_.compose(y, phi))(points))

  svg.append('path')
      .attr('d', ['M', [0, y(0)], 'L', [width*rZ, y(0)]].join(''))
  svg.append('path')
      .attr('d', ['M', [x(0), 0], 'L', [x(0), height*rZ]].join(''))

  var activeCircle = svg.append('circle')
      .attr('r', 10)
      .call(positionCircle, xVals[0])
      .classed('down', true)
      .on('mouseenter', update)

  var n = 0;
  var zoom = 1/rZ;
  var resetNext = false;

  scaleToZoom();
  function update(){
    if (!activeCircle.classed('down')) return  //exit if animation in progress
    if (resetNext){
      //TODO add animation
      //wrap everything in a function and recall
      return updateNewton();      
    }
    if (n < xVals.length - 3){ 
      n++; 
    } else{
      n = 0;
      zoom = 1;
      svg.transition().duration(1000)
          .each(scaleToZoom)
          .attr('transform', 'scale(1)')
      return resetNext = true;
    }
    var prev = xToPoint(xVals[n - 1]),
        cur = xToPoint(xVals[n]),
        next = xToPoint(xVals[n + 1]);

    var xInView = xVals.slice(n, n + 3).concat(_.last(xVals)),
        xRange = d3.extent(xInView, x),
        yRange = d3.extent(xInView, _.compose(y, phi));

    svg.transition().duration(1000)
        .each(function(){
          activeCircle.attr('class', 'inactive')

          svg.append('path').classed('tangent', true).style('stroke-width', 1/zoom)
              .attr('d', ['M', toCord(prev), 'L', toCord(prev)].join(''))
            .transition()
              .attr('d', ['M', toCord(prev), 'L', toCord([cur[0], 0])].join(''))
        })
      .transition()
        .each(function(){
          svg.append('path').classed('vertical', true).style('stroke-width', 1/zoom)
              .attr('d', ['M', toCord([cur[0], 0]), 'L', toCord([cur[0], 0])].join(''))        
            .transition()    
              .attr('d', ['M', toCord([cur[0], 0]), 'L', toCord(cur)].join('')) 

          svg.append('g')
              .attr('transform', 'translate(' + toCord([cur[0], 0]) + ')')
            .append('text')
              .text(d3.format('.10f')(cur[0]))
              .attr('transform', 'scale(' + 1/zoom + ')')    
              .style('text-anchor', cur[0] < next[0] ? 'start' : 'end')
        })
      .transition()//.ease('linear')
        .each(function(){
          activeCircle.attr('class', 'inactive')
            .transition().tween('position', function(){
              var i = d3.interpolate(prev[0], cur[0]);
              return function(t){
                activeCircle.call(positionCircle, i(t));
              }
            })
        })
      .transition()
        .each(function(){
          console.log(n);
          var xInView = xVals.slice(n - 1, n + 3).concat(_.last(xVals)),
              xRange = d3.extent(xInView, x),
              yRange = d3.extent(xInView, _.compose(y, phi)),
              zWidth  = xRange[1] - xRange[0],
              zHeight = yRange[1] - yRange[0];

          var oldZoom = zoom;
          zoom = Math.min(width/zWidth, height/zHeight);
          console.log(zoom);
          //center ranges
          var x0 = xRange[0] - (width/zoom - zWidth)/2,
              y0 = yRange[0] - (height/zoom - zHeight)/2;
    
          activeCircle.transition()
              .attr('r', 10/zoom)

          svg.selectAll('path').transition()
              .style('stroke-width', 1/zoom)

          svg.selectAll('text').transition()
              .attr('transform', 'scale(' + 1/zoom + ')')

          svg.transition()
              .tween('transform', function(){
                var i = d3.interpolate(1/oldZoom, 1/zoom);
                return function(t){
                  var z = 1/i(t);
                  //console.log(z);
                  return ['translate(', -x0*z, ',', -y0*z, ')scale(', z, ')'].join('')
                }
              })
              .attr('transform', ['translate(', -x0*zoom, ',', -y0*zoom, ')scale(', zoom, ')'].join(''))


          activeCircle.transition().attr('class', 'inactive').transition().attr('class', 'down');
        })

  }

  function scaleToZoom(){
    activeCircle.transition()
        .attr('r', 10/zoom)

    svg.selectAll('path').transition()
        .style('stroke-width', 1/zoom)

    svg.selectAll('text').transition()
        .attr('transform', 'scale(' + 1/zoom + ')')
  }
}


//todo add shawdo circle
//keep list of previous poinstsn
//adjust function
