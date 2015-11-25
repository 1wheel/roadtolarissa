var fs = require('fs')


var games = []
;["0021500200", "0021500214", "0021500187", "0021500177", "0021500164", "0021500144", "0021500125", "0021500120", "0021500104", "0021500092", "0021500083", "0021500069", "0021500051", "0021500035", "0021500030", "0021500003"].forEach(function(id){
	var game = JSON.parse(fs.readFileSync(__dirname + '/raw/' + id + '.json', 'utf-8'))
	game.playByPlay = game.playByPlay.filter(function(d){ return d.score })

	game.playByPlay.forEach(function(d){
		delete d.eventmsgactiontype
		delete d.eventmsgtype
		delete d.neutraldescription
		delete d.scoremargin
		delete d.wctimestring
	})

	games.push(game)
})

fs.writeFile(__dirname + '/' + 'all-games' + '.json', JSON.stringify(games), function(){})

