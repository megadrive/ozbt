/**
 * Lets the streamer know if the bot is in his/her channel.
 * @author Megadrive
 *
 * !ozbt
 */

var args = process.argv.splice(2);
var util = require('../util.js');

var user = JSON.parse(args[1]);

// @TODO Possibly change this to be available to everyone by default.
if( util.checkAccess(args[0], user, args[2], 'moderator') ){
	util.say(args[0], 'ozbt (' + util.version() + ') is a free, open-source Twitch bot by @megadriving. Check out the documentation at https://github.com/megadrive/ozbt');
}
