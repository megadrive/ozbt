/**
 * Set the greeting for subscribers and resubscribers. See examples for placeholder uses.
 * @author Megadrive
 *
 * !greeting [sub|subscriber] [message]
 * !greeting [resub|resubscriber] [message]
 *
 * !greeting sub Thanks for subscribing, ${nick}!
 * !greeting resub Thanks for resubscribing, ${nick}! ${months} month${s}!
 */

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);
var util = require('../util.js');
var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var greetingCollection = db.collection('channel_greetings');

if( util.checkAccess(args[0], user, args[2], 'broadcaster') ){
	var temp = args[3].split(' ');
	var tevent = temp[1].toLowerCase();
	var message = temp.splice(2).join(' ');

	if( tevent !== 'sub' && tevent !== 'resub' && tevent !== 'host' ){
		// only two supported
		process.send({
			'command': 'say',
			'channel': args[0],
			'message': 'Error: Supplied "' + tevent + '" not supported. Must be either sub, resub or host.'
		});
	}
	else {
		// check for existance
		var greeting = greetingCollection.where({
			'channel': args[0],
			'event': tevent
		});

		// if we dont have a message, output the greeting
		if( message.length === 0 ){
			var toSend = 'There is no greeting for ' + tevent + ' yet. Add it by using "!greeting ' + tevent + 'yourgreetinghere"';

			if( greeting.items.length > 0 ){
				toSend = greeting.items[0].greeting;
			}

			process.send({
				'command': 'say',
				'channel': args[0],
				'message': toSend
			});
		}
		else{
			if( greeting.items.length > 0 ){
				greetingCollection.remove(greeting.items[0].cid);
			}

			greetingCollection.insert({
				'channel': args[0],
				'event': tevent,
				'greeting': message
			});

			process.send({
				'command': 'say',
				'channel': args[0],
				'message': 'Greeting "' + tevent + '" set to "' + message + '"'
			});
		}
	}
}
