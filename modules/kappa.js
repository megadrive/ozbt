"use strict";

var _config = require("../config/config.user.js");
var _client = undefined;
var db = require("../mysqlHelpers.js");
var consts = require("../consts.js");
var util = require("../util.js");

var Chance = require("chance");
var chance = new Chance();

var loki = require("lokijs");
var ldb = new loki(consts.lokidb);
var coll = null;

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
			ldb.loadDatabase({}, () => {
				coll = ldb.getCollection("kappa");
				if(coll === null)
					coll = ldb.addCollection("kappa");

				coll.insert({
					"channel": channel,
					"username": user.username,
					"message": message
				});

				console.info("Kappa:\tAdded quote by '" + user.username + "': " + message);
				ldb.save();
			});
		}
	}
}

var _kappa = {
	"register": (client) => {
		_client = client;
	},
	"onChat": onChat
};

module.exports = _kappa;
