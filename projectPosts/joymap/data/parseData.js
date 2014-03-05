fs = require('fs')
_ = require('lodash-node')


// 286 longitude bands
breaks = [];
for (var i = 0; i < 286; i++){ breaks.push([]); }

var years = [];

fileNames = fs.readdirSync('rawData/')
fileNames.forEach(function(fileName){
	var data = fs.readFileSync('rawData/' + fileName, 'ascii');
	var lines = data.split('\n').filter(function(d){ return d.length > 100; }).map(function(line){
		return line.split(' ').map(function(num){ return +num; }); 
	});

	years.push(lines);

	lines.forEach(function(longitude, longitudeNum){
		var threshhold = 10000;
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

breaks.map(_.uniq);

fs.writeFile('formatedData.json', JSON.stringify({breaks: breaks, years: years, fileNames: fileNames}));