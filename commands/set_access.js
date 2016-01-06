/**
 * Sets the access for a command, including custom.
 * @author Megadrive
 *
 * !set_access [command] [access_level]
 */

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);
var util = require('../util.js');
var locallydb = require('locallydb');
var db = new locallydb('db/_app');

/*
0 #channel
1 trigger
2 access
*/
if( util.checkAccess(args[0], user, args[2], 'moderator') ){
	var accessCollection = db.collection('channel_access');
	var cmdArgs = args[3].split(' ');

	var newAccess = cmdArgs[2].toLowerCase();
	var ok = false;
	switch(newAccess){
		case 'subscriber':
		case 'moderator':
		case 'broadcaster':
		case 'everybody':
			ok = true;
			break;
		default:
			ok = false;
	}
	if( ok ){
		var access = accessCollection.where({
			'channel': args[0],
			'trigger': cmdArgs[1]
		});

		var currAccess = [];
		// exists, update
		if( access.items.length > 0 ){
			currAccess = access.items[0].access;
			accessCollection.update(access.items[0].cid, {
				'access': newAccess
			});
		}
		// doesnt exist, add
		else{
			currAccess = newAccess;
			accessCollection.insert({
				'channel': args[0],
				'trigger': cmdArgs[1],
				'access': newAccess
			});
		}

		var chat_output = 'Access for ' + cmdArgs[1] + ' is now "' + newAccess + '", ' + user['display-name'];
		util.say(args[0], chat_output);
		
		accessCollection.save();
	}

}
