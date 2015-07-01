/**
 * Adds a custom text command that is per-channel.
 *
 * !custom_add [trigger] [messageOnFire]
 */

var args = process.argv.splice(2);
var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var commandsDb = db.collection('custom_commands');
var mods = db.collection('channel_moderators');

var channel = args[0];
var user = JSON.parse(args[1]);

var custom_args = args[2].split(' ');
var custom_trigger = custom_args[1];
var custom_message = custom_args.splice(2).join(' ');

function isMod(channel, username){
	var channelMods = mods.where({
		'channel': channel,
		'username': username
	});

	return (channelMods.items[0].username === username);
}

// Only mods and above can do this
if( isMod(channel, user.username) ){
	//TODO: Add check if the command exists. If it does, update the message.

	if( custom_message.length > 0 ){
		commandsDb.insert({
			'channel': channel,
			'trigger': custom_trigger,
			'message': custom_message,
			'added_by': user.username,
			'updated_by': user.username
		});
		commandsDb.save();

		process.send({
			'command': 'say',
			'channel': channel,
			'message': 'Command "' + custom_trigger + '" added to channel "' + args[0] + '" ' + user.username + '.'
		});
	}
	else {
		process.send({
			'command': 'say',
			'channel': channel,
			'message': 'Command "' + custom_trigger + '" needs a message to go along with it. Kappa'
		});
	}
}
