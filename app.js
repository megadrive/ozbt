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

_client.connect();

_client.on("connected", (addr, port) => {
	// Require and register all modules
	for(var i = 0; i < _modules.length; i++) {
		var r = require("./modules/" + _modules[i] + ".js");
		if(r.register(_client)){
			console.info("[ozbt]: Registered module " + _modules[i] + " OK");
		}
	}

	db.findAll(db.db(), "channel").then(function resolve(data){
		for(var r = 0; r < data.length; r++){
			if( data[r].JoinOnAppOpen ){
				_client.join(data[r].Channel);
			}
		}
	});
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
