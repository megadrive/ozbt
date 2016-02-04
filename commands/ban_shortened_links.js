/**
 * Toggles banning shortened links or not.
 * @author Megadrive
 *
 * !banlinks on|off
 */

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);
var util = require('../util.js');
var locallydb = require('locallydb');
var db = new locallydb('db/_app');

if(util.checkAccess(args[0], user, args[2], 'moderator')){
	var channel_settings = db.collection('channel_settings');
	var margs = args[3].split(' ');
	margs[1] = margs[1] != undefined ? margs[1].toLowerCase() : undefined;

	var curr_settings = channel_settings.where({
		'channel': args[0]
	});
	var curr = curr_settings.items[0];

	if( margs[1] === 'on' || margs[1] === 'off' ){
		if( curr_settings.items.length === 1 ){
			var curr_val = curr.on;

			channel_settings.update(curr.cid, {
				'banshortenedlinks': margs[1]
			});
		}
		else{
			channel_settings.insert({
				'channel': args[0],
				'banshortenedlinks': margs[1]
			});
		}

		channel_settings.save();

		var on = (curr_val === undefined ? 'off' : curr_val.on)
		var txt = on === 'on' ? '' : 'dis';
		util.say(args[0], util.getDisplayName(user) + ' -> Shortened links are ' + txt + 'allowed. ' + (txt == 'off' ? 'Users will be timed out for an hour if you post a shortened link.' : ''));

	}
	else {
		// output current
		var on = (curr === undefined ? 'off' : curr.on)
		var txt = on === 'off' ? '' : 'dis';
		util.say(args[0], util.getDisplayName(user) + ' -> Shortened links are ' + txt + 'allowed. ' + (txt == 'off' ? 'Users will be timed out for an hour if you post a shortened link.' : ''));
	}
}
