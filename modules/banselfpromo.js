"use strict";

var _config = require("../config/config.user.js");
var _client = undefined;
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var util = require("../util.js");

var onChat = (channel, user, message, self) => {
	if(self)
		return;

  var rselfpromo = new RegExp("https?://(www\.)?twitch\.tv/" + user.username, "gi");

  if(message.test(rselfpromo)){
    console.info(message);
    //client.ban(channel, user.username, "Banned for self-promotion.");
  }
}

var _banselfpromo = {
	"register": (client) => {
		_client = client;
    client.onChat(onChat);
	},
	"onChat": onChat
};

module.exports = _banselfpromo;
