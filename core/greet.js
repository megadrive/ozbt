
var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

var greet = args[1] ? args[1].toLowerCase() : undefined;
var string = args.splice(2).join(" ");

function updateMessage(type, message){
	var selector = {
		"Channel": process.env.channel,
		"Type": type
	};
	var update = {
		"OutputText": string
	};

	if(greet === undefined || greet !== "sub" || greet !== "resub" || greet !== "cheer")
		return;

	// @TODO: Change to an upsert
	db.update( "greeting", selector, update, (rows) => {
		if(rows.length === 1){
			util.say(process.env.channel, util.getDisplayName(user) + " -> Greeting for \"" + greet + "\" has been updated.");
		}
		else if(rows.length === 0){ // none found
			selector["OutputText"] = string;
			db.insert( "greeting", selector, (rows) => {
				if(rows.inserted.length){
					util.say(process.env.channel, util.getDisplayName(user) + " -> Greeting for \"" + greet + "\" has been created.");
				}
			});
		}
	});
}

var sub = () => {
	updateMessage(consts.greeting.sub, string);
};

var resub = () => {
	updateMessage(consts.greeting.resub, string);
};

var cheer = () => {
	updateMessage(consts.greeting.cheer, string);
};

var del = () => {
	if(string != undefined){
		db.delete("greeting", {
			"Channel": process.env.channel,
			"Type": consts.greeting[string.toLowerCase()]
		}, (err, arr) => {
			if(err)
				throw new Error(err);

			if(arr.length){
				util.say(process.env.channel, util.getDisplayName(user) + " -> Greeting for \"" + string + "\" has been deleted.");
			}
		});
	}
};

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	switch(greet){
		case "sub":
			sub();
			break;
		case "resub":
			resub();
			break;
		case "cheer":
			cheer();
			break;
		case "delete":
			del();
			break;
	}
}
