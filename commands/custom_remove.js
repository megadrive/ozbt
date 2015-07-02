/**
 * Removes commands that were created using custom_add
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
if( util.isMod(channel, user.username) ){

	// Find the command, first off.
	var command = commandsDb.where({
		'channel': channel,
		'trigger': custom_trigger
	});

	for(var i = 0; i < command.items.length; ++i){
		commandsDb.remove(command.items[i].cid);
	}
	commandsDb.save();
}

function isMod(channel, username){
	var channelMods = moderatorDb.where({
		'channel': channel,
		'username': username
	});

	return (channelMods.items[0].username === username);
}
