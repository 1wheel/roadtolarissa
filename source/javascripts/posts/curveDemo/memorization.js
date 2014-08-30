var height = 300,
    width = 300,
    margin = {left: 10, right: 50, top: 15, bottom: 15},
    topLevel = 8,
    duration = 1000;

var svg = d3.select('body')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


var numPoints = 20,
    squareSize = 50,
    radius = 5;

var circleY = d3.scale.linear()
      .domain([0, numPoints - 1])
      .range([0, height]),
    rect1Y = circleY.copy()
      .range([height*1/3 + 1, height*1/3 + squareSize - 1]),
    rect2Y = circleY.copy()
      .range([height*2/3 + 1, height*2/3 + squareSize - 1]);

svg.append('rect')
    .attr({x: width, y: height*1/3, width: squareSize, height: squareSize})
svg.append('rect')
    .attr({x: width, y: height*2/3, width: squareSize, height: squareSize})

var rect1Points = d3.range(numPoints).filter(function(d){
  return Math.random()*numPoints > d; });
rect1Y.domain([0, rect1Points.length - 1])
svg.selectAll('path')
    .data(rect1Points).enter()
  .append('path')
    .attr('d', function(d, i){
      var p1 = [0,      circleY(d) - radius],    //start [x, y] cord
          p2 = [width,  rect1Y(i)],              //end   [x, y] cord
          c1 = p1.slice(),                       //control point cord
          c2 = p2.slice();                       //control point cord

      //move both control points towards the middle
      c1[0] += width/3;             
      c2[0] -= width/3;
      return ['M', p1, 'C', c1, ' ', c2, ' ', p2].join('');
    })


var rect2Points = d3.range(numPoints).filter(function(d){
  return Math.random()*numPoints < d || !_.contains(rect1Points, d); });
rect2Y.domain([0, rect2Points.length - 1])
svg.selectAll('.rect2Path')
    .data(rect2Points).enter()
  .append('path')
    .attr('d', function(d, i){
      var p1 = [0,      circleY(d) + radius],        //start [x, y] cord
          p2 = [width,  rect2Y(i)],                  //end   [x, y] cord
          c1 = p1.slice(),                           //control point cord
          c2 = p2.slice();                           //control point cord

      //move both control point 
      c1[0] += width/3;             
      c2[0] -= width/3;

      return ['M', p1, 'C', c1, ' ', c2, ' ', p2].join('');
    })




svg.selectAll('circle')
    .data(d3.range(numPoints)).enter()
  .append('circle')
    .attr('r', radius)
    .attr('cy', circleY)


// var p1 = [30, 30],
//     p2 = [400, 250]
//     c1 = p1.slice(),
//     c2 = p2.slice();

// c1[0] += 250;
// c2[0] -= 250;

// svg.append('circle').attr({r: 10, cx: p1[0], cy: p1[1]})
// svg.append('circle').attr({r: 10, cx: p2[0], cy: p2[1]})

// pathStr = ['M', p1, 'C', c1, ' ', c2, ' ', p2].join('');
 
// svg.append('path')
//     .attr('d', pathStr);





//"M" + p1.x + ' ' p1.y + "C" + p[1] + " " + p[2] + " " + p[3]
// var pathStr = ['M', p1.x, ',', p1.y, ' C', p2.x, ',', p2.y, ' ', 12, ',', 34, ' S400,300 400,200']
// .join('')

// pathStr = ['M', p1, 'C100,100 250,100 250,200 S400,300 ', p2].join('');