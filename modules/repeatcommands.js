"use strict";

var _config = require("../config/config.user.js");
var _client = undefined;
var consts = require("../consts.js");
var db = require("../dbHelpers.js");
var util = require("../util.js");
var Chance = require("chance");
var chance = new Chance();

var SensibleMinimum = 200;

var lines = {};

var onChat = (channel, user, message, self) => {
	if(self)
		return;
	
	if(lines[channel] === undefined){
		lines[channel] = 1;
	}
	else {
		lines[channel]++;
	}
	
	if(lines[channel] >= SensibleMinimum){
		lines[channel] = 0;

		db.find("repeatcommand", {"Channel": channel})
			.then(function(doc){
				if(doc !== null){
					let commands = doc.Commands;
					let rand = chance.integer({min: 0, max:commands.length - 1});
					db.find("customcommand", {"Channel": channel, "Command": commands[rand]})
						.then(function(cmd){
							if(cmd)
								_client.say(channel, cmd.OutputText);
						});
				}
			});
	}
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
