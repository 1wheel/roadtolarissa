var margin = {top: 10, right: 50, bottom: 30, left: 20};
var height = 250;
var width = 600;
var duration = 50; 

var data = makeData();

var x = d3.scale.linear()
    .domain([0, data.length])
    .range([0, width])

var y = d3.scale.linear()
    .domain(d3.extent(data))
    .range([height, 0])

var line = d3.svg.line()
    .x(function(d, i){ return x(i); })
    .y(y);

var dataExtent = d3.extent(data);
var dif = dataExtent[0] - dataExtent[1];
var color = d3.scale.linear()
		.domain([.0001, 0, -.0001])
		.range(['green', 'brown', 'red'])


function reset(){
	playing = false; 


	var oldData = data.slice();
	var scaledOldData = data.map(y);
	var scaledLine = d3.svg.line()
			.x(function(d, i){ return x(i); })
			.y(f())

	data = makeData();
	y.domain(d3.extent(data));
	var scaledData = data.map(y);

	d3.selectAll('.best, .connection, text, .text-line').style('opacity', 0);

	oCircles.call(moveCircles);
	circles.call(moveCircles);

	function moveCircles(selection){
		selection.data(data)
			.transition()
				.duration(resetDuration*resetEachDuration/2)
				.ease('linear')
				.delay(function(d, i){ return i*(resetDuration*(1 - resetEachDuration))/data.length; })
				.attr('cy', y)
	}

	d3.selectAll('path').transition().ease('linear').duration(resetDuration)
			.attrTween('d', function(){
				var tToRatios = arrayTransition(data.length, resetEachDuration)
				return function(t){
					var compositeData = tToRatios(t).map(function(d, i){
						return scaledOldData[i]*d + scaledData[i]*(1 - d);
					})
          return scaledLine(compositeData);
				}
			});

	setTimeout(function(){
		playing = true; 
		d3.selectAll('.best, .connection, text, .text-line').style('opacity', '');

		duration = 50;

		peak = 0; l = 1; oBest = Infinity;
		oAnimateStep();

		j = 0; k = 1; best = Infinity;;
		animateStep(); }, resetDuration);
}

var playing = true;
var resetDuration = 2000;
var resetEachDuration = .5;

d3.selectAll('.random').on('click', reset);

//setTimeout(reset, 100)

function arrayTransition(length, delayToDur){
	var width = delayToDur*length;
	return function(t){
		t = t * (2*delayToDur + 1) - delayToDur;
		var index = t*length;
		return d3.range(length).map(function(d){
			return Math.max(0, Math.min(1, (d - index)/width));
		})
	} 
}

function makeData(){ 
	var data = [1, 0];
	for (var i = 1; i < 100; i++){
	  var rand = Math.random();
	  data[i+1] = data[i] + (rand < .5 ? -1 - rand : .5 + rand)
	}
	return d3.max(data) === data[0] ? makeData() : data; 
}
