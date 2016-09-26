"use strict";

var util = require("../util.js");
var user = JSON.parse(process.env.user);
var request = require("request");

var api_url = "channels/" + process.env.channel.substring(1);

util.twitch_api(api_url)
  .then(function(body){
  var j = JSON.parse(body);

  util.say(process.env.channel, util.getDisplayName(user) + " -> " + j.display_name + " is playing " + j.game + ". Title: " + j.status);
});
