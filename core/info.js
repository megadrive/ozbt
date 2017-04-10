"use strict";

var util = require("../util.js");
var user = JSON.parse(process.env.user);
var consts = require("../consts.js");

var api_url = "channels/" + process.env.channel.substring(1);

if( util.checkPermissionCore(process.env.channel, user, consts.access.everybody) ){
	util.twitch_api(api_url)
		.then(function(j){
			util.say(process.env.channel, util.getDisplayName(user) + " -> " + j.display_name + " is playing " + j.game + ". Title: " + j.status);
	});
}
