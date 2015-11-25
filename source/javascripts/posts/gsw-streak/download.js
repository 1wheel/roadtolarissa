var fs = require('fs')
var nba = require('nba')


;["0021500200", "0021500214", "0021500187", "0021500177", "0021500164", "0021500144", "0021500125", "0021500120", "0021500104", "0021500092", "0021500083", "0021500069", "0021500051", "0021500035", "0021500030", "0021500003"].forEach(function(id){
	nba.api.playByPlay({gameId: id}, function(err, res){
		fs.writeFile(__dirname + '/raw/' + id + '.json', JSON.stringify(res), function(){})
	})
})


