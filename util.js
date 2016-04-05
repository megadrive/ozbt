
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
	"checkPermissionCore": (channel, user, requiredPermission) => {
		var rv = false;

		if( requiredPermission === consts.access.everybody ){
			rv = true;
		}

		if( requiredPermission === consts.access.regular ){
			db.find(db.db(), "regular", {
				"Channel": channel,
				"Username": user.username
			}, (rows) => {
				if(rows.length === 1){
					rv = true;
				}
			});
		}

		if( requiredPermission === consts.access.subscriber ){
			if( user.subscriber === true ){
				rv = true;
			}
		}

		if( requiredPermission === consts.access.moderator ){
			if( user['user-type'] === 'mod' ){
				rv = true;
			}
		}

		if( requiredPermission === consts.access.supermoderator ){
			db.find(db.db(), "supermoderator", {
				"Channel": channel,
				"Username": user.username
			}, (rows) => {
				if(rows.length === 1){
					rv = true;
				}
			});
		}

		// Broadcaster
		if( channel === "#" + user.username ){
			rv = true;
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
