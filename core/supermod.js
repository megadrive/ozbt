
var util = require("../util.js");
var db = require("../mysqlHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

/**
 * !supermod add username
 * !supermod edit username
 * !supermod delete username
 */

var static = {
	"help": "!supermod <add|delete> username"
};
module.exports = static;

var supermodUsername = args[2] != undefined ? args[2].toLowerCase() : undefined;

var add = () => {
	// Check for existance. If it exists already, output an error.
	db.find(db.db(), "supermoderator", {
		"Channel": process.env.channel,
		"Username": supermodUsername
	}, (rows) => {
		if( rows.length > 0 ){
			// We have a command already, output a warning
			util.say(process.env.channel, util.getDisplayName(user) + " -> super moderator " + supermodUsername + " already exists.");
		}
		else {
			db.insert(db.db(), "supermoderator", {
				"Channel": process.env.channel,
				"Username": supermodUsername
			}, (rows) => {
				if( rows.affectedRows === 1 ){
					util.say(process.env.channel, util.getDisplayName(user) + " -> super moderator \"" + supermodUsername + "\" was added.");
				}
				else {
					console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
				}
			});
		}
	});
};

var del = () => {
	db.find(db.db(), "supermoderator", {
		"Channel": process.env.channel,
		"Username": supermodUsername
	}, (rows) => {
		if( rows.length > 0 ){
			db.delete(db.db(), "supermoderator", {
				"Channel": process.env.channel,
				"Username": supermodUsername
			}, (rows) => {
				if( rows.affectedRows === 1 ){
					util.say(process.env.channel, util.getDisplayName(user) + " -> super moderator \"" + supermodUsername + "\" was deleted.");
				}
			});
		}
	});
};

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	var help = util.getDisplayName(user) + " -> !supermod <add|delete> <username>";
	if( supermodUsername === undefined ){
		util.say(process.env.channel, help);
	}
	else {
		switch(args[1]){
			case "add":
				add();
				break;
			case "delete":
				del();
				break;
			default:
				util.say(process.env.channel, help);
		}
	}
}
