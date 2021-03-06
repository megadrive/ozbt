"use strict";

var config = require("../config/config.user");
const consts = require("../consts");
var util = require("../util");
var db = require("../dbHelpers");
var fs = require("mz/fs");
var fork = require("child_process").fork;
var _client = undefined;
var Promise = require("bluebird");

var delays = {};

/**
 * Does the custom command exist?
 * @param  {string}  channel The channel, prefixed with #
 * @param  {string}  command The command to search for
 * @return {Promise}         A promise
 */
function isCustomCommand(channel, command){
	return new Promise(function(resolve, reject) {
		db.find("customcommand", {
			"Channel": channel,
			"Command": command
		}).then(function(data){
			if(data != null){
				resolve(data);
			}
			else {
				reject(new Error("Custom command does not exist."));
			}
		});
	});
}

/**
 * Is the command requested a core command?
 * @param  {string}  command Command to look up
 * @return {Boolean}
 */
function isCoreCommand(command){
	return new Promise(function(resolve, reject) {
		if(command.trim().indexOf(consts.core_command_prefix) === 0){
			var cmd = command.trim().substring(1).toLowerCase();
			fs.access("./core/" + cmd + ".js", fs.R_OK)
				.then(function(){
					resolve("core");
				}, () => { reject("Core command file " + cmd + ".js is missing."); });
		}
		else {
			reject(new Error("Core command does not exist."));
		}
	});
}

/**
 * Checks a command against the permission database, per channel.
 * @param  {string} channel The channel name, prefixed with #
 * @param  {object} user    The user object, as supplied by tmi.js
 * @param  {string} command The command to search for
 */
function checkCommandPermission(channel, user, command){
	return new Promise(function(resolve, reject) {
		db.find("commandpermission", {
			"channel": channel,
			"command": command
		}).then(function(data){
			if(data != null){
				if(util.checkPermissionCore(channel, user, command, data.PermissionLevel)){
					resolve();
				}
				else {
					reject(new Error("User does not have permission to use command."));
				}
			}
			else {
				resolve();
			}
		});
	});
}

/**
 * Checks the delay of a command, per channel.
 * Moderators and above bypass the delay.
 * @param  {string} channel The channel name, prefixed with #
 * @param  {object} user    The user object, as supplied by tmi.js
 * @param  {string} command The command to search for
 * @return {Promise}        A promise.
 */
function checkCommandDelay(channel, user, command){
	const minimum_delay = 10 * 1000; // * 1000 to convert seconds to ms

	return new Promise(function(resolve, reject) {
		if(util.checkPermissionCore(channel, user, consts.access.moderator)){
			resolve("Command delay bypassed: Moderator or Broadcaster");
		}

		if(delays[channel] === undefined){
			delays[channel] = {};
		}

		let delay = delays[channel][command] ? delays[channel][command] : undefined;

		if(delay === undefined){
			delay = Date.now();
			delays[channel][command] = delay;
			resolve("Command delay ok: first use");
		}
		else {
			let diff = Date.now() - delay;
			if(diff > minimum_delay){
				resolve("Command delay ok: > minimum_delay");
			}
			else {
				reject(new Error("Command delay rejected: Used too soon."));
			}
		}
	});
}

/**
 * Constructs an @mention at the beginning of a command's output
 * @param  {object} user         User object as provided by tmi.js
 * @param  {string} message      The original message, see if it contains an @mention
 * @param  {string} command_text The output text from the command
 * @return {string}              Constructed output
 */
function constructAtMention(user, message, command_text){
	var ratmention = /@[a-zA-Z0-9_]{4,}/gi;
	var maximum_mentions = 3; // subject to change
	var matches = message.match(ratmention);

	if(matches){
		matches.length = maximum_mentions;
		command_text += " " + matches.join(" ");
	}

	return command_text;
}

/**
 * Create a fork and run a core command.
 * @param  {string} command The core command to run
 * @param  {array} args Arguments to pass to the command
 * @param  {string} message The message that triggered the command
 */
function runCoreCommand(command, args, message){
	var task = fork("./core/" + command.substring(1).toLowerCase() + ".js", [], {
		"env": args
	});
	task.on("message", function(m){
		switch(m.func){
			case "say":
				// If a user @mentions someone
				m.message = constructAtMention(JSON.parse(args.user), message, m.message);
				_client.say(m.channel, m.message);
				break;
			case "whisper":
				_client.whisper(m.username, m.message);
				break;
			case "join_channel":
				_client.join(m.channel);
				break;
			case "timeout_user":
				_client.timeout(m.channel, m.username, m.time, m.reason)
					.then((data) => {
						if(m.message !== undefined && m.message.length > 0){
							_client.say(m.channel, m.message);
						}
					});
			}
	});
	task.on("error", (err) =>{
		throw new Error(err);
	});
	// Kill the child task after x seconds
	setTimeout(() => {
		task.kill();
	}, consts.max_time_command_s * 1000);
}

/**
 * On chat, perform a command if appropriate permissions and delays pass.
 * @param  {string} channel The channel
 * @param  {object} user    User object
 * @param  {string} message The message
 * @param  {boolean} self   Whether or not the client itself has chatted
 */
function onChat(channel, user, message, self){
	if(self)
		return;

	var message_split = message.split(" ");
	var command = message_split[0];

	var core_comand_exists = isCoreCommand(command);
	var custom_command_exists = isCustomCommand(channel, command);
	var permission_ok = checkCommandPermission(channel, user, command);

	Promise.any([core_comand_exists, custom_command_exists])
		.then(function(value){
			checkCommandDelay(channel, user, command)
				.then(() => {
					// Core command
					if(typeof value === "string" && value === "core"){
						var args = {
							"channel": channel,
							"user": JSON.stringify(user),
							"message": message
						};

						runCoreCommand(command, args, message);
					}

					// Custom command
					else {
						console.info("custom command");
						Promise.join(custom_command_exists, permission_ok,
							function(command, permission){
								_client.say(channel, constructAtMention(user, message, command.OutputText));
							});
					}
			});
		}, (reason) => {
			//console.error(reason);
		});
};

module.exports = {
	"register": function(client){
		if(client){
			_client = client;
			_client.on("chat", onChat);
		}

		return client ? true : false;
	},
	"unregister": function(){
		if(_client){
			_client.removeListener("chat", onChat);
		}
		else {
			console.warn("modules/commands.js - Can't remove listener if not registered in the first place.");
		}
	}
}
