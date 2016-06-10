"use strict";

var util = require("../util.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

var _timeout = {
	"help": "!to [username] [0-9hms]"
};
module.exports = _timeout;

var timeout = (channel, to_user, lengthString) => {
	var matches = /([0-9]+)([smh])/gi.exec(lengthString);

	var num = matches[1];
	var time = matches[2].toLowerCase();
	to_user = to_user.toLowerCase();

	var toTime = 0;
	var nTime = "";

	// hours
	if(time === "h"){
		toTime = (num * 60) * 60;
		nTime = "hours";
	}

	if(time === "m"){
		toTime = num * 60;
		nTime = "minutes";
	}

	if(time === "s"){
		toTime = num;
		nTime = "seconds";
	}

	if(toTime > 0){
		util.say(process.env.channel, util.getDisplayName(user) + " -> Timing out \"" + to_user + "\" for " + num + " " + nTime + ".");

		process.send({
			"func": "timeout_user",
			"channel": process.env.channel,
			"username": to_user,
			"time": toTime
		});
	}
};

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	timeout(process.env.channel, args[1], args[2]);
}
