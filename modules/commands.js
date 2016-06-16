"use strict";

var _config = require("../config/config.user.js");
var _client = undefined;
var _dbHelpers = require("../mysqlHelpers.js");
var fs = require("fs");
var fork = require("child_process").fork;
var consts = require("../consts.js");
var util = require("../util.js");

var loki = require("lokijs");
var ldb = new loki(consts.lokidb);
var coll = ldb.addCollection("cmdCooldown");

var minimum_delay = 10; // seconds

var checkPermission = (channel, user, command, callback) => {
	_dbHelpers.find(_dbHelpers.db(), "commandpermission", {
		"channel": channel,
		"command": command
	}, (rows) => {
		// If there's no rows, it's implicity allowed by EVERYONE.
		var rv = true;

		// Command has previously been given a permission level
		if( rows.length === 1 ){
			if( util.checkPermissionCore(channel, user, rows[0].PermissionLevel) === false ){
				rv = false;
			}
		}

		callback(rv);
	});
};

var onChat = (channel, user, message, self) => {
	if(self)
		return;

	var command = message.split(" ")[0];
	checkPermission(channel, user, command, (rv) => {
		if( rv ){
			doesChannelCommandExist(channel, command, (exists, row) => {
				if( exists ){
					checkDelay(channel, user, command, () => {
						_client.say(channel, row.OutputText);
					});
				}
				else {
					// Core commands should always start with !
					if(command[0] === "!"){
						var file = _config.core_dir + command.substring(1) + ".js";
						fs.access(file, fs.R_OK, (err) => {
							// Run a core command.
							if(!err){
								checkDelay(channel, user, command, () => {
									var task = fork(file, [], {
										"env": {
											"channel": channel,
											"user": JSON.stringify(user),
											"message": message
										}
									});
									task.on("message", (m) => {
										switch(m.func){
											case "say":
												_client.say(m.channel, m.message);
												break;
											case "join_channel":
												_client.join(m.channel);
												break;
											case "timeout_user":
												_client.timeout(m.channel, m.username, m.time);
											}
									});
									task.on("close", (code) => {
										console.log(channel + ": Command task \"" + command + "\" closed.");
									});
									// Kill the child task after x seconds
									setTimeout(() => {
										task.kill();
									}, consts.max_time_command_s * 1000);
								});
							}
						});
					}
				}
			});
		}
	});
};

var checkDelay = (channel, user, command, callback) => {
	if( util.checkPermissionCore(channel, user, consts.access.moderator) ){
		callback();
	}
	else {
		ldb.loadDatabase({}, () => {
			var tstamp = new Date().getTime() - minimum_delay;

			// find any current records
			var lastRow = coll.where((d) => {
				return d.Channel == channel && d.Command == command && d.Timestamp < tstamp
			});

			var ok = false;

			// if none exist, create
			if(lastRow.length === 0){
				var line = {
					"Channel": channel,
					"Command": command,
					"Timestamp": new Date().getTime()
				};
				lastRow = coll.insert(line);
				ok = true;
			}
			// otherwise, detect whether to output
			else {
				var now = new Date().getTime();
				var diff = now; // temp
				if(lastRow.length > 0){
					diff = (now - lastRow[0].Timestamp) / 1000;
				}

				console.log(lastRow, diff, "("+now+" - "+lastRow[0].Timestamp+") / 1000");

				if(diff >= minimum_delay){
					lastRow[0].Timestamp = new Date().getTime();
					coll.update(lastRow);
					ldb.save();
					ok = true;
				}
			}

			if(ok){
				callback();
			}
		});
	}
};

var doesChannelCommandExist = (channel, command, callback) => {
	_dbHelpers.find(_dbHelpers.db(), "customcommand", {"Channel": channel, "Command": command}, (rows) => {
		callback(rows.length > 0, rows[0]);
	});
};

var _commands = {
	"register": (client) => {
		_client = client;
	},
	"onChat": onChat,
	"checkPermission": checkPermission
};

module.exports = _commands;
