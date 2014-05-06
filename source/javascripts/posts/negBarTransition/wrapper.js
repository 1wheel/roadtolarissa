var interpolationLine = graphs.interpolationLine()
		.parent(d3.select('#interpolationLine').node())
		.ease('	1`')
		.draw();

var tweenCandleBar = graphs.candleBar()
		.parent(d3.select('#tweenCandleBar').node())
		.draw();


var naiveCandleBar = graphs.candleBar()
		.parent(d3.select('#naiveCandleBar').node())
		.draw();


var dispatchingGraphs = [interpolationLine];
var listeningGraphs = dispatchingGraphs.slice().concat([tweenCandleBar, naiveCandleBar]);

dispatchingGraphs.forEach(function(graph){
	graph.on('mouseT', updateHover);
})


function updateExtent(extent){
	var yScale = tweenCandleBar.yScale();
	yScale.domain(extent);

	var i = d3.interpolate(extent[0], extent[1]);
	tweenCandleBar
			.extent(extent)
			.heightF(compose(valToHeight, i))
			.yF(compose(valToY, i))
			.fillF(compose(valToFill, i))

	var hExtent = extent.map(valToHeight)
	var yExtent = extent.map(valToY)
	var fExtent = extent.map(valToFill);
	naiveCandleBar
			.extent(extent)
			.heightF(d3.interpolate(hExtent[0], hExtent[1]))
			.yF(d3.interpolate(yExtent[0], yExtent[1]))
			.fillF(d3.interpolate(fExtent[0], fExtent[1]))
			.yScale(yScale)

	function valToHeight(d){ return yScale(0) - yScale(Math.abs(d)); }
	function valToY(d){ return yScale(d > 0 ? d : 0); }
	function valToFill(d){ return d > 0 ? 'steelblue' : 'red'; }

}
updateExtent([-15, 10])


var currentHover;
var manualHoverInterupt = false;
function updateHover(t, automatic){
	if (!automatic){ manualHoverInterupt = true; }
	currentHover = t;
	listeningGraphs.forEach(function(graph){
		graph.mouse(t);
	});
}
updateHover(0);


d3.select('#playButton')
		.on('click', function(){
			manualHoverInterupt = false
			var i = d3.interpolate(currentHover, currentHover === 1 ? 0 : 1);
			d3.timer(function(t){
				updateHover(i(Math.min(t, 1000)/1000));
				return t > 1000 || !manualHoverInterupt; 
			})
		})