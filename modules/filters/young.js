"use strict";

var request = require("request");

var db = require("../../dbHelpers.js");

var TIMEOUT_LENGTH = 86400; // one day

// in days
var min_account_age = 55;
var max_account_age = 75;

function diffBetweenDateAndNow(dateString){
  var oneDay = 24*60*60*1000;
  return Math.round(Math.abs((new Date().getTime() - new Date(dateString).getTime())/(oneDay)));
}

_client.on("chat", (channel, user, message, self) => {
	if(self)
		return; // just in case user created a brand new account for the bot

  var users = db.collection("user_info").find({
    "name": { "$eq": user.username }
  });

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

      db.collection("user_info").insert(j);
      db.collection("user_info").save((err) => {
        if(err)
          throw new Error(err);
      });
			
	    if(diffBetweenDateAndNow(j.created_at) > min_account_age && diffBetweenDateAndNow(j.created_at) < max_account_age){
	      _client.timeout(channel, user.username, TIMEOUT_LENGTH, "Account too young. Apologies, but due to a few recent bot attacks on the chat, this is a temporary measure. Thanks for understanding.");
      }
    });
  }
});
