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

if( util.checkAccess(args[0], user, args[2], 'moderator') ){
	var temp = args[3].split(' ');
	var tevent = temp[1].toLowerCase();
	var message = temp.splice(2).join(' ');

	if( tevent.indexOf('sub') === false && tevent.indexOf('resub') === false && tevent.indexOf('host') === false ){
		// only two supported
		util.say(args[0], 'Supplied "' + tevent + '" not supported. Must be one of sub, resub or host.');
	}
	else {
		// check for existance
		var greeting = greetingCollection.where({
			'channel': args[0],
			'event': tevent
		});

		// if we dont have a message, output the greeting
		if( message.length === 0 ){
			var toSend = 'There is no greeting for ' + tevent + ' yet. Add it by using "!greeting ' + tevent + 'yourgreetinghere". Check documentation for variables.';

			if( greeting.items.length > 0 ){
				toSend = greeting.items[0].greeting;
			}

			util.say(args[0], toSend);
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

			console.log('say stuff');
			util.say(args[0], 'Greeting "' + tevent + '" set to "' + message + '"');
		}
	}
}
