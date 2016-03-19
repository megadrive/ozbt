"use strict";

var _config = require("./config/config.user.js");

var _logger = require("./logger.js");

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
	},
	"logger": _logger
});

_client.connect();

_client.on("connected", (addr, port) => {
	_client.join("tirean");
});
