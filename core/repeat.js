"use strict";

var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

/**
 * Add a new repeat command
 * @param {string} channel The channel
 * @param {string} command Command to add
 */
function add(channel, command){
  return new Promise(function(resolve, reject) {
    db.update(db.db(), "repeat_commands", {"Channel": channel}, {
      "$addToSet": {
        "Commands": {
          command
        }
      }
    });
    resolve();
  });
}

/**
 * Remvoe a repeat command
 * @param  {string} channel The channel
 * @param  {string} command Command to remove
 */
function remove(channel, command){
  return new Promise(function(resolve, reject) {
    db.update(db.db(), "repeat_commands", {"Channel": channel}, {
      "$pull": {
        "Commands": {
          command
        }
      }
    });
    resolve();
  });
}

var method = args[1];
var command = args[2].trim();

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
  if(method === "add"){
    add(process.env.channel, command)
      .then(function(){
        util.say(process.env.channel, util.getDisplayName(user) + " -> Added new command " + command + " to repeat queue.");
      });
  }

  if(method === "remove"){
    remove(process.env.channel, command)
      .then(function(){
        util.say(process.env.channel, util.getDisplayName(user) + " -> Removed command " + command + " from repeat queue.");
      });
  }
}
