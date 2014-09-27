// creates array of matches 
// _.flatten(d3.values(data).map(function(d){ return d3.values(d); }))

d3.json('flat-data.json', function(err, data){
	var rounds = [];
	d3.range(0, 18).forEach(function(matchNum){
		d3.range(-9, 10).forEach(function(spread){
			if (9 - Math.abs(9 - matchNum) >= spread){
				rounds.push
			}
		})
	})

})