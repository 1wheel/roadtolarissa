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


var p1 = [30, 30],
    p2 = [400, 250]
    c1 = p1.slice(),
    c2 = p2.slice();

c1[0] += 250;
c2[0] -= 250;

svg.append('circle').attr({r: 10, cx: p1[0], cy: p1[1]})
svg.append('circle').attr({r: 10, cx: p2[0], cy: p2[1]})

pathStr = ['M', p1, 'C', c1, ' ', c2, ' ', p2].join('');
 
svg.append('path')
    .attr('d', pathStr)
//"M" + p1.x + ' ' p1.y + "C" + p[1] + " " + p[2] + " " + p[3]
// var pathStr = ['M', p1.x, ',', p1.y, ' C', p2.x, ',', p2.y, ' ', 12, ',', 34, ' S400,300 400,200']
// .join('')

// pathStr = ['M', p1, 'C100,100 250,100 250,200 S400,300 ', p2].join('');