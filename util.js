
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
	 * usage:
	 * var util = require('../util.js');
	 * var db = util.getDb();
	 */
	'getDb': function(){
		return db;
	},

	/**
	 * Gets either the display name or the username of a userObject, preferring the display-name.
	 */
	'getDisplayName': function(userObj){
		var rv = 'undefined';

		if( userObj ){
			rv = userObj.username;

			if( userObj['display-name'] != undefined ){
				rv = userObj['display-name'];
			}
		}

		return rv;
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

		// make access level lowercase
		access_level = access_level.toLowerCase();

		if( access_level === 'everybody' ){
			rv = true;
		}

		if( channel === '#' + userObject.username ){
			rv = true; // is broadcaster, who has access to all commands
		}

		if( userObject.subscriber === true && (access_level === 'subscriber' || access_level === 'moderator') ){
			rv = true;
		}

		if( access_level === 'moderator' ){
			if( userObject['user-type'] === 'mod' ){
				rv = true;
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
