/**
 * Turns commands on and off. Includes custom commands.
 * !turn [command]
 * @author Megadrive
 *
 * !turn [command] [on|off]
 */

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);

var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var channel_trigger_settings = db.collection('channel_trigger_settings');
var util = require('../util.js');

if( util.checkAccess(args[0], user, args[2], 'moderator') ){
	// determine the arguments
	var cmd_args = args[3].split(' ');
	var command = cmd_args[1]; // removes delim

	if( command === 'turn' ){
		process.exit(1); // exit out because if we turn this off the whole world dies.
	}

	if( cmd_args[2].toLowerCase() === 'on' ){
		updateCommand(command, true);
		process.send({
			'command': 'say',
			'channel': args[0],
			'message': 'Command ' + command + ' has been turned on.'
		});
	}
	else if( cmd_args[2].toLowerCase() === 'off' ){
		updateCommand(command, false);
		process.send({
			'command': 'say',
			'channel': args[0],
			'message': 'Command ' + command + ' has been turned off.'
		});
	}
	else if( cmd_args[2] === 'toggle' ){
		// eh not sure this is needed
	}
}

/**
 * @brief Updates a command's availability to be used.
 *
 * @return bool whether command succeeded
 */
function updateCommand(trigger, status){
	// check for existance
	var find = channel_trigger_settings.where({
		'channel': args[0],
		'trigger': trigger
	});

	var exists = find.items.length === 1;
	if( exists ){
		channel_trigger_settings.update(find.items[0].cid, {
			'on': status,
			'updated_by': user.username
		});
	}
	else {
		channel_trigger_settings.insert({
			'channel': args[0],
			'trigger': trigger,
			'on': status,
			'updated_by': user.username
		});
	}

	find = channel_trigger_settings.where({
		'channel': args[0],
		'trigger': trigger
	});

	var rv = find.items[0].on === status;
	return rv; // NOTE: Always true currently, investigate if needed.
}
