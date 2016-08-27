"use strict";

var _config = require("../config/config.user.js");
var _client = undefined;
var consts = require("../consts.js");
var db = require("../dbHelpers.js");
var util = require("../util.js");

// only count lines per channel
var loki = require("lokijs");
var ldb = new loki(consts.lokidb);
var coll = ldb.addCollection("linedcmds");

var tbl = "linedcmds";

var onChat = (channel, user, message, self) => {
	if(!self){
		var chan = coll.find({"Channel": channel});

		if(chan.length === 0){
			coll.insert({
				"Channel": channel,
				"Lines": 0
			});
		}
		else {
			chan[0].Lines++;

			coll.update(chan);
		}

		db.find(db.db(), tbl, {"Channel": channel}, (rows) => {
			if(rows.length === 1){
				var lines = rows[0].Lines;

				if(chan.length && chan[0].Lines >= lines){
					var cmds = JSON.parse(rows[0].Commands);
					var rnd = Math.floor(Math.random() * cmds.length);

					db.find(db.db(), "customcommand", {"Channel": channel, "Command": cmds[rnd]}, (rows) => {
						if(rows.length === 1){
							_client.say(channel, rows[0].OutputText);
							chan[0].Lines = 0;
							coll.update(chan);
						}
					});
				}
			}
		});
	}
};

var linedcmds = {
	"register": (client) => {
		_client = client;
	},
	"onChat": onChat
};

module.exports = linedcmds;
