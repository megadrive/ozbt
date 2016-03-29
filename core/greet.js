
var util = require("../util.js");
var db = require("../mysqlHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

/**
 * !greet sub !poop I poop back and forth.
 * !greet resub !poop You do, not me.
 * !greet delete resub
 */

var static = {
	"help": "!greet <sub|resub> <output text> (see docs for variables)"
};
module.exports = static;

var greet = args[1];
var string = args.splice(2).join(" ");

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
