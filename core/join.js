
var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var config = require("../config/config.user.js");
var user = JSON.parse(process.env.user);

if("#" + config.username === process.env.channel){
	process.send({
		"action": "join_channel",
		"channel": "#" + user.username
	});

	db.insert("channel", {
		"Channel": "#" + user.username
	});
}
