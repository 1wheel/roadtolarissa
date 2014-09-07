var svg = d3.select('#memorization')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")



var memObj;
function start(){
  var tree = {i: topLevel, left: 0, right: width, parents: [tree]};
  memObj = {topLevel: tree};
  tree.parents = [tree];
  addChildren(tree);
  drawCircle(tree, tree);  
}
start();

function addChildren(obj){
  if (memObj[obj.i]){
    memObj[obj.i].parents.push(obj.parents[0]);
    return memObj[obj.i];
  }
  memObj[obj.i] = obj;


  obj.x = (obj.left + obj.right)/2;
  obj.y = levelToHeight(obj.i);
  obj.childDrawn = false;
  obj.calculated = false;
  obj.children = [];

  if (obj.i === 0 || obj.i === 1){
    obj.childDrawn = true;
    obj.val = obj.i;
    obj.children = [];
    return obj;
  }

  obj.val = d3.sum(obj.children, ƒ('val'))
  return obj;
}

function drawCircle(obj, from){
  obj.circle = svg.append('circle')
      .attr('r', 10)
      .on('mouseover', function(){
        if (!obj.childDrawn){
          obj.childDrawn = true;

          var mid = (obj.left + obj.right)/2;
          var cIndex = [obj.i - 1, obj.i - 2];
          obj.children = [
              addChildren({i: cIndex[0], parents: [obj], leftSide: true,  left: obj.left, right: mid}), 
              addChildren({i: cIndex[1], parents: [obj], leftSide: false, left: mid,       right: obj.right}), 
            ];

          drawCircle(obj.children[0], obj)
          drawCircle(obj.children[1], obj)
          d3.select(this).style('fill', color(obj))
        }
        if (!obj.calculated && obj.children.every(f('calculated'))){
          obj.calculated = true;
          d3.select(this).style('fill', color(obj));

          svg.selectAll('new-path')
              .data(obj.parents).enter()
            .append('path')
              .attr('d', function(d){
                return arc([d.x, d.y], [obj.x, obj.y], obj.leftSide); })
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
      .attr('cx', from.x)
      .attr('cy', from.y)
      .style('pointer-events', 'none')
      .style('fill', color(obj))
      .datum(obj);


  var path = svg.append('path')
      //.attr('d', arc([from.x, from.y], [from.x, from.y], obj.leftSide))
      .style({stroke: 'black', "stroke-width": 2})
      .attr('d', arc([obj.x, obj.y], [from.x, from.y], obj.leftSide))
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
          d3.select(this).attr({cx: pos.x, cy: pos.y});
        } 
      })
      .each('end', function(){
        d3.select(this).style('pointer-events', 'all')
      })

}