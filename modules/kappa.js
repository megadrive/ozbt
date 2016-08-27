"use strict";

var _config = require("../config/config.user.js");
var _client = undefined;
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var util = require("../util.js");

var Chance = require("chance");
var chance = new Chance();

var bots = ["nightbot", "xanbot", "moobot"];

var onChat = (channel, user, message, self) => {
	if(self || bots.indexOf(user.username) >= 0)
		return;

	// Arbitrary value, but hopefully a quote will be better the longer it is.
	if(message.indexOf("Kappa") >= 0 && message.length > 15){
		// A potential quote has a 75% chance of being accepted.
		var chancePercentage = 0.25;
		var rand = chance.floating({"min":0, "max":1});

		if(rand >= chancePercentage){
			db.insert(db.db(), "kappa", {
				"Channel": channel,
				"Username": user.username,
				"Message": message
			}, (result) => {
				if(result.length){
					console.info("Kappa:\tAdded quote by '" + user.username + "': " + message);
				}
			});
		}
	}
}

module.exports = {
	"register": (client) => {
		if(client){
			_client = client;
			_client.on("chat", onChat);
		}

		return client ? true : false;
	}
};
