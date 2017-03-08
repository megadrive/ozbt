
var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

var intent = args[1];
var cmd = args[2];
var string = args.splice(3).join(" ");

// Add a new custom command
// @TODO: This can be changed to not use db.find(). Use the cb to figure out output.
function add(){
		// Check for existance. If it exists already, output an error pointing to !cmd edit.
		db.find("customcommand", {
				"Channel": process.env.channel,
				"Command": cmd
		}).then((command) => {
				if(command){
					// We have a command already, output a warning
					util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " already exists, did you mean to use !cmd edit?");
				}
				else {
					// remove / if at the beginning of the string to prevent abuse.
					var rslashes = /^\/+/;
					string = string.replace(rslashes, "");

					db.insert("customcommand", {
							"Command": cmd,
							"OutputText": string,
							"Channel": process.env.channel
					}, function resolve(){
							util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " was created.");
						},
						function reject(errmsg){
							util.say(process.env.channel, util.getDisplayName(user) + " -> command creation went wrong: " + errmsg);
						});
				}
		})
		.catch((reason) => {
			console.error(new Error("Hello! " + reason));
		});
};

function edit(){
	var rslashes = /^\/+/;
	string = string.replace(rslashes, "");

	var select = {
		"Command": cmd,
		"Channel": process.env.channel
	};
	var update = {
		"OutputText": string
	};
	db.update("customcommand", select, update)
		.then(function(result){
			if( result.ok ){
					util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " was updated.");
			}
			else {
					console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
			}
		});
};

function del(){
	db.delete("customcommand", {"Command": cmd, "Channel": process.env.channel})
		.then(function(deleted){
			console.info(deleted);
			if( deleted.ok && deleted.value ){
					util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " was deleted.");
			}
			else {
					util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " doesn't exist. Did you mean to use !cmd add?");
			}
		});
};

// @NOTE: This function will be a mess. Fix it asap.
function list(db, channel, userObj){
	// @TODO: Add this.
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
		case "list":
			list(process.env.channel, user);
			break;
	}
}

// This is here so that we can create alias commands. !commands will be an alias for list
module.exports = {
	"list": list
};
