var height = 500;
var width = 750;
var margin = {left: 0, right: 0, top: 10, bottom: 0};
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

var tree = {i: topLevel};
addChildren(tree);

function addChildren(obj){
  if (obj.i === 0 || obj.i === 1){
    obj.val = obj.i;
    return obj;
  }

  obj.children = [
      addChildren({i: obj.i - 1}), 
      addChildren({i: obj.i - 2})];

  obj.val = d3.sum(obj.children, ƒ('val'))
  return obj;
}

function drawCircle(obj){
  var childDrawn = false;
  svg.append('circle')
      .attr('cx', width/2)
      .attr('cy', levelToHeight(obj.i))
      .attr('r', 10)
      .on('mouseover', function(){
        if (childDrawn) return;
        if (!obj.children) return;
        childDrawn = true;
        drawCircle(obj.children[0])
        drawCircle(obj.children[1])
      })
}

drawCircle(tree);