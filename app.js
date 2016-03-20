"use strict";

var _config = require("./config/config.user.js");

var _mysql = require("mysql");
var _db = {};
var _dbHelpers = require("./mysqlHelpers.js");

var _tmi = require("tmi.js");
var _client = new _tmi.client({
	"options": {
		"debug": true
	},
	"connection": {
		"cluster": "chat",
		"reconnect": true
	},
	"identity": {
		"username": _config.username,
		"password": _config.oauth
	},
	"logger": require("./logger.js")
});

_client.connect();

_client.on("connected", (addr, port) => {
	_client.join("megadriving");

	// Create MySQL connection
	_db = _mysql.createConnection({
		"host": _config.mysql_addr,
		"user": _config.mysql_user,
		"password": _config.mysql_pass,
		"database": _config.mysql_db

		//@debug
		//,"debug": true
	});
	_db.connect();
});

_client.on("join", (channel, username) => {
	// If channel doesnt exist, create a new record
	_dbHelpers.find(_db, "channel", {"Channel": cc.channel}, (rows) => {
		if( rows.length === 0 ){
			_dbHelpers.insert(_db, "channel", {"Channel": cc.channel}, (result) => {
				if(result.affectedRows === 1 )
					console.log("> Created channel " + cc.channel);
			});
		}
	});
});
