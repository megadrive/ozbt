/**
 * Shows a user's points
 */

var args = process.argv.splice(2);
var points = require('../points.js');

var user = JSON.parse(args[1]);

var userPoints = points.get(args[0], user.username);

process.send({
	'command': 'say',
	'channel': args[0],
	'message': 'Points for ' + user.username + ': ' + userPoints
});
