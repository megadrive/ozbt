
var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

var access = args[2] ? args[2].toLowerCase() : undefined;
var command = args[1];

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	var newAccess = consts.access.broadcaster;
	switch(args[2]){
		case "everybody":
			newAccess = consts.access.everybody;
			break;
		case "regular":
			newAccess = consts.access.regular;
			break;
		case "subscriber":
			newAccess = consts.access.subscriber;
			break;
		case "moderator":
			newAccess = consts.access.moderator;
			break;
		case "supermoderator":
			newAccess = consts.access.supermoderator;
			break;
		case "broadcaster":
			newAccess = consts.access.broadcaster;
			break;
		default:
			newAccess = -1;
	}

	db.join(db.db(), "customcommand", "commandpermission", {
		"Channel": process.env.channel,
		"Command": command
	}, {
		"Channel": "Channel",
		"Command": "Command",
		"$require": false
	}, (results) => {
		// Just in case there is somehow more than one result, use the first.
		if(results.length){
			if(access){
				db.db().collection("commandpermission").load(() => {
					// Upsert = Update or insert.
					db.db().collection("commandpermission").upsert({
						"_id": results[0]._id,
						"Channel": process.env.channel,
						"Command": command,
						"PermissionLevel": newAccess
					}, (result) => {
						if(result.length){
							util.say(process.env.channel, util.getDisplayName(user) + " -> Access for " + command + " has been changed to " + access);
						}

						db.db().collection("commandpermission").save();
					});
				});
			}
			else {
				var accessKey = util.getKeyFromValue(consts.access, results[0].commandpermission.PermissionLevel);

				util.say(process.env.channel, util.getDisplayName(user) + " -> " + results[0].Command + " is available to " + accessKey + " (and above).");
			}
		}
	});
}
