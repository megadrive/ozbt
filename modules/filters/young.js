"use strict";

var request = require("request");

var db = require("../../dbHelpers.js");
var _client = undefined;

var TIMEOUT_LENGTH = 86400; // one day

// in days
var min_account_age = 55;
var max_account_age = 75;

function diffBetweenDateAndNow(dateString){
  var oneDay = 24*60*60*1000;
  return Math.round(Math.abs((new Date().getTime() - new Date(dateString).getTime())/(oneDay)));
}

var onChat = (channel, user, message, self) => {
	if(self)
		return; // just in case user created a brand new account for the bot

  db.find(db.db(), "user_info", {
    "name": { "$eq": user.username }
  }, (users) => {
    if(users.length){
      if(diffBetweenDateAndNow(users[0].created_at) > min_account_age && diffBetweenDateAndNow(users[0].created_at) < max_account_age){
        _client.timeout(channel, user.username, TIMEOUT_LENGTH, "Account too young. Apologies, but due to a few recent bot attacks on the chat, this is a temporary measure. Thanks for understanding.");
      }
    }
    else{
      request({
        "url": "https://api.twitch.tv/kraken/users/" + user.username,
        "method": "GET",
        "headers": {
          "Accept": "application/vnd.twitchtv.v3+json"
        }
      }, (err, response, body) => {
        if(err)
          throw new Error(err);

        var j = JSON.parse(body);

        db.insert(db.db(), "user_info", j);

        if(diffBetweenDateAndNow(j.created_at) > min_account_age && diffBetweenDateAndNow(j.created_at) < max_account_age){
          _client.timeout(channel, user.username, TIMEOUT_LENGTH, "Account too young. Apologies, but due to a few recent bot attacks on the chat, this is a temporary measure. Thanks for understanding.");
        }
      });
    }
  });
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
