var svg = d3.select('#recursion')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var pathG = svg.append('g');
var circlesG = svg.append('g');

var levelToHeight = d3.scale.linear()
    .domain([topLevel, 0])
    .range([0, height]);

function start(){
  var tree = {i: topLevel, left: 0, right: width};
  tree.parents = [tree];
  addChildren(tree);
  drawCircle(tree);  
}

start();

function addChildren(obj){

  obj.x = (obj.left + obj.right)/2;
  obj.y = levelToHeight(obj.i);
  obj.childDrawn = false;
  obj.calculated = false;

  if (obj.i <= 1){
    obj.childDrawn = true;
    obj.val = 1;
    obj.children = [];
    return obj;
  }

  var mid = (obj.left + obj.right)/2;
  var cIndex = [obj.i - 1, obj.i - 2];
  if (obj.i % 2){ cIndex.reverse(); }
  if (Math.random() < .5){ cIndex.reverse(); }
  obj.children = [
      addChildren({i: cIndex[0], parents: [obj], leftSide: true,  left: obj.left, right: mid}), 
      addChildren({i: cIndex[1], parents: [obj], leftSide: false, left: mid,       right: obj.right}), 
    ];

  obj.val = d3.sum(obj.children, ƒ('val'))
  return obj;
}

function drawCircle(obj){
  obj.circle = circlesG.append('circle')
      .classed('circle', true)
      .on('mouseover', function(){
        //set title text
        var str = 'F(' + obj.i + ') = ';
        if (obj.i <= 1){ str += '1'; }
        else {
          str += obj.children.map(function(d){
            return 'F(' + d.i + ')'; }).join(' + ');
          if (obj.children.some(f('calculated'))){
            str += ' = ' + obj.children.map(function(d){
              return d.calculated ? d.val : 'F(' + d.i + ')'; }).join(' + ');
          }
          if (obj.children.every(f('calculated'))){ str += ' = ' + obj.val; }
        }
        d3.select(this).select('title').text(str)

        if (!obj.childDrawn){
          obj.childDrawn = true;
          drawCircle(obj.children[0])
          drawCircle(obj.children[1])
          d3.select(this).style('fill', color(obj))
        }
        if (!obj.calculated && obj.children.every(f('calculated'))){
          obj.calculated = true;
          d3.select(this).style('fill', color(obj));

          pathG.append('path')
              .attr('d', arc([obj.parents[0].x, obj.parents[0].y], [obj.x, obj.y], obj.leftSide))
              .each(function(){
                var pathLength = this.getTotalLength();
                d3.select(this)
                    .attr('stroke-dasharray', pathLength + ' ' + pathLength)
                    .attr('stroke-dashoffset', pathLength);
              })
            .transition().duration(duration)
              .attr('stroke-dashoffset', 0)
              .each('end', function(){
                updateParentState(obj); 
                if (obj.i === topLevel){ reset(svg); }
              })
        }
      })
      .style('pointer-events', 'none')
      .attr({cx: obj.parents[0].x, cy: obj.parents[0].y, r: 5})
      .datum(obj)
      .style('fill', color)

  obj.circle.append('title')

  var path = pathG.append('path')
      //.attr('d', arc([obj.parents[0].x, obj.parents[0].y], [obj.parents[0].x, obj.parents[0].y], obj.leftSide))
      .style({stroke: 'black', "stroke-width": 2})
      .attr('d', arc([obj.x, obj.y], [obj.parents[0].x, obj.parents[0].y], obj.leftSide))
      .each(function(){
        var pathLength = this.getTotalLength();
        d3.select(this)
            .attr('stroke-dasharray', pathLength + ' ' + pathLength)
            .attr('stroke-dashoffset', pathLength);
      });
  path
    .transition().duration(duration)
      .attr('stroke-dashoffset', 0)
      .each('end', function(){ updateParentState(obj); })


  obj.circle.transition().duration(duration)
      .tween('position', function(){
        var pathLength = path.node().getTotalLength();
        return function(t){
          var pos = path.node().getPointAtLength(t*pathLength);
          d3.select(this)
              .attr({cx: pos.x, cy: pos.y})
        } 
      })
      .each('end', function(){
        d3.select(this).style('pointer-events', '')
      })

}

function updateParentState(obj){
  obj.parents[0].circle.transition().style('fill', color);
}

function color(obj){
  obj.active = !obj.childDrawn || (!obj.calculated && obj.children.every(f('calculated')))
  return !obj.childDrawn ? 'steelblue' : obj.calculated ? 'white' : obj.children.every(f('calculated')) ? 'red' : 'lightgrey';
}

function arc(a, b, flip) {
  var ac = a.slice();
  var bc = b.slice();

  ac[1] = (b[1]*2 + a[1])/3;
  bc[0] = (a[0]*2 + b[0])/3;

  return ['M', b, 'C', bc, ' ', ac, ' ', a].join('');  
}


function reset(){
  svg.selectAll('.circle')
    .transition().duration(function(d){ return Math.sqrt(d.i + 1)*1000; }).ease('bounce')
      .attr('cy', height)
    .transition().ease('linear')
      .style('opacity', 0)
      .attr('r', 10)
      .remove();

  svg.selectAll('path')
    .transition().duration(1500)
      .style('opacity', 0)
      .remove();

  start();
}

d3.timer(function(t){
  d3.selectAll('circle')
      .style('stroke-width', function(d){ return d.active ? Math.sin(t/200)*5 + 5 : 1; })
})