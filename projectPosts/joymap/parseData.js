fs = require('fs')
_ = require('lodash-node')


// 286 longitude bands
var breaks = [];
for (var i = 0; i < 286; i++){ breaks.push([]); }

var years = [];

//ileNames = fs.readdirSync('rawData/')
fileNames = ["glp90ag30.asc", "glp95ag30.asc", "glp00ag30.asc", "glp05ag30.asc", "glp10ag30.asc", "glp15ag30.asc"];
fileNames.forEach(function(fileName){
	var data = fs.readFileSync('rawData/' + fileName, 'ascii');
	var lines = data.split('\n')
		//remove meta data rows
		.filter(function(d){ return d.length > 100; })
		.map(function(line){
			//delimited by spaces
			return line.split(' ')
				.map(function(d){ return +d; })
				//sum pairs of elements, then remove half to reduce the size/num of lines displayed
				.map(function(d, i, array){ return i % 2 ? 0 : d + array[i + 1]; })
				.filter(function(d, i){ return i % 2 == 0; })
		})
		//sum pairs of rows, then remove every other one
		// .map(function(lineArray, i, array){
		// 	return i % 2 ? 0 : lineArray.map(function(d, j){ return d + array[i][j]; }) 
		// })
		// .filter(function(d, i){ return i % 2 == 0; })

	years.push(lines);

	lines.forEach(function(longitude, longitudeNum){
		var threshhold = 20000;
		var i = longitude.length - 2;
		var aboveThreshhold = false;
		while (i > 0){
		  i = i - 1;
		  if (aboveThreshhold != longitude[i] > threshhold){
		  	breaks[longitudeNum].push(i);
		    aboveThreshhold = longitude[i] > threshhold;
		  }
		}		
	});
});

//remove duplicates
breaks.map(_.uniq);

fs.writeFile('formatedData.json', JSON.stringify({breaks: breaks, years: years, fileNames: fileNames}));