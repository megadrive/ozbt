
var util = require("../util.js");
var db = require("../mysqlHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

/**
 * !access command userlevel
 */

var static = {
	"help": "!access <command> <broadcaster|supermoderator|moderator|regular|everybody>"
};
module.exports = static;

var access = args[2].toLowerCase();
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

	if( newAccess >= 0 ){
		db.find(db.db(), "customcommand", {
			"Channel": process.env.channel,
			"Command": args[1]
		}, (rows) => {
			if( rows.length === 1 ){
				db.find(db.db(), "commandpermission", {
					"Channel": process.env.channel,
					"Command": args[1]
				}, (rows) => {
					// Existing permission
					if(rows.length === 1){
						db.update(db.db(), "commandpermission", "Command='" + args[1] + "'", {
							"PermissionLevel": newAccess
						}, (rows) => {
							if(rows.affectedRows > 0){
								util.say(process.env.channel, util.getDisplayName(user) + " -> Access for " + args[1] + " set to " + args[2] + ".");
							}
						});
					}
					else{
						db.insert(db.db(), "commandpermission", {
							"Command": args[1],
							"PermissionLevel": newAccess,
							"Channel": process.env.channel
						}, (rows) => {
							if(rows.length > 0){
								util.say(process.env.channel, util.getDisplayName(user) + " -> Access for " + args[1] + " set to " + args[2] + ".");
							}
						});
					}
				});
			}
		});
	}
	else {
		util.say(process.env.channel, util.getDisplayName(user) + " -> Invalid access level.");
	}
}
