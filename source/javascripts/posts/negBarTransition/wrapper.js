var interpolationLine = graphs.interpolationLine()
		.parent(d3.select('#interpolationLine').node())
		.ease('cubic-in-out')
		.draw();

interpolationLine.on('mouseIndex', function(index){
	console.log(index);
	interpolationLine.mouse(index);
})

var dispatchingGraphs = [interpolationLine];
var listeningGraphs = dispatchingGraphs.slice().concat([]);

dispatchingGraphs.forEach(function(graph){
	graph.on('mouseIndex', updateHover);
})

function updateHover(index){
	listeningGraphs.forEach(function(graph){
		graph.mouse(index);
	})
}

updateHover(0)