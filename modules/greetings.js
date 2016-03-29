"use strict";

var _config = require("../config/config.user.js");
var _client = undefined;
var db = require("../mysqlHelpers.js");
var _consts = require("../consts.js");
var util = require("../util.js");

/**
 * Convenience function.
 */
var formatGreetingText = (text, username, months) => {
	var s = text.replace(/\$username\$/gi, username);
	s = s.replace(/\$months\$/gi, months);
	s = s.replace(/\$s\$/gi, months > 1 ? 's' : '');

	return s;
};

var onSub = (channel, username) => {
	db.find(db.db(), "greeting", {
		"Channel": channel,
		"Type": _consts.greeting.sub
	}, (rows) => {
		if(rows.length > 0){
			util.say(channel, formatGreetingText(rows[0], username));
		}
	});
};

var onResub = (channel, username, months) => {
	db.find(db.db(), "greeting", {
		"Channel": channel,
		"Type": _consts.greeting.resub
	}, (rows) => {
		if(rows.length > 0){
			util.say(channel, formatGreetingText(rows[0], username));
		}
	});
};

var _greetings = {
	"register": (client) => {
		_client = client;
	},
	"onSub": onSub,
	"onResub": onResub
};

module.exports = _greetings;
