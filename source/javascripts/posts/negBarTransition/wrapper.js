var interpolationLine = graphs.interpolationLine()
		.parent(d3.select('#interpolationLine').node())
		.ease('linear')
		.draw();

var tweenCandleBar = graphs.candleBar()
		.parent(d3.select('#tweenCandleBar').node())
		.draw();
var tweenLine = graphs.iToHeightLine()
		.parent(d3.select('#tweenLine').node())

var naiveCandleBar = graphs.candleBar()
		.parent(d3.select('#naiveCandleBar').node())
		.draw();
var naiveLine = graphs.iToHeightLine()
		.parent(d3.select('#naiveLine').node())

interpolationLine.on('mouseT', updateT);

var dispatchingI = [];
var listeningI = [].slice().concat([tweenCandleBar, naiveCandleBar]);



function updateExtent(extent){
	var yScale = tweenCandleBar.yScale();
	yScale.domain(extent);

	var i = d3.interpolate(extent[0], extent[1]);
	tweenCandleBar
			.extent(extent)
			.heightF(compose(valToHeight, i))
			.yF(compose(valToY, i))
			.fillF(compose(valToFill, i))

	tweenLine
			.extent(extent)
			.heightF(compose(valToHeight, i))
			.yF(compose(valToY, i))
			.yScale(yScale)
			.draw();


	var hExtent = extent.map(valToHeight)
	var yExtent = extent.map(valToY)
	var fExtent = extent.map(valToFill);
	naiveCandleBar
			.extent(extent)
			.heightF(d3.interpolate(hExtent[0], hExtent[1]))
			.yF(d3.interpolate(yExtent[0], yExtent[1]))
			.fillF(d3.interpolate(fExtent[0], fExtent[1]))
			.yScale(yScale)
	naiveLine
			.extent(extent)
			.heightF(d3.interpolate(hExtent[0], hExtent[1]))
			.yF(d3.interpolate(yExtent[0], yExtent[1]))
			.yScale(yScale)
			.draw();


	function valToHeight(d){ return yScale(0) - yScale(Math.abs(d)); }
	function valToY(d){ return yScale(d > 0 ? d : 0); }
	function valToFill(d){ return d > 0 ? 'steelblue' : 'red'; }

}
updateExtent([-15, 10])


var currentHover;
var manualHoverInterupt = false;
function updateT(t, automatic){
	if (!automatic){ manualHoverInterupt = true; }
	currentHover = t;
	
	interpolationLine.mouse(t);

	var updateI = d3.ease(interpolationLine.ease())(t);
	[tweenCandleBar, naiveCandleBar].forEach(function(graph){
		graph.mouse(updateI);
	})
}
updateT(0);


d3.select('#playButton')
		.on('click', function(){
			manualHoverInterupt = false
			var i = d3.interpolate(currentHover, currentHover === 1 ? 0 : 1);
			d3.timer(function(t){
				updateT(i(Math.min(t, 1000)/1000), true);
				return t > 1000 || manualHoverInterupt; 
			})
		})