"use strict";

var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

var fs = require("fs");
var facts = JSON.parse(fs.readFileSync("./config/random_facts.json"));

// Get arguments.
var args = process.env.message.split(" ");

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	var n = Math.floor(Math.random(0, facts.length) * facts.length);
	var fact = facts[n];

	util.say(process.env.channel, "Random fact! " + fact);
}
