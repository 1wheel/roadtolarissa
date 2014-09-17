
var height = 300;

var svg = d3.select('#newton')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .append('g')

var points = d3.range(-1, 26, .05)

function phi(x){ return x*x - 5; }
function toCord(point){ return [x(point[0]), y(point[1])]; }
function xToPoint(x){ return [x, phi(x)]; }
var xPosToCord = _.compose(toCord, xToPoint);

function positionCircle(selection, xPos){
  selection.attr({cx: x(xPos), cy: y(phi(xPos))})
}

var xCur = .1;
var xVals = [xCur];
while (_.last(xVals) != xCur || xVals.length === 1){
  xCur = _.last(xVals);
  xVals.push(-phi(xCur)/(2*xCur) + xCur);
}

var x = d3.scale.linear()
    .domain(d3.extent(points))
    .range([0, width])

var y = d3.scale.linear()
    .domain(d3.extent(points, phi))
    .range([height, 0])

var sqrtLine = d3.svg.line()
    .x(x)
    .y(_.compose(y, Math.sqrt))

var quadLine = d3.svg.line()
    .x(x)
    .y(_.compose(y, phi))

var path2 = svg.append('path')
    .attr('d', quadLine(points))

svg.append('path')
    .attr('d', ['M', [0, y(0)], 'L', [width, y(0)]].join(''))
svg.append('path')
    .attr('d', ['M', [x(0), 0], 'L', [x(0), height]].join(''))

var activeCircle = svg.append('circle')
    .attr('r', 10)
    .call(positionCircle, xVals[0])
    .classed('down', true)
    .on('mouseenter',update)

var n = 0;
var zoom = 1;
function update(){
  if (n < xVals.length - 3){ n++; }
  var prev = xToPoint(xVals[n - 1]);
  var cur = xToPoint(xVals[n]);

  var xInView = xVals.slice(n, n + 3).concat(_.last(xVals)),
      xRange = d3.extent(xInView, x),
      yRange = d3.extent(xInView, _.compose(y, phi));

  svg.transition().duration(1000)
      .each(function(){
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
            .text(cur[0])   
            .attr('transform', 'scale(' + 1/zoom + ')')    
      })
    .transition().ease('linear')
      .each(function(){
        activeCircle
            .attr('class', 'inactive')
          .transition().tween('position', function(){
            var i = d3.interpolate(prev[0], cur[0]);
            return function(t){
              activeCircle.call(positionCircle, i(t));
            }
          })
            .attr('class', 'down')
      })
    .transition().ease('cubic-in-out')
      .each(function(){
        console.log(n);
        var xInView = xVals.slice(n, n + 3).concat(_.last(xVals)),
            xRange = d3.extent(xInView, x),
            yRange = d3.extent(xInView, _.compose(y, phi)),
            zWidth  = xRange[1] - xRange[0],
            zHeight = yRange[1] - yRange[0];

        zoom = Math.min(width/zWidth, height/zHeight);

        //center ranges
        var x0 = xRange[0] - (width/zoom - zWidth)/2,
            y0 = yRange[0] - (height/zoom - zHeight)/2;

        svg.transition()
            .attr('transform', ['translate(', -x0*zoom, ',', -y0*zoom, ')scale(', zoom, ')'].join(''))
     
        activeCircle.transition()
            .attr('r', 10/zoom)

        svg.selectAll('path').transition()
            .style('stroke-width', 1/zoom)

        svg.selectAll('text').transition()
            .attr('transform', 'scale(' + 1/zoom + ')')
      })
}

//todo add shawdo circle
//keep list of previous poinstsn
//adjust function

      // .tween('position', function(){
      //   var pathLength = path.node().getTotalLength()
      //   return function(t){
      //     var pos = path.node().getPointAtLength(t*pathLength)
      //     d3.select(this).attr({cx: pos.x, cy: pos.y})
      //   } 
      // })
