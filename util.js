
var consts = require("./consts.js");
var db = require("./mysqlHelpers.js");

module.exports = {
	'version': function(){
		var fs = require('fs');
		var f = fs.readFileSync('./package.json', {'encoding':'utf8'});
		var j = JSON.parse(f);
		return 'v' + j.version;
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

	// @var user user object
	"checkPermissionCore": (channel, user, atLeastPermission) => {
		// Everybody
		var rv = true;

		// Broadcaster
		if("#" + user.username != channel){
			// Super Moderator
			if( atLeastPermission >= consts.access.supermoderator ){
				db.find(db.db(), "supermoderator", {
					"Channel": channel,
					"Username": user.username
				}, (rows) => {
					if(rows.length === 0){
						// Moderator
						if(user["user-type"] != null && user["user-type"].indexOf("mod") == false){
							// Subscriber
							if(user.subscriber == false){
								// Regular
								if( atLeastPermission >= consts.access.regular ){
									db.find(db.db(), "regular", {
										"Channel": channel,
										"Username": user.username
									}, (rows) => {
										if(rows.length === 0){
											rv = false;
										}
									});
								}
							}
						}
					}
				});
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
			'func': 'say',
			'message': message
		});
	},

	/**
	 * Gets the last time the #command was used in the #channel.
	 */
	'commandLastUsed': (command, channel) => {
		return 99; // @TODO: Add this command.
	}
}
