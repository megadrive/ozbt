"use strict";

var _config = require("./config/config.user.js");
var _modules = require("./config/modules.config.js");

// @Modules
var db = require("./dbHelpers.js");
var consts = require("./consts.js");
var util = require("./util.js");

var _tmi = require("tmi.js");
var _client = new _tmi.client({
	"options": {
		"debug": false
	},
	"connection": {
		"reconnect": true
	},
	"identity": {
		"username": _config.username,
		"password": _config.oauth
	}
	// Comment this line if you don't want to log anything.
	,"logger": require("./logger.js")
});

var initial_connection = false;
_client.connect();
db.db(); // inital connection for db

_client.on("connected", (addr, port) => {
	if(initial_connection === true)
		return;

	initial_connection = true;

	// Require and register all modules
	for(var i = 0; i < _modules.length; i++) {
		var r = require("./modules/" + _modules[i] + ".js");
		if(r.register(_client)){
			console.info("[ozbt]: Registered module " + _modules[i] + " OK");
		}
	}

	// Autojoin channels defined in config
	console.info("[ozbt] Autojoining " + _config.autojoin_channels);
	for(var aj = 0; aj < _config.autojoin_channels.length; aj++){
		_client.join(_config.autojoin_channels[aj]);
	}
});
