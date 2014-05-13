graphs.iToHeightLine = function(){
  var parent,
      numPoints = 15,
      dispatch = d3.dispatch('mouseI'),
      svg,
      yScale = d3.scale.linear(),
      heightF,
      yF,
      x = d3.scale.linear(),
      y = d3.scale.linear();
  var rv = {};

  rv.draw = function(){
    d3.select(parent).select('*').remove();

    var boundingRect = parent.getBoundingClientRect(),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = boundingRect.width - margin.left - margin.right,
        height = boundingRect.height - margin.top - margin.bottom;

    svg = d3.select(parent).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .on('mousemove', function(){ 
          dispatch.mouseI(x.invert(d3.mouse(this)[0]));
        })

    x.range([0, width]);

    var line = d3.svg.line()
        .x(compose(x, f('x')))
        .y(f('y'))

    svg.selectAll('path')
        .data([0, 1].map(function(i){
          return d3.range(0, 1, 1/numPoints).map(function(d){
            return {x: d, y: i ? yF(d) : heightF(d)};
          });
        })).enter()
      .append('path')
        .attr('d', line)
        .attr({fill: 'none', 'stroke-width': 2})
        .attr('stroke', function(d, i){ return i ? 'purple' : 'orange'})

    svg.append('rect')
        .attr({width: width, height: height, opacity: 0})

    svg.append('circle')
        .attr({r: 3, fill: 'red'})
        .style('pointer-event', 'none')

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

  rv.heightF = function(__){
    if (!arguments.length) return heightF;
    heightF = __;
    return rv;
  }

  rv.yF = function(__){
    if (!arguments.length) return yF;
    yF = __;
    return rv;
  }

  rv.fillF = function(__){
    if (!arguments.length) return fillF;
    fillF = __;
    return rv;
  }

  rv.extent = function(__){
    if (!arguments.length) return extent;
    extent = __;
    return rv;
  }

  rv.yScale = function(__){
    if (!arguments.length) return yScale;
    yScale = __;
    return rv;
  }



  return d3.rebind(rv, dispatch, 'on');
}