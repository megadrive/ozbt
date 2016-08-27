"use strict";

var _config = require("../config/config.user.js");
var _client = undefined;
var consts = require("../consts.js");
var db = require("../dbHelpers.js");
var util = require("../util.js");

var rurl = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/ig;

var onChat = (channel, user, message, self) => {
	if(self) // so we dont try to ban ourselves.
		return;

  if(user.)
};

var banshortlinks = {
	"register": (client) => {
		_client = client;
    _client.on("chat", onChat);
	}
};

module.exports = banshortlinks;
