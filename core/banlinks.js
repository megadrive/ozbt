"use strict";

var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	var toggle = args[1];

	if(toggle !== undefined){
		toggle = toggle.toLowerCase().trim();

		if(toggle == "on" || toggle == "off"){
			db.find("channel", {"Channel": process.env.channel})
				.then((channel) => {
					if(channel !== null && channel.length === 1){
						// update
						db.update("channel", "Channel = '" + process.env.channel + "'", {
							"BanLinks": toggle == "on" ? consts.true : consts.false
						}, (rows) => {
							if(rows.affectedRows === 1){
								util.say(process.env.channel, util.getDisplayName(user) + " -> All links are now " + (toggle == "on" ? "" : "not ") + "banned.");
							}
						});
					}
				});
		}
	}
	else {
		db.find("channel", {"Channel": process.env.channel})
			.then((rows) => {
				if(rows !== null && rows.length === 1){
					util.say(process.env.channel, util.getDisplayName(user) + " -> All links are " + (rows[0].BanLinks == consts.true ? "" : "not ") + "banned.");
				}
			});
	}
}
