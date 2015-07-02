/**
 * !turn [command] turns commands on and off.
 *
 * NOTE: Add custom command support later?
 */

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);

var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var channel_settings = db.collection('channel_settings');
var util = require('../util.js');

if( util.isMod(args[0], user.username) ){
	// determine the arguments
	var cmd_args = args[2].split(' ');
	var command = cmd_args[1]; // removes delim

	if( command === 'set' ){
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
	var find = channel_settings.where({
		'channel': args[0],
		'trigger': trigger
	});

	var exists = find.items.length === 1;
	if( exists ){
		channel_settings.update(find.items[0].cid, {
			'on': status,
			'updated_by': user.username
		});
	}
	else {
		channel_settings.insert({
			'channel': args[0],
			'trigger': trigger,
			'on': status,
			'updated_by': user.username
		});
	}

	find = channel_settings.where({
		'channel': args[0],
		'trigger': trigger
	});

	var rv = find.items[0].on === status;
	return rv; // NOTE: Always true currently, investigate if needed.
}
