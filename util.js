
var locallydb = require('locallydb');
var db = new locallydb('db/_app');

module.exports = {
	'version': function(){
		var fs = require('fs');
		var f = fs.readFileSync('./package.json', {'encoding':'utf8'});
		var j = JSON.parse(f);
		return 'v' + j.version;
	},

	/**
	 * Check a user's access.
	 * `channel` is a string. must include the # because there's no check for it
	 * `userObject` is the user object given by the twitch-irc chat event, amongst others. if twitch-irc gives it to you, its a user object
	 * `access_level` is a string literal and can be:
	 * - broadcaster
	 * - moderator
	 * - staff
	 * - global_mod
	 * - viewer
	 */
	'checkAccess': function(channel, userObject, trigger, access_level){
		var rv = false;
		var userCollection = db.collection('channel_users');
		var accessCollection = db.collection('channel_access');
		var specialCollection = db.collection('special_users');

		// see if we have an override for the command
		var override = accessCollection.where({
			'channel': channel,
			'trigger': trigger
		});
		if( override.items.length > 0 ){
			access_level = override.items[0].access.toLowerCase(); // toLowerCase to be safe
		}
		else {
			access_level = access_level.toLowerCase();
		}

		var special = specialCollection.where({'username': userObject.username});
		if( special.items.length && special.items[0].access === 'admin' ){
			rv = true;
		}

		if( access_level === 'everybody' ){
			rv = true;
		}
		// if sub, add to database. TODO: scoped api calls
		else if( userObject.special.indexOf('subscriber') >= 0 ){
			rv = true;
		}
		else if( channel === '#' + userObject.username ){
			rv = true; // is broadcaster, who has access to all commands
		}
		// this else is to check for moderators.
		else {
			var users = userCollection.where({
				'channel': channel,
				'username': userObject.username
			});
			if( users.items.length > 0 && users.items[0].special.indexOf(access_level) >= 0 ){
				rv = true; // has required access.
			}
		}

		return rv;
	},
	/**
	 * Convenience function, saves creating the whole block every time in commands.
	 */
	'say': function(channel, message){
		process.send({
			'channel': channel,
			'command': 'say',
			'message': message
		});
	}
}
