"use strict";

var _config = require("./config/config.user.js");

// @Modules
var db = require("./mysqlHelpers.js");
var _commands = require("./modules/commands.js");
var _greetings = require("./modules/greetings.js");

var _tmi = require("tmi.js");
var _client = new _tmi.client({
	"options": {
		"debug": true
	},
	"connection": {
		"cluster": "aws",
		"reconnect": true
	},
	"identity": {
		"username": _config.username,
		"password": _config.oauth
	}
	// Comment this line if you don't want to log anything.
	,"logger": require("./logger.js")
});

_client.connect();

_client.on("connected", (addr, port) => {
	_commands.register(_client);

	db.findAll(db.db(), "channel", (rows) => {
		for(var r = 0; r < rows.length; r++){
			if( rows[r].JoinOnAppOpen ){
				_client.join(rows[r].Channel);
			}
		}
	}); // initial connection
});

_client.on("join", (channel, username) => {
	// If channel doesnt exist, create a new record
	db.find(db.db(), "channel", {"Channel": channel}, (rows) => {
		if( rows.length === 0 ){
			db.insert(db.db(), "channel", {"Channel": channel}, (result) => {
				if(result.affectedRows === 1 )
					console.log("> Created channel " + channel);
			});
		}
	});
});

_client.on("chat", _commands.onChat);
_client.on("subscription", _greetings.onSub);
_client.on("subscription", _greetings.onResub);
