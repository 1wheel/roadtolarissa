graphs.candleBar = function(){
  var parent,
      svg,
      yScale = d3.scale.linear(),
      heightF,
      yF,
      fillF,
      extent;

  var rv = {};

  rv.draw = function(){
    d3.select(parent).select('*').remove();

    var boundindRect = parent.getBoundingClientRect(),
        margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = boundindRect.width - margin.left - margin.right,
        height = boundindRect.height - margin.top - margin.bottom;


    svg = d3.select(parent).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    yScale
      .range([height, 0])

    svg.append('rect')
        .attr({'width': width, class: 'box'});

    svg.append('rect')
        .attr({'width': width + margin.left + margin.right, class: 'barXaxis', height: 2, x: -margin.left});

    svg.append('path')
        .attr('class', 'heightCandle')

    return rv;
  }

  rv.mouse = function(t){
    var heightVal = heightF(t);
    var yVal = yF(t);

    svg.select('.box')
        .attr({y: yVal, height: heightVal, fill: fillF(t)});

    svg.select('.barXaxis')
        .attr('y', yScale(0))

    svg.select('.heightCandle')
        .attr('d', 'M 50 50 l 10 10')
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

  return rv;
}