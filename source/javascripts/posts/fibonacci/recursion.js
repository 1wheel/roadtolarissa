var height = 500;
var width = 750;
var margin = {left: 0, right: 0, top: 0, bottom: 0};

var svg = d3.select('#recursion')
	.append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
