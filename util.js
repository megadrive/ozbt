
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
		console.log(userObject);
		var rv = false;
		var userCollection = db.collection('channel_users');

		// make access level lowercase
		access_level = access_level.toLowerCase();

		// if sub, add to database. TODO: scoped api calls
		if( userObject.special.indexOf('subscriber') >= 0 ){
			var sub = userCollection.where({
				'channel': channel,
				'username': userObject.username
			});
			// we have a user and 'subscriber' does not exist in the specials attribute.
			if(sub.items.length > 0){
				var specials = sub.items[0].special;
				if( specials.indexOf('subscriber') === false ){
					userCollection.update(sub.items[0].cid, {'special': specials});
					userCollection.save();
				}
			}
			// user doesn't already have sub. must have got it in between chat lines
			else{
				userCollection.insert({
					'channel': channel,
					'username': userObject.username,
					'specials': ['subscriber']
				})
			}
		}

		if( channel === '#' + userObject.username ){
			rv = true; // is broadcaster, who has access to all commands
		}
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
	}
}
