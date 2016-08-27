"use strict";

var consts = require("./consts.js");
var db = require("./dbHelpers.js");

module.exports = {
	'version': function(){
		var fs = require('fs');
		var f = fs.readFileSync('./package.json', {'encoding':'utf8'});
		var j = JSON.parse(f);
		return 'v' + j.version;
	},

	/**
	 * Gets either the display name or the username of a userObject, preferring the display-name.
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

	// @var user user object
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
