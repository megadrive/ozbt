/**
 * Lists custom commands in chat.
 * @author Megadrive
 *
 * !custom_list
 */

var args = process.argv.splice(2);
var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var commandsDb = db.collection('custom_commands');
var util = require('../util.js');

var user = JSON.parse(args[1]);

// Only mods and above can do this
if( util.checkAccess(args[0], user, args[2], 'moderator') ){

	// Find the command, first off.
	var commands = commandsDb.where({
		'channel': args[0]
	});

	var listCommands = [];
	for (var i = 0; i < commands.items.length; i++) {
		listCommands.push(commands.items[i].trigger);
	};

	var msg = 'Available custom commands for ' + args[0] + ' are: ' + listCommands.join(', ') + '.';
	if( listCommands.length === 0 ){
		msg = 'There are no custom commands avilable for ' + args[0] + '.';
	}

	util.say(args[0], util.getDisplayName(user) + ' -> ' + msg);
}
