"use strict";

var _config = require("./config/config.user.js");

// @Modules
var db = require("./mysqlHelpers.js");
var consts = require("./consts.js");
var _commands = require("./modules/commands.js");
var _greetings = require("./modules/greetings.js");
var _subgoals = require("./modules/subgoals.js");
var _banlinks = require("./modules/banlinks.js");
var util = require("./util.js");

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
	_greetings.register(_client);
	_subgoals.register(_client);
	_banlinks.register(_client);

	db.findAll(db.db(), "channel", (rows) => {
		for(var r = 0; r < rows.length; r++){
			if( rows[r].JoinOnAppOpen ){
				_client.join(rows[r].Channel);
			}
		}
	}); // initial connection
});

_client.on("disconnected", (reason) => {
	_client.connect(); // try indefinitely.
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
_client.on("chat", _banlinks.onChat);

_client.on("chat", (channel, user, message, self) => {
	if( util.checkPermissionCore(channel, user, consts.access.supermoderator) ){
		if(message.indexOf("!!fireSub") === 0){
			_client.emit("subscription", channel, user);
		}
		if(message.indexOf("!!fireResub") === 0){
			_client.emit("subanniversary", channel, user, user.username.length);
		}
	}
});

_client.on("subscription", _greetings.onSub);
_client.on("subanniversary", _greetings.onResub);

_client.on("subscription", _subgoals.onSub);
_client.on("subanniversary", _subgoals.onResub);
