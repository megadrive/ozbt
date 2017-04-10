"use strict"

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

	db.update("commandpermission", {
		"Channel": process.env.channel,
		"Command": command
	}, {
		"PermissionLevel": newAccess
	}, {"upsert": true})
		.then(function(result){
			if(result.ok){
				util.say(process.env.channel, util.getDisplayName(user) + " -> " + command + " access updated to \"" + args[2].toLowerCase() + "\".");
			}
		});
}

/**
 * Export documentation
 */
module.exports = {
	"docs": {
		"{command} {accessLevel}": {
			"command": "The command you wish to change.",
			"accessLevel": "The access level to change to, possible values: " + Object.keys(consts.access).join(" | ")
		}
	}
};
