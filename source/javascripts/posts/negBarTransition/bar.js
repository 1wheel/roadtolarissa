var numBars = 4;
var data = d3.range(-numBars*2, numBars*2, 2);

var width = 200,
    height = 200;


var x = d3.scale.ordinal()
    .domain(d3.range(numBars*2))
    .rangeRoundBands([0, width], .1)

var y = d3.scale.linear()
    .domain(d3.extent(data))
    .range([height, 0])

var svg = d3.select('body').append('svg')
    .attr({width: width, height: height})

svg.selectAll('rect')
    .data(data).enter()
  .append('rect')
    .attr('x', function(d, i){ return x(i); })
    .attr('width', x.rangeBand())
    .attr('y', function(d){ return y(d > 0 ? d : 0); })
    .attr('height', function(d){ return y(0) - y(Math.abs(d)); })
    .style('fill', function(d){ return d > 0 ? 'steelblue' : 'red'; })
    .attr('__current__', function(d){ return d; })


d3.select('body').append('h1')
    .text('Naive Transition')
    .on('click', function(){
      svg.selectAll('rect')
          .call(randomizeData)
        .transition().duration(2000)
          .attr('y', function(d){ return y(d > 0 ? d : 0); })
          .attr('height', function(d){ return y(0) - y(Math.abs(d)); })
          .attr('__current__', function(d){ return d; })
          .style('fill', function(d){ return d > 0 ? 'steelblue' : 'red'; });

    })

d3.select('body').append('h1')
    .text('Tween Transition')
    .on('click', function(){
      svg.selectAll('rect')
          .call(randomizeData)
        .transition().duration(2000)
          .tween('yPos', function(d){
            var bar = d3.select(this);
            var i = d3.interpolate(bar.attr('__current__'), d);
            bar.attr('__current__', function(d){ return d; })
            return function(t){
              var e = i(t);
              bar
                  .attr('y', y(e > 0 ? e : 0))
                  .attr('height', y(0) - y(Math.abs(e)))
                  .style('fill', (.1 < t && t < .9) ? 'black' : e > 0 ? 'steelblue' : 'red')
            }
          })
    })

// function currentBarData(bar){
//   bar = d3.select(bar)
//   var height = +bar.attr('height');
//   var yPos = +bar.attr('y');
//   return (yPos < 0 ? -1 : 1)*(y.invert(height) - y(0));
// }

function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}

function randomizeData(selection){
  selection.data(selection.data().map(function(d){
    return (d < 0 ? 1 : -1)*Math.random()*numBars*2;
  }))
}

d3.selectAll('h1')
    .style('cursor', 'pointer')

