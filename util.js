
var locallydb = require('locallydb');
var db = new locallydb('db/_app');

module.exports = {
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
	'checkAccess': function(channel, userObject, access_level){
		var rv = false;

		if( channel === '#' + userObject.username ){
			rv = true; // is broadcaster, who has access to all commands
		}
		else if ( access_level === 'viewer' ){
			rv = true; // viewers are the lowest access level, allow by default.
		}
		else {
			var userCollection = db.collection('channel_users');
			var users = userCollection.where({
				'channel': channel,
				'username': userObject.username
			});
			if( users.items.length > 0 && users.items[0].type === access_level ){
				rv = true; // has required access.
			}
		}

		return rv;
	}
}
