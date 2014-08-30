var height = 300,
    width = 600,
    margin = {left: 0, right: 0, top: 15, bottom: 15},
    topLevel = 8,
    duration = 1000;

var svg = d3.select('body')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


var p1 = {x: 30,  y: 30};
var p2 = {x: 400, y: 100};
svg.append('circle')
    .attr({r: 10, cx: p1.x, cy: p1.y})

svg.append('circle')
    .attr({r: 10, cx: p2.x, cy: p2.y})

var pathStr = ['M', p1.x, ',', p1.y, ' C', p2.x, ',', p2.y, ' ', 12, ',', 34, ' S400,300 400,200']
.join('')

pathStr = ['M', p1.x, ',', '200 C100,100 250,100 250,200 S400,300 400,200'].join('')

svg.append('path')
    .attr('d', pathStr)
//"M" + p1.x + ' ' p1.y + "C" + p[1] + " " + p[2] + " " + p[3]