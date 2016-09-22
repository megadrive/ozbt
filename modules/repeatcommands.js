"use strict";

var _config = require("../config/config.user.js");
var _client = undefined;
var consts = require("../consts.js");
var db = require("../dbHelpers.js");
var util = require("../util.js");
var Chance = require("chance");
var chance = new Chance();

var SensibleMinimum = 25;

/**
 * Override the line limit till the next random command text is output.
 * @param  {string} channel The channel
 * @param  {string} input The lines limit to override
 */
function lines(channel, input){
	var lines = Number(input);
	if(lines > SensibleMinimum){
		db.find(db.db(), "commandpermission", {"Channel": channel})
			.then(function(data){
			});
	}
}

var onChat = (channel, user, message, self) => {
	if(self)
		return;

	db.find(db.db(), "repeat_commands", {
		"Channel": channel
	}).then(function(data){
		if(data[0].Lines > 200){
			var rand = chance.integer({"min": 0, "max": data.length - 1});
			if(data.length){
				db.find(db.db(), "customcommand", {
					"Channel": channel,
					"Command": data[0].Command
				}).then(function(data){
					_client.say(channel, data[0].OutputText);
				});
			}

			db.db().collection("repeat_commands").updateById(data[0]._id, {"Lines": 0});
		}
	});
};

module.exports = {
	"register": (client) => {
		if(client){
			_client = client;
			_client.on("chat", onChat);
		}

		return client ? true : false;
	}
};
