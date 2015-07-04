/**
 * Lets the streamer know if the bot is in his/her channel.
 * @author Megadrive
 *
 * !ozbt
 */

var args = process.argv.splice(2);
var util = require('util');

var user = JSON.parse(args[1]);

// only show if the broadcaster
if( user.special[0] === 'broadcaster' ){
	process.send({
		'command': 'say',
		'channel': args[0],
		'message': 'I\'m here, ' + user.username + '.'
	});
}