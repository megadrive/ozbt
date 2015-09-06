
/**
 * Gets the world record for a specific game.
 */

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);
var util = require('../util.js');
var db = util.getDb();
var request = require('request');
var _ = require('underscore');

var speedrunApiUrl = 'http://www.speedrun.com/api/v1/leaderboards';

var mArgs = args[3].split(' ');
for(var a = 0; a < mArgs.length; a++){
	mArgs[a] = mArgs[a].trim();
}

// get game
var url = speedrunApiUrl + '/' + mArgs[1] + '/category/' + mArgs[2] + '?embed=players,game,category&top=1';
console.log(url);
request(url, function(err, res, body){
	var json = JSON.parse(body);

	// no error
	if( json.status == undefined ){
		var run = json.data.runs[0].run;
		if(run != undefined){
			var game = json.data.game.data.names.international;
			var category = json.data.category.data.name;

			var time = run.times.primary;
			var t = time.replace('PT', '', 'gi')
				.replace('H', ':', 'gi')
				.replace('M', ':', 'gi')
				.replace('S', '', 'gi');

			var player = json.data.players.data[0].names.international;

			var runDate = new Date(run.date);
			var today = new Date();
			var timeDiff = Math.abs(today.getTime() - runDate.getTime());
			var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

			// World record for "Grand Theft Auto: San Andreas" (100%) is 14:35:22, set by S. (420 days ago).
			var say = 'World Record for "' + game + '" (' + category + ') is ' + t + ', set by ' + player + ' (' + diffDays + ' days ago).';

			util.say(args[0], say);
		}
	}
	else {
		util.say(args[0], user['display-name'] + ', I can\'t find this game\'s abbreviation.');
	}
});
