var graphs = {};

graphs.interpolationLine = function(){
  var parent,
      ease = 'cubic',
      numPoints = 300;

  var rv = {};

  rv.draw = function(){
    d3.select(parent).select('*').remove();

    var boundindRect = parent.getBoundingClientRect(),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = boundindRect.width - margin.left - margin.right,
        height = boundindRect.height - margin.top - margin.bottom;

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var line = d3.svg.line()
        .x(compose(x, f('x')))
        .y(compose(y, f('y')))

    svg.append('path')
        .datum(d3.range(0, 1, 1/numPoints).map(function(d){
          return {x: d, y: d3.ease(ease)(d)};
        }))
        .attr('d', line)
        .attr({fill: 'none', 'stroke-width': 2, stroke: 'black'})

  }

  rv.parent = function(__){
    if (!arguments.length) return parent;
    parent = __;
    return rv;
  }

  rv.ease = function(__){
    if (!arguments.length) return ease;
    ease = __;
    return rv;
  }

  return rv;
}