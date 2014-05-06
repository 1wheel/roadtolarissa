graphs.interpolationLine = function(){
  var parent,
      ease = 'cubic',
      easeFunction = d3.ease(ease),
      numPoints = 300,
      dispatch = d3.dispatch('mouseT'),
      svg,
      x = d3.scale.linear(),
      y = d3.scale.linear();

  var rv = {};

  rv.draw = function(){
    d3.select(parent).select('*').remove();

    var boundindRect = parent.getBoundingClientRect(),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = boundindRect.width - margin.left - margin.right,
        height = boundindRect.height - margin.top - margin.bottom;

    svg = d3.select(parent).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .on('mousemove', function(){ 
          dispatch.mouseT(x.invert(d3.mouse(this)[0]));
        })

    x.range([0, width]);

    y.range([height, 0]);

    var line = d3.svg.line()
        .x(compose(x, f('x')))
        .y(compose(y, f('y')))

    svg.append('path')
        .datum(d3.range(0, 1, 1/numPoints).map(function(d){
          return {x: d, y: easeFunction(d)};
        }))
        .attr('d', line)
        .attr({fill: 'none', 'stroke-width': 2, stroke: 'black'})

    svg.append('rect')
        .attr({width: width, height: height, opacity: 0})

    svg.append('circle')
        .attr({r: 3, fill: 'red'})
        .style('cursor-event', 'none')

    return rv;
  }

  rv.mouse = function(t){
    svg.select('circle')
        .attr({cx: x(t), cy: y(easeFunction(t))})

  }

  rv.parent = function(__){
    if (!arguments.length) return parent;
    parent = __;
    return rv;
  }

  rv.ease = function(__){
    if (!arguments.length) return ease;
    ease = __;
    easeFunction = d3.ease(ease)
    return rv;
  }

  return d3.rebind(rv, dispatch, 'on');
}