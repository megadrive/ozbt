"use strict";

var util = require("../util.js");
var db = require("../mysqlHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

var loki = require("lokijs");
var ldb = new loki(consts.lokidb);
var coll = null;

var Chance = require("chance");
var chance = new Chance();

// Get arguments.
var args = process.env.message.split(" ");

/**
 * !access command userlevel
 */

var _kappa = {
	"help": "!kappa"
};
module.exports = _kappa;

if( util.checkPermissionCore(process.env.channel, user, consts.access.subscriber) ){
	ldb.loadDatabase({}, () => {
		var coll = ldb.getCollection("kappa");

		if(coll !== null){
			// Get a random quote
			var data = coll.find({"channel": {"$eq": process.env.channel}});

			if(data.length > 0){
				var rand = chance.integer({"min":0, "max": data.length - 1});
				var quote = data[rand];

				util.say(process.env.channel, quote.username + ": " + quote.message);
			}
		}
	});
}
