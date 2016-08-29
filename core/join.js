
var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

if("#" + user.username === process.env.channel){
	process.send({
		"action": "join_channel",
		"channel": "#" + user.username
	});

	db.insert(db.db(), "channel", {
		"Channel": "#" + user.username,
		"JoinOnAppOpen": consts.true
	}, (rows) => {
		if(rows.inserted.length === 1){
			console.info("Joined channel", user.username);
		}
		else {
			console.warn("Could not join channel", user.username);
		}
	});
}
