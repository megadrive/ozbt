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

var channel = args[0];
var user = JSON.parse(args[1]);

// Only mods and above can do this
if( util.checkAccess(args[0], user, args[2], 'moderator') ){

	// Find the command, first off.
	var commands = commandsDb.where({
		'channel': channel
	});

	var listCommands = [];
	for (var i = 0; i < commands.items.length; i++) {
		listCommands.push(commands.items[i].trigger);
	};

	var msg = 'Available custom commands for ' + channel + ' are: ' + listCommands.join(', ') + '.';
	if( listCommands.length === 0 ){
		msg = 'There are no custom commands avilable for ' + channel + '.';
	}

	process.send({
		'command': 'say',
		'channel': channel,
		'message': msg
	});
}
