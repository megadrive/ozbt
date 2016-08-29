"use strict";

var util = require("../util.js");
var consts = require("../consts.js");
//var user = JSON.parse(process.env.user);
var request = require("request");

// Get arguments.
//var args = process.env.message.split(" ");

// Speedrun API URLs
var srapi_base = "http://speedrun.com/api/v1/";
var srapi_games = "games";

// Twitch API URL/s
var twapi_streams = "https://api.twitch.tv/kraken/streams/";

//if( util.checkPermissionCore(process.env.channel, user, consts.access.subscriber) ){
request(twapi_streams + "tirean", {"headers": {"Accept": "application/vnd.twitchtv.v3+json"}}, (err, res, twbody) => {
  if(err)
    throw new Error(err);

  var stream_info = JSON.parse(twbody);
  var gamePlaying = stream_info !== null ? stream_info.stream.game : null;

  // DEBUG
  gamePlaying = "grand theft auto";

  if(gamePlaying){
    request(srapi_base + srapi_games + "?name=" + gamePlaying + "&embed=records", {"headers": {"User-Agent": "ozbt/twitch-bot/1.0"}}, (err, res, srbody) => {
      if(err)
        throw new Error(err);

      var game_info = JSON.parse(srbody);

      // Game doesn't exist
      if(game_info.data.length === 0){
        // TODO: Print error message -- Could not find game.
      }
      else {
        // NOTE: We have one or more options, use the first.
        console.log(game_info.data[0]);
        // get
      }
    });
  }
});
