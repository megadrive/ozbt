
var util = require("../util.js");
var db = require("../mysqlHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

/**
 * !cmd add !poop I poop back and forth.
 * !cmd add !poop -c 10 I poop back and forth, but never more than once every 10 seconds.
 * !cmd edit !poop You do, not me.
 * !cmd delete !poop
 */

var static = {
	"help": "!cmd <add|edit|delete> <command> [-c N] <output text>"
};
module.exports = static;

var cooldown = null; // null => unspecified
var argPtr = 1;
var intent = args[argPtr++];
var cmd = args[argPtr++];
if(args[argPtr] === "-c") {
	++argPtr; // Skip -c
	cooldown = Number(args[argPtr++]);
}
var string = args.splice(argPtr).join(" ");

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
			// remove / if at the beginning of the string to prevent abuse.
			var rslashes = /^\/+/;
			string = string.replace(rslashes, "");
			
			if(!checkCooldown())
				return;
			if(cooldown === null)
				cooldown = 0; // Set a default value

			db.insert(db.db(), "customcommand", {
				"Command": cmd,
				"OutputText": string,
				"Channel": process.env.channel,
				"Cooldown": cooldown
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
			if(!checkCooldown())
				return;
			
			var updateData = {"OutputText": string};
			if(cooldown !== null) // If cooldown is unspecified, don't include it in the query
				updateData.Cooldown = cooldown;
				
			db.update(db.db(), "customcommand", "Command='" + cmd + "'", updateData, (rows) => {
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

/**
 * Checks that all is good with the user provided cooldown
 */
function checkCooldown() {
	if(cooldown === null)
		return true;
	// Validate the cooldown value
	if(isNaN(cooldown) || cooldown < 0) {
		util.say(process.env.channel, util.getDisplayName(user) + " -> The cooldown must be a positive number (minimum amount of seconds between each use of the command). Please try again.");
		return false;
	}
	// Convert from seconds to ms
	cooldown *= 1000;
	// Remove decimal part
	cooldown |= 0; // 8.4 | 0 === 8
	return true;
}