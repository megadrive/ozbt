/**
 * Shows a user's points in chat.
 * @Megadrive
 *
 * !points
 */

var args = process.argv.splice(2);
var points = require('../points.js');

var user = JSON.parse(args[1]);

var userPoints = points.get(args[0], user.username);

process.send({
	'command': 'whisper',
	'username': user.username,
	'message': 'You have ' + userPoints + ' points!'
});
