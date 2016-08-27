"use strict";

var _config = require("../config/config.user.js");
var _client = undefined;
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var util = require("../util.js");

var onChat = (channel, user, message, self) => {
	if(self)
		return;

  var rselfpromo = new RegExp("(https?://)?(www\.)?twitch\.tv/" + user.username, "gi");

  if(rselfpromo.test(message)){
    client.ban(channel, user.username, "Self-promotion.");
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
