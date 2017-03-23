"use strict";

/**
 * @module	Battle
 * @description	Handles a race between 2-9 items, where users donate/sub/bit towards an item.
 */

/*
battle collection
{[
	"Channel": "#channel",
	"Items": [{id: "1", "Name": "Item 1", "Points": 100, ...}]
]}

battle_temp
{
	"Channel": "#channel",
	"User": {"id": user["user-id"], "Username": user.username},
	"Type": type.toLowerCase(), // "sub" or "cheer"
	"Amount": amount // the amount of points to award
}
*/

var _client = undefined;
var db = require("../dbHelpers.js");
var _consts = require("../consts.js");
var util = require("../util.js");

// multiply these values by the received amount
let pointsMultipliers = {
	"sub": 5,
	"donation": 1,
	"bit": 0.1
};

/**
 * Add an awaiting vote so they can use !battle to vote.
 * @param {string} channel 
 * @param {object} user 
 * @param {string} type "sub", "cheer" or "donation"
 * @param {number} amount Amount of bits or a number value for donations
 */
function insertTemp(channel, user, type, amount){
	db.insert("battle_temp", {
		"Channel": channel,
		"User": {"id": user["user-id"], "Username": user.username},
		"Type": type.toLowerCase(),
		"Amount": amount
	})
		.then(function(){
			resolve();
		});
}

/**
 * Subscription/Resub event
 * @param {string} channel 
 * @param {object} user 
 * @param {number} months 
 * @param {string} message 
 */
function onSubResub(channel, user, months, message){
	if(message){
		insertTemp(channel, message, "sub", pointsMultipliers.sub)
			.then(function(newPoints, itemObject){
				util.say(channel, util.getDisplayName(user) + " has added " + newPoints + " points to " + itemObject.Name + " because of their sub/resub! It's now on " + itemObject.Points + " points!");
			});
	}
	else {
		insertTemp(channel, user, "sub", pointsMultipliers.sub)
			.then(function(){
				util.say(channel, util.getDisplayName(user) + ", add your game choice for the Battle of the Speedruns by typing !battle vote \"Game Name\" to vote for a contender! (Use !battle to see the current contenders.)");
			});
	}
}

/**
 * Cheer event
 * @param {string} channel 
 * @param {object} user
 * @param {string} message 
 */
function onCheer(channel, user, message){
	let bits = user.bits;

	insertTemp(channel, user, "cheer", bits * pointsMultipliers.bit)
		.then(function(){
			util.say(channel, util.getDisplayName(user) + ", add your game choice for the Battle of the Speedruns by typing !battle vote \"Game Name\" to vote for a contender! (Use !battle to see the current contenders.)");
		});
}

/**
 * Donation event
 * @param {string} channel 
 * @param {object} user 
 * @param {number} amount 
 */
function onDonate(channel, user, amount){
	// @TODO: Implement.
}

module.exports = {
	"register": (client) => {
		if(client){
			_client = client;
			_client.on("subscription", onSubResub);
			_client.on("resub", onSubResub);
			_client.on("cheer", onCheer);
		}

		return client ? true : false;
	}
};
