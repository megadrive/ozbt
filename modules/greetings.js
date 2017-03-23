"use strict";

// @TODO: Update to MongoDB

var _client = undefined;
var db = require("../dbHelpers.js");
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
	db.find("greeting", {
		"Channel": channel,
		"Type": _consts.greeting.sub
	}, (rows) => {
		if(rows !== null){
			_client.say(channel, formatGreetingText(rows.OutputText, user));
		}
	});
};

var onResub = (channel, user, months) => {
	db.find("greeting", {
		"Channel": channel,
		"Type": _consts.greeting.resub
	}, (rows) => {
		if(rows.length > 0){
			_client.say(channel, formatGreetingText(rows[0].OutputText, user, months));
		}
	});
};

var onCheer = (channel, userstate, message) => {
	db.find( "greeting", {
		"Channel": channel,
		"Type": _consts.greeting.cheer
	})
		.then((greeting) => {
			if(greeting !== null){
				_client.say(channel, formatGreetingText(greeting.OutputText, userstate, userstate.bits));
			}
		});
};

module.exports = {
	"register": (client) => {
		if(client){
			_client = client;
			_client.on("subscription", onSub);
			_client.on("resub", onResub);
			_client.on("cheer", onCheer);
		}

		return client ? true : false;
	}
};
