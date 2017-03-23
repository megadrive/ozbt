"use strict";

var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

/**
 * Add a new repeat command
 * @param {string} channel The channel
 * @param {string} command Command to add
 */
function add(channel, command){
	return new Promise(function(resolve, reject) {
		db.db()
			.then(function(db){
				db.collection("repeatcommand")
					.updateOne({"Channel": channel}, 
						{
							"$addToSet": {
								"Commands": command
							}
						},
						{ "upsert": true})
					.then(function(result){
						if(result.result.ok){
							resolve(result.result);
						}
					});
			});
	});
}

/**
 * Remove a repeat command
 * @param  {string} channel The channel
 * @param  {string} command Command to remove
 */
function remove(channel, command){
	return new Promise(function(resolve, reject) {
		db.update( "repeatcommand", {"Channel": channel}, {
			"$pull": {
				"Commands": {
					command
				}
			}
		});
		resolve();
	});
}

/**
 * List commands in the repeat queue in a comma-delimeted list
 * @param {string} channel The channel
 */
function list(channel){
	return new Promise(function(resolve, reject) {
		db.find("repeatcommand", {"Channel": channel})
			.then(function(doc){
				if(doc){
					resolve(doc.Commands);
				}
				else {
					resolve([]);
				}
			});
	});
}

var method = args[1];
var command = args.length > 2 ? args[2].trim() : "";

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	if(method === "add"){
		add(process.env.channel, command)
			.then(function(){
				util.say(process.env.channel, util.getDisplayName(user) + " -> Added new command " + command + " to repeat queue.");
			});
	}

	if(method === "remove"){
		remove(process.env.channel, command)
			.then(function(){
				util.say(process.env.channel, util.getDisplayName(user) + " -> Removed command " + command + " from repeat queue.");
			});
	}

	if(method === "list"){
		list(process.env.channel)
			.then(function(cmds){
				util.say(process.env.channel, util.getDisplayName(user) + " -> Current queue: " + cmds.join(", "));
			});
	}
}
