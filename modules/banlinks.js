"use strict";

var _client = undefined;
var consts = require("../consts.js");
var db = require("../dbHelpers.js");
var util = require("../util.js");

var banLength = 60; // a minute
var rurl = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/ig;

var onChat = (channel, user, message, self) => {
	if(self) // so we dont try to ban ourselves.
		return;

	db.find(db.db(), "channel", {"Channel": channel}, (rows) => {
		if(rows.length === 1){
			var doBanLinks = rows[0].BanLinks;

			if(util.checkPermissionCore(process.env.channel, user, consts.access.moderator) === false){
				if(doBanLinks != undefined && doBanLinks === consts.true){
					var matched = message.match(rurl);
					if(matched !== null){
						_client.timeout(channel, user.username, banLength, "ozbt: banlinks on").then((data) => {
							_client.say(channel, util.getDisplayName(user) + " -> Links have been banned, please refrain from posting links.");
						}).catch((err) => {
							console.error(err);
						});
					}
				}
			}
		}
	});
};

module.exports = {
	"register": (client) => {
		if(client){
			_client = client;
			_client.on("chat", onChat);
		}

		return client ? true : false;
	}
};
