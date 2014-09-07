//Variables and helper functions shared by recursion.js and memorization.js

var height = 500,
    width = 750,
    margin = {left: 0, right: 0, top: 15, bottom: 15},
    topLevel = 8,
    duration = 1000;

var levelToHeight = d3.scale.linear()
    .domain([topLevel, 0])
    .range([0, height]);


function updateParentState(obj){
  obj.parents.forEach(function(d){
    d.circle.transition().style('fill', color); });
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


function reset(svg){
  svg.selectAll('circle')
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
  return

  d3.selectAll('circle')
      .style('stroke-width', function(d){ return d.active ? Math.sin(t/200)*5 + 5 : 1; })
})