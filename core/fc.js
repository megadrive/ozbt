"use strict";

var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);
let got = require("got");

// Get arguments.
var args = process.env.message.split(" ");

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	var username = args[1];

	let api = 'https://api.rtainc.co/twitch/channels/${channel}/followers/${user}/?format=${user}+has+been+a+follower+for+[2]';

	let fc = api.replace(/\${user}/gi, username ? username : user.username);
	fc = fc.replace(/\${channel}/gi, process.env.channel.slice(1), "gi");

	// response must be text
	got(fc)
		.then(function(response){
			util.say(process.env.channel, util.getDisplayName(user) + " -> " + response.body);
		})
		.catch(err => console.error);
}
