"use strict";

var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

var Chance = require("chance");
var chance = new Chance();

// Get arguments.
var args = process.env.message.split(" ");

if( util.checkPermissionCore(process.env.channel, user, consts.access.subscriber) ){
	db.find(db.db(), "kappa", {"Channel": process.env.channel}, (results) => {
		var element = chance.integer({"min": 0, "max": results.length - 1});
		var quote = results[element];

		util.say(process.env.channel, quote.Username + ": " + quote.Message);
	});
}
