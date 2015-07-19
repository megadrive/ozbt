/**
 * Lets the streamer know if the bot is in his/her channel.
 * @author Megadrive
 *
 * !ozbt
 */

var args = process.argv.splice(2);
var util = require('../util.js');

var user = JSON.parse(args[1]);

// only show if the broadcaster
if( util.checkAccess(args[0], user, args[2], 'broadcaster') ){
	process.send({
		'command': 'say',
		'channel': args[0],
		'message': 'ozbt is a free, open-source Twitch bot: http://github.com/megadrive/ozbt (' + util.version() + ')'
	});
}