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

var onSub = (channel, user) => {
	db.find(db.db(), "greeting", {
		"Channel": channel,
		"Type": _consts.greeting.sub
	}, (rows) => {
		if(rows.length > 0){
			_client.say(channel, formatGreetingText(rows[0].OutputText, util.getDisplayName(user)));
		}
	});
};

var onResub = (channel, user, months) => {
	db.find(db.db(), "greeting", {
		"Channel": channel,
		"Type": _consts.greeting.resub
	}, (rows) => {
		if(rows.length > 0){
			_client.say(channel, formatGreetingText(rows[0].OutputText, util.getDisplayName(user), months));
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
