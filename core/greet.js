
var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

var greet = args[1];
var string = args.splice(2).join(" ");

function updateGreeting(greeting, text){
	if(greeting.startsWith("sub")) greeting = "sub";
	if(greeting.startsWith("resub")) greeting = "resub";

	var selector = {
		"Channel": process.env.channel,
		"Type": consts.greeting[greeting]
	};
};

var sub = () => {
	db.find(db.db(), "greeting", {
		"Channel": process.env.channel,
		"Type": consts.greeting.sub
	}, (rows) => {
		if( string != undefined ){
			if(rows.length > 0){
				db.update(db.db(), "greeting", {
					"Channel": process.env.channel,
					"Type": consts.greeting.sub
				}, {"OutputText": string}, (rows) => {
					if(rows.affectedRows === 1){
						util.say(process.env.channel, util.getDisplayName(user) + " -> Greeting for \"" + greet + "\" has been updated.");
					}
				});
			}
			else {
				db.insert(db.db(), "greeting", {
					"Channel": process.env.channel,
					"Type": consts.greeting.sub,
					"OutputText": string
				}, (rows) => {
					if(rows.affectedRows === 1){
						util.say(process.env.channel, util.getDisplayName(user) + " -> Greeting for \"" + greet + "\" has been updated.");
					}
				});
			}
		}
		else {
			util.say(process.env.channel, util.getDisplayName(user) + " -> " + rows[0].OutputText);
		}
	});
};

var resub = () => {
	db.find(db.db(), "greeting", {
		"Channel": process.env.channel,
		"Type": consts.greeting.resub
	}, (rows) => {
		if(rows.length > 0){
			db.update(db.db(), "greeting", {
				"Channel": process.env.channel,
				"Type": consts.greeting.resub
			}, {"OutputText": string}, (rows) => {
				if(rows.affectedRows === 1){
					util.say(process.env.channel, util.getDisplayName(user) + " -> Greeting for \"" + greet + "\" has been updated.");
				}
			});
		}
		else {
			db.insert(db.db(), "greeting", {
				"Channel": process.env.channel,
				"Type": consts.greeting.resub,
				"OutputText": string
			}, (rows) => {
				if(rows.affectedRows === 1){
					util.say(process.env.channel, util.getDisplayName(user) + " -> Greeting for \"" + greet + "\" has been updated.");
				}
			});
		}
	});
};

var del = () => {
	if(string != undefined){
		db.delete(db.db(), "greeting", {
			"Channel": process.env.channel,
			"Type": consts.greeting[string.toLowerCase()]
		}, (rows) => {
			if(rows.affectedRows > 0){
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
		case "delete":
			del();
			break;
	}
}
