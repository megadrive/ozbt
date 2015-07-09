/**
 * Adds a custom text command that is exclusive to the channel.
 * @author: Megadrive
 *
 * !custom_add [trigger] [message]
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
var custom_message = custom_args.splice(2).join(' ');

// Only mods and above can do this
if( util.checkAccess(channel, user, 'moderator') ){
	var existing = commandsDb.where({
		'channel': args[0],
		'trigger': args[1]
	});
	if( existing.items.length > 0 ){
		commandsDb.update(existing.items[0].cid,{
			'message': custom_message,
			'updated_by': user.username
		});
	}
	else
	{
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
	}
}
