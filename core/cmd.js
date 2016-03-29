
var util = require("../util.js");
var db = require("../mysqlHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

/**
 * !cmd add !poop I poop back and forth.
 * !cmd edit !poop You do, not me.
 * !cmd delete !poop
 */

var static = {
	"help": "!cmd <add|edit|delete> <output text>"
};
module.exports = static;

var intent = args[1];
var cmd = args[2];
var string = args.splice(3).join(" ");

// Add a new custom command
var add = () => {
	// Check for existance. If it exists already, output an error pointing to !cmd edit.
	db.find(db.db(), "customcommand", {
		"Channel": process.env.channel,
		"Command": cmd
	}, (rows) => {
		if( rows.length > 0 ){
			// We have a command already, output a warning
			util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " already exists, did you mean to use !cmd edit?");
		}
		else {
			db.insert(db.db(), "customcommand", {
				"Command": cmd,
				"OutputText": string,
				"Channel": process.env.channel
			}, (rows) => {
				if( rows.affectedRows === 1 ){
					util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " was created.");
				}
				else {
					console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
				}
			});
		}
	});
};

var edit = () => {
	// Check for existance. If it exists already, output an error pointing to !cmd edit.
	db.find(db.db(), "customcommand", {
		"Channel": process.env.channel,
		"Command": cmd
	}, (rows) => {
		if( rows.length === 1 ){
			db.update(db.db(), "customcommand", "Command='" + cmd + "'", {"OutputText": string}, (rows) => {
				if( rows.affectedRows === 1 ){
					util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " was updated.");
				}
				else {
					console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
				}
			});
		}
		else if( rows.length > 1 ){
			console.error("ERROR: There are duplicate entries for the channel command " + cmd + " in channel " + process.env.channel + "!");
		}
		else {
			// We don't have a command, output a warning.
			util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " doesn't exist, did you mean to use !cmd add?");
		}
	});
};

var del = () => {
	// Check for existance. If it exists already, output an error pointing to !cmd edit.
	db.find(db.db(), "customcommand", {
		"Channel": process.env.channel,
		"Command": cmd
	}, (rows) => {
		console.log(rows);
		if( rows.length > 0 ){
			if( rows.length > 1 )
				console.error("ERROR: There were duplicate entries for the channel command " + cmd + " in channel " + process.env.channel + "! They have all been removed now.");

			db.delete(db.db(), "customcommand", {"Command": cmd}, (rows) => {
				if( rows.affectedRows === 1 ){
					util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " was deleted.");
				}
				else {
					console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
				}
			});
		}
		else {
			// We don't have a command, output a warning.
			util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " doesn't exist, did you mean to use !cmd add?");
		}
	});
};

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	switch(intent){
		case "add":
			add();
			break;
		case "edit":
			edit();
			break;
		case "delete":
			del();
			break;
	}
}
