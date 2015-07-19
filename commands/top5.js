/**
 * Shows the users with the most points.
 * @author Megadrive
 *
 * !top5
 */

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);
var util = require('../util.js');
var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var pointsCollection = db.collection('points');

function sortPoints(a,b){
	return b.points < a.points ? -1 : 1;
}
if( util.checkAccess(args[0], user, args[2], 'moderator') ){
	var points = pointsCollection.where({'channel': args[0]});
	points.items.sort(sortPoints);

	var amount = 5;
	var top5 = points.items.splice(0, amount);

	var arr = [];
	for(var user of top5){
		if( user.points > 0 ){
			arr.push(user.username + ': ' + user.points);
		}
	}

	var output = arr.join(', ');

	process.send({
		'command': 'say',
		'channel': args[0],
		'message': output
	});
}
