graphs.candleBar = function(){
  var parent,
      svg,
      yScale = d3.scale.linear(),
      heightF,
      yF,
      fillF,
      extent,
      width,
      height,
      margin = {top: 0, right: 15  , bottom: 0, left: 10};

  var rv = {};

  rv.draw = function(){
    d3.select(parent).select('*').remove();

    var boundindRect = parent.getBoundingClientRect();

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

    svg.append('g')
        .style('stroke', 'purple')
    .selectAll('.yCandle')
        .data([0, 1, 2]).enter()
      .append('path')
        .attr('class', 'yCandle')

    svg.append('g')
        .attr('transform', 'translate(' + (width + margin.left) + ', 0)')
        .style('stroke', 'orange')
    .selectAll('.heightCandle')
        .data([0, 1, 2]).enter()
      .append('path')
        .attr('class', 'heightCandle')

    svg.selectAll('label')
        .data(['y', 'h']).enter()
    .append('text')
        .text(f())
        .style('fill', function(d){ return d === 'y' ? 'purple' : 'orange'})
        .classed('label', true)
        .attr('x', function(d, i){ return i ? width + margin.right/2 : 0 })


    return rv;
  }

  rv.mouse = function(t){
    var heightVal = heightF(t);
    var yVal = yF(t);

    svg.select('.box')
        .attr({y: yVal, height: heightVal, fill: fillF(t)});

    svg.select('.barXaxis')
        .attr('y', yScale(0))

    svg.selectAll('.yCandle')
        .style('stroke-width', '2px')
        .attr('d', function(d, i){
          var rv;
          if (d === 0){
            rv = ['M', -margin.left, '0 l', margin.left, '0'];
          } else if(d === 1){
            rv = ['M', -margin.left*.5, '0 l 0', yVal];
          } else{
            rv = ['M', -margin.left, yVal, 'l', margin.left, '0']
          }
          return rv.join(' ');
        })

    svg.selectAll('.heightCandle')
        .style('stroke-width', '2px')
        .attr('d', function(d, i){
          var rv;
          if (d === 0){
            rv = ['M', -margin.left, yVal, 'l', margin.left, '0'];
          } else if(d === 1){
            rv = ['M', -margin.left*.5, yVal, 'l 0', heightVal];
          } else{
            rv = ['M', -margin.left, yVal + heightVal, 'l', margin.left, '0']
          }
          return rv.join(' ');
        })


    svg.selectAll('.label')
        .attr('y', function(d){
          return d === 'y' ? yVal/2 : yVal + heightVal/2
        })

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