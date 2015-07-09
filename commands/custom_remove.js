/**
 * Removes commands that were created using custom_add
 *
 * !custom_remove [command]
 */

var args = process.argv.splice(2);
var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var commandsDb = db.collection('custom_commands');
var util = require('../util.js');

var channel = args[0];
var user = JSON.parse(args[1]);

var custom_args = args[2].split(' ');
var custom_trigger = custom_args[1];

// Only mods and above can do this
if( util.checkAccess(channel, user, 'moderator') ){

	// Find the command, first off.
	var command = commandsDb.where({
		'channel': channel,
		'trigger': custom_trigger
	});

	for(var i = 0; i < command.items.length; ++i){
		commandsDb.remove(command.items[i].cid);

		// remove associated permissions, if they exist
		var accessDb = db.collection('channel_access');
		var access = accessDb.where({
			'channel': args[0],
			'trigger': custom_trigger
		});
		if( access.items.length > 0 ){
			accessDb.remove(access.items[0].cid);
			accessDb.save();
		}
	}
	commandsDb.save();
	process.send({
		'command': 'say',
		'channel': args[0],
		'message': 'Command "' + custom_trigger + '" was removed, ' + user.username
	})
}
