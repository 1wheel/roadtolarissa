var height = 500,
    width = 750,
    margin = {left: 0, right: 0, top: 15, bottom: 15},
    topLevel = 5,
    duration = 1000;

var svg = d3.select('#recursion')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var levelToHeight = d3.scale.linear()
    .domain([topLevel, 0])
    .range([0, height]);

var tree = {i: topLevel, left: 0, right: width};
tree.parent = tree;
addChildren(tree);
drawCircle(tree);

function addChildren(obj){
  obj.x = (obj.left + obj.right)/2;
  obj.y = levelToHeight(obj.i);
  obj.childDrawn = false;
  obj.calculated = false;

  if (obj.i === 0 || obj.i === 1){
    obj.childDrawn = true;
    obj.val = obj.i;
    obj.children = [];
    return obj;
  }

  var mid = (obj.left + obj.right)/2;
  var cIndex = [obj.i - 1, obj.i - 2];
  if (Math.random() < .5){ cIndex.reverse(); }
  obj.children = [
      addChildren({i: cIndex[0], parent: obj, leftSide: true,  left: obj.left, right: mid}), 
      addChildren({i: cIndex[1], parent: obj, leftSide: false, left: mid,       right: obj.right}), 
    ];

  obj.val = d3.sum(obj.children, ƒ('val'))
  return obj;
}

function drawCircle(obj){
  obj.circle = svg.append('circle')
      .attr('r', 10)
      .on('mouseover', function(){
        if (!obj.childDrawn){
          obj.childDrawn = true;
          drawCircle(obj.children[0])
          drawCircle(obj.children[1])
          d3.select(this).style('fill', color(obj))
        }
        if (!obj.calculated && obj.children.every(f('calculated'))){
          obj.calculated = true;
          d3.select(this).style('fill', color(obj));

          svg.append('path')
              .attr('d', arc([obj.x, obj.y], [obj.x, obj.y], obj.leftSide))
            .transition().duration(duration)
              .attr('d', arc([obj.parent.x, obj.parent.y], [obj.x, obj.y], obj.leftSide))
              .each('end', function(){ updateParentState(obj); })
        }
      })
      .attr('cx', obj.parent.x)
      .attr('cy', obj.parent.y)
      .style('pointer-events', 'none')
      .style('fill', color(obj))
      .datum(obj);

  obj.circle.transition().duration(duration)
      .attr('cx', obj.x)
      .attr('cy', obj.y)
      .each('end', function(){
        d3.select(this).style('pointer-events', 'all')
      })

  svg.append('path')
      .attr('d', arc([obj.parent.x, obj.parent.y], [obj.parent.x, obj.parent.y], obj.leftSide))
      .style({stroke: 'black', "stroke-width": 2})
    .transition().duration(duration)
      .attr('d', arc([obj.x, obj.y], [obj.parent.x, obj.parent.y], obj.leftSide))


}

function updateParentState(obj){
  obj.parent.circle.style('fill', color(obj.parent));
}

function color(obj){
  return !obj.childDrawn ? 'steelblue' : obj.calculated ? 'white' : obj.children.every(f('calculated')) ? 'red' : 'lightgrey';
}

function arc(a, b, flip) {
  var dx = a[0] - b[0],
      dy = a[1] - b[1],
      dr = Math.sqrt(dx * dx + dy * dy);
  flip = true;
  return flip ? 
    "M" + b[0] + "," + b[1] + "A" + dr + "," + dr + " 0 0,1 " + a[0] + "," + a[1] :
    "M" + a[0] + "," + a[1] + "A" + dr + "," + dr + " 0 0,1 " + b[0] + "," + b[1];
}

function reset(){
  svg.selectAll('circle')
    .transition().duration(function(d){ return d.i*500; }).ease('bounce')
      .attr('cy', height)
}