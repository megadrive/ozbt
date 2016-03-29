"use strict";

var _config = require("./config/config.user.js");

// @Modules
var _dbHelpers = require("./mysqlHelpers.js");
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
	,"logger": require("./logger.js")
});

_client.connect();

_client.on("connected", (addr, port) => {
	_commands.register(_client);

	_dbHelpers.findAll(_dbHelpers.db(), "channel", (rows) => {
		//@debug
		_client.join("#megadriving"); return;

		for(var r = 0; r < rows.length; r++){
			if( rows[r].JoinOnAppOpen ){
				_client.join(rows[r].Channel);
			}
		}
	}); // initial connection
});

_client.on("join", (channel, username) => {
	// If channel doesnt exist, create a new record
	_dbHelpers.find(_dbHelpers.db(), "channel", {"Channel": channel}, (rows) => {
		if( rows.length === 0 ){
			_dbHelpers.insert(_dbHelpers.db(), "channel", {"Channel": channel}, (result) => {
				if(result.affectedRows === 1 )
					console.log("> Created channel " + channel);
			});
		}
	});
});

_client.on("chat", _commands.onChat);
_client.on("subscription", _greetings.onSub);
_client.on("subscription", _greetings.onResub);
