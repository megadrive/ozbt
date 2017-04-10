"use strict";

var consts = require("./consts.js");
var db = require("./dbHelpers.js");
var Promise = require("bluebird");
var got = require("got");
var config = require("./config/config.user.js");

module.exports = {
	/**
	 * Returns a version string.
	 */
	'version': function(){
		var fs = require('fs');
		var j = require("./package.json");
		return 'v' + j.version;
	},

	/**
	 * Performs a Twitch API request, including the requisite headers.
	 * @param  {string} endpoint The url after /kraken/
	 */
	'twitch_api': function(endpoint){
		return new Promise(function(resolve, reject) {
			if(endpoint && endpoint.length > 3){
				var opts = {
					"json": true,
					"headers": {
						"Client-ID": config.clientid,
						"Accept": "application/vnd.twitchtv.v3+json"
					}
				};

				got("https://api.twitch.tv/kraken/" + endpoint, opts)
					.then(function(response){
						resolve(response.body);
					});
			}
			else {
				reject("endpoint param not long enough or is undefined.")
			}
		});
	},

	/**
	 * Gets either the display name or the username of a userObject, preferring the display-name.
	 * @param {object} user user object, provided by a `chat` event via tmi.js
	 */
	'getDisplayName': function(userObj){
		var rv = 'undefined';

		if( userObj ){
			rv = userObj.username;

			if( userObj['display-name'] != undefined ){
				rv = userObj['display-name'];
			}
		}

		return rv;
	},

	/**
	 * Checks permissions against a user object.
	 * @param {string} channel the channel
	 * @param {object} user user object, provided by a `chat` event via tmi.js
	 * @param {number} atLeastPermission user must be at LEAST this permission level. Use with the consts.access enum
	 */
	"checkPermissionCore": (channel, user, atLeastPermission) => {
		var rv = false;

		if("#" + user.username === channel || atLeastPermission === consts.access.everybody){
			rv = true;
		}

		if(atLeastPermission >= consts.access.moderator && user.mod == true){
			rv = true;
		}

		if(atLeastPermission >= consts.access.subscriber && user.subscriber == true){
			rv = true;
		}

		if(user.isDebug === true){
			rv = false;
		}

		return rv;
	},

	/**
	 * Gets the property key of an object based on a supplied value.
	 * @return string the key, or undefined if not found
	 */
	'getKeyFromValue': function(object, valueToFind){
		for(var prop in object){
			if(object.hasOwnProperty(prop)){
				if(object[prop] === valueToFind){
					return prop;
				}
			}
		}

		return undefined;
	},

	/**
	 * Convenience function, saves creating the whole block every time in commands.
	 */
	'say': function(channel, message){
		process.send({
			'channel': channel,
			'func': 'say',
			'message': message
		});
	},

	/**
	 * Convenience function, saves creating the whole block every time in commands.
	 */
	'whisper': function(username, message){
		process.send({
			'func': 'whisper',
			'username': username,
			'message': message
		});
	}
}
