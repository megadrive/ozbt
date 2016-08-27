"use strict";

var config = require("../config/config.user.js");
var _client = undefined;
var db = require("../dbHelpers.js");
var fs = require("fs");
var fork = require("child_process").fork;
var consts = require("../consts.js");
var util = require("../util.js");

var loki = require("lokijs");
var ldb = new loki(consts.lokidb);
var settings = null;
var entrants = null;

var onChat = (channel, user, message, self) => {
	if(self)
		return;

	ldb.loadDatabase("giveawaysDb", () => {
		settings = ldb.getCollection("settings");
		entrants = ldb.getCollection("entrants");

		if(settings === null){
			settings = ldb.addCollection("settings");
		}

		if(entrants === null){
			entrants = ldb.addCollection("entrants");
		}

		// Get settings for current giveaway on channel
		var giveaway_settings = settings.where((d) => {
			return d.channel === channel;
		});

		// If they exist, continue
		if(giveaway_settings.length){
			// Add a user depending on the setting.
			var type = giveaway_settings.type;

			// A user just needs to say something in chat.
			if(type === consts.giveaways.active){
				add(channel, user.username);
			}

			// A user needs to say a keyword to be entered, it can be in any part of the message.
			if(type === consts.giveaways.keyword){
				if(message.trim().toLowerCase().indexOf(giveaway_settings.keyword) >= 0){
					add(channel, user.username);
				}
			}

			ldb.save();
		}
	});
};

/**
 * Add a user if they don't already exist.
 */
var add = (channel, username) => {
	var existing = entrants.where((d) => {
		return d.channel === channel && d.username === username;
	});

	if(existing.length === 0){
		var entrant = entrants.insert({
			"channel": channel,
			"username": username,
			"timestamp": Date.now()
		});
	}
};

var _giveaways = {
	"register": (client) => {
		_client = client;
	},
	"onChat": onChat
};

module.exports = _giveaways;
