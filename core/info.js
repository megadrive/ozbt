"use strict";

var util = require("../util.js");
var user = JSON.parse(process.env.user);
var request = require("request");

var api_url = "https://api.twitch.tv/kraken/channels/" + process.env.channel;

request({
  "url": api_url,
  "method": "GET",
  "headers": {
    "Accept": "application/vnd.twitchtv.v3+json"
  }
}, (err, response, body) => {
  if(err)
    throw new Error(err);

  var j = JSON.parse(body);

  util.say(process.env.channel, util.getDisplayName(user) + " -> " + j.display_name + " is playing " + j.game + ": " + j.status);
});
