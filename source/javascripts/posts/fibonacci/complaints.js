var height = 500;
var width = 750;
var margin = {left: 0, right: 0, top: 0, bottom: 0};

var svg = d3.select('#recursion')
	.append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + width/2 + "," + height/2 + ")")

var tree = {i: 6};
addChildren(tree);

function addChildren(obj){
  //console.log(obj.i);
  if (obj.i === 0 || obj.i === 1){
    obj.val = obj.i;
    return obj.i;
  }

  obj.children = [
      addChildren({i: obj.i - 1}), 
      addChildren({i: obj.i - 2})];

  obj.val = d3.sum(obj.children, ƒ('val'))
  return obj.val;
}

var text = svg.append('text')
    .text('WHY ARE PEOPLE')
    //.attr({x: width/2, y: height/2})
    .style('font-size', '200%')
    .style('font-weight', 'bold')
text.append('tspan')
    .text('WALKING SO SLOWLY')
    .attr('dy', '2em')
d3.timer(function(t){
  text
      .style('fill', d3.hsl(Math.sin(t/100)*200, .5, .5))
      .attr('transform', 'rotate(' + t/10 + ')')
      .style('stroke-width', Math.sin(t/1000)*5)
      .style('stroke', d3.hsl(Math.sin(t/120)*200, .5, .5))
      .attr('x', Math.sin(t/250)*width/10)
      .attr('y', Math.sin(t/150)*height/10)

  text.select('tspan')
      .attr('dx', -Math.sin(t/200)*500)


  d3.select('body').style('background-color', d3.hsl(Math.sin(t/1000)*200, .5, .5)) 

})