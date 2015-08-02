/**
 * Checks if you're sub
 * @author Megadrive
 *
 * !examples
 */

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);
var util = require('../util.js');

var subText = 'You are not sub for ' + args[0] + ' according to me.';
if(util.checkAccess(args[0], user, args[2], 'subscriber')){
	subText = 'You ARE sub for ' + args[0] + ' according to me. Feel free to use the sub commands.';
}

util.say(args[0], subText);
