var height = 500;
var width = 750;
var margin = {left: 0, right: 0, top: 15, bottom: 15};
var topLevel = 10;

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

function addChildren(obj){
  if (obj.i === 0 || obj.i === 1){
    obj.val = obj.i;
    return obj;
  }

  var mid = (obj.left + obj.right)/2;
  obj.children = [
      addChildren({i: obj.i - 1, parent: obj, left: obj.left, right: mid}), 
      addChildren({i: obj.i - 2, parent: obj, left: mid,      right: obj.right}), 
    ];

  obj.val = d3.sum(obj.children, ƒ('val'))
  return obj;
}

function drawCircle(obj){
  var childDrawn = false;
  svg.append('circle')
      .attr('r', 10)
      .on('mouseover', function(){
        if (childDrawn) return;
        if (!obj.children) return;
        childDrawn = true;
        drawCircle(obj.children[0])
        drawCircle(obj.children[1])
      })
      .attr('cx', objToX(obj.parent))
      .attr('cy', objToY(obj.parent))
      .style('pointer-events', 'none')
    .transition()
      .attr('cx', objToX(obj))
      .attr('cy', objToY(obj))
      .each('end', function(){
        d3.select(this).style('pointer-events', 'all')
      })

  svg.append('line')



}

function objToX(obj){ return (obj.left + obj.right)/2; }
function objToY(obj){ return levelToHeight(obj.i); }

drawCircle(tree);