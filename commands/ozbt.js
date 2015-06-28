/**
 * Lets the streamer know if the bot is in his/her channel.
 */

var args = process.argv.splice(2);
var util = require('util');

var data = JSON.parse(args[1]);

// only show if the broadcaster
if( data.special[0] === 'broadcaster' ){
	process.send({
		'command': 'say',
		'channel': data.username,
		'message': 'I\'m here, ' + data.username + '.'
	});
}