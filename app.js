"use strict";

var fs = require('fs');
var fork = require('child_process').fork;
var util = require('./util.js');

var tmijs = require('tmi.js');
var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var request = require('request');

var _oauth = '';
var _username = '';
var _delim = '!';

var forks = {
	'whisper': null,
	'timers': null
};

var punishedUsers = db.collection('punished_users');

var prebannedPhrases = JSON.parse(fs.readFileSync('./banned_phrases.json', {'encoding':'utf8'}));

var rurl = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/gi;

// clean current temp files if any exist
fs.readdir('temp/', function(err, files){
	files = files || [];
	console.log('Found ' + files.length + ' temporary files. Attempting to remove.');
	for (var i = files.length - 1; i >= 0; i--) {
		fs.unlink('temp/' + files[i]);
	};
});

// get config data
if( fs.existsSync('config/') === true ){
	var usernameFile = 'config/username';
	var oauthFile = 'config/oauth';
	_username = fs.existsSync(usernameFile) ? fs.readFileSync(usernameFile, {'encoding': 'utf8'}) : '';
	_oauth = fs.existsSync(oauthFile) ? fs.readFileSync(oauthFile, {'encoding': 'utf8'}) : '';

	if( _username === '' || _oauth === '' ){
		console.error('Create config/username and config/oauth please.');
		process.exit(1);
	}
}

var clientOptions = {
	options: {
	    'debug': true,
	    'debugIgnore': ['ping', 'action', 'chat', 'join', 'part']
	},
	connection: {
		'random': 'chat',
		'reconnect': true
	},
	identity: {
	    'username': _username,
	    'password': _oauth
	}
};

// Calling a new instance..
var client = new tmijs.client(clientOptions);

// Connect the client to the server..
client.connect();
/*
forks['whisper'] = fork('./whisper.js'); // start whisper module
forks['whisper'].on('message', function(message){
	// channel, user, message
	runCommand('#jtv', {'username':username}, message);
});
*/

/**
 * Join channel that connected to ozbt through the !join command.
 */
client.addListener('connected', function (address, port) {
	var join_on_connect = db.collection('join_on_connect');
	client.join('#' + _username);
	for (var i = 0; i < join_on_connect.items.length; i++) {
		client.join('#' + join_on_connect.items[i].channel);
	}
});

/**
 * On joining a channel, update the chatters involved, then update every minute.
 */
client.addListener('join', function (channel, username) {
	// tell whisper to join
	//forks['whisper'].send({'join': channel});
});

client.addListener('part', function(channel, username){
	// tell whisper to part
	//forks['whisper'].send({'part': channel});
});

/**
 * If a channel is hosted, output a message if one exists.
 */
client.addListener('hosted', function(channel, username, viewers){
	var greetingCollection = db.collection('channel_greetings');
	var greeting = greetingCollection.where({
		'channel': channel,
		'event': 'host'
	});
	if( greeting.items.length > 0 ){
		var greeting = greeting.items[0].greeting;
		greeting = greeting.replace('${username}', username, 'gi');
		greeting = greeting.replace('${viewers}', viewers, 'gi');
		client.say(channel, greeting);
	}
	console.log('HOSTED -> ' + channel + ': ' + username + ' for ' + viewers + ' viewers.');
});

/**
 * If a channel gets a subscriber, output a message if one exists.
 */
client.addListener('subscription', function(channel, username){
	var greetingCollection = db.collection('channel_greetings');
	var greeting = greetingCollection.where({
		'channel': channel,
		'event': 'sub'
	});
	if( greeting.items.length > 0 ){
		var greeting = greeting.items[0].greeting;
		greeting = greeting.replace('${username}', username, 'gi');
		client.say(channel, greeting);
	}
	console.log('SUBSCRIBER -> ' + channel + ': ' + username);

	// If the channel has a subgoal, add to it.
	var subgoalsDb = db.collection('subgoals');
	var subgoals = subgoalsDb.where({'channel': channel}).items;
	if(subgoals.length){
		for (var i = 0; i < subgoals.length; i++) {
			subgoals[i].current = parseInt(subgoals[i].current) + 1;
			if(subgoals[i].current >= parseInt(subgoals[i].numSubs)){
				client.say(channel, 'Sub goal for "' + subgoals[i].name + '" REACHED!');
			}
			else {
				var percent = Math.floor((parseInt(subgoals[i].current) / parseInt(subgoals[i].numSubs)) * 100);
				client.say(channel, '"' + subgoals[i].name + '": ' + subgoals[i].current + '/' + subgoals[i].numSubs + ' (' + percent + '%)');
			}
			subgoalsDb.update(subgoals[i].cid, {'current': subgoals[i].current});
		};
	}
});

/**
 * If a channel gets a resubscribe, output a message if one exists.
 */
client.addListener('subanniversary', function(channel, username, months){
	var greetingCollection = db.collection('channel_greetings');
	var greeting = greetingCollection.where({
		'channel': channel,
		'event': 'resub'
	});
	if( greeting.items.length > 0 ){
		var greeting = greeting.items[0].greeting;
		greeting = greeting.replace('${username}', username, 'gi');
		greeting = greeting.replace('${months}', months, 'gi');
		greeting = greeting.replace('${s}', (months == 0 || months > 1) ? 's' : '');
		client.say(channel, greeting);
	}
	console.log('SUBANNIVERSARY -> ' + channel + ': ' + username + ' for ' + months + ' months.');

	// If the channel has a subgoal, add to it.
	var csettingsDb = db.collection('channel_settings');
	var resub_item = csettingsDb.where({'channel': channel}).items[0];
	var resub = false;
	if(resub_item){
		resub = resub_item.subgoal_resubs == 'on' ? true : false;
	}
	if(resub){
		var subgoalsDb = db.collection('subgoals');
		var subgoals = subgoalsDb.where({'channel': channel}).items;
		if(subgoals.length){
			for (var i = 0; i < subgoals.length; i++) {
				subgoals[i].current = parseInt(subgoals[i].current) + 1;
				if(subgoals[i].current >= parseInt(subgoals[i].numSubs)){
					client.say(channel, 'Sub goal for "' + subgoals[i].name + '" REACHED!');
				}
				else {
					var percent = Math.floor((parseInt(subgoals[i].current) / parseInt(subgoals[i].numSubs)) * 100);
					client.say(channel, '"' + subgoals[i].name + '": ' + subgoals[i].current + '/' + subgoals[i].numSubs + ' (' + percent + '%)');
				}
				subgoalsDb.update(subgoals[i].cid, {'current': subgoals[i].current});
			};
		}
	}
});

/**
 * @brief Listens to `chat` events from tmi.js and responds accordingly.
 */
client.addListener('chat', function(channel, user, msg){
	punishIfBannedUrl(channel, user, msg);
	runCommand(channel, user, msg);
});

/**
 * See if a user is okay to use a command. Returns boolean
 */
function userOkToUseCommand(channel, userObj){
	var collection = db.collection('last_command_use');
	var rv = true;

	var getLast = collection.where({
		'channel': channel,
		'username': userObj.username
	}).items[0];

	// Moderators or higher can use commands willy nilly
	if( getLast != undefined && util.checkAccess(channel, userObj, '', 'moderator') == false ){

		// get date diff
		var now = Date.now();
		var diff = now - getLast.datetime; // should be stored in ms

		// if a user last used a command in the last 10 seconds, dont allow them to use this one
		if( diff < 10000 ){
			rv = false;
		}
	}

	return rv;
}

/**
 * Run a command.
 * @TODO Simplify this.
 */
function runCommand(channel, user, msg){
	// check for commands
	if( msg.indexOf(_delim) === 0 ){
		//run command
		var cmd = msg.split(' ');
		var trigger = cmd[0].replace(_delim, ''); // remove delim

		var canUse = false;

		// arguments. we need to stringify user because you can't send objects through argument.
		var defArgs = [channel, JSON.stringify(user), trigger, msg];

		// check if it's available for use.
		var channel_trigger_settings = db.collection('channel_trigger_settings');
		var commandItems = channel_trigger_settings.where({
			'channel': channel,
			'trigger': trigger
		}).items;
		if( commandItems.length === 0 ){
			canUse = true; //implicit
		}
		else {
			canUse = commandItems[0].on;
		}

		// Undefined and null are truey because if they implicity allow use.
		if( (canUse === true || canUse === undefined || canUse === null) && userOkToUseCommand(channel, user) === true ){
			// check for file existance
			var path = './commands/' + trigger + '.js';
			fs.exists(path, function(exists){
				// Exists, so run the command.
				if( exists ){
					var task = fork(path, defArgs);

					task.on('message', function(message){
						parseMessage(message, client);
					});

					console.log('CORE COMMAND -> ' + channel + ': ' + trigger);
				}
				// !!! if the path doesn't exist, maybe it's a per-channel custom command
				else {
					//@TODO move this out
					var commanddb = db.collection('custom_commands');
					var channel_commands = commanddb.where({'channel': channel, 'trigger': trigger});
					if( channel_commands.items.length === 1 ){
						var access_db = db.collection("channel_access");
						var access = access_db.where({'channel': channel, 'trigger': trigger});
						var checkAccess = "broadcaster"; // assume nobody can do it
						if( access.items.length === 1 ){
							checkAccess = access.items[0].access;
						} else {
							checkAccess = "everybody";
						}

						if( util.checkAccess(channel, user, trigger, checkAccess) ){
							client.say(channel, channel_commands.items[0].message);
						}

						console.log('CUSTOM COMMAND -> ' + channel + ': ' + trigger);
					}
				}
			});

			// Update users' last used command datetime
			var lastCommandUseDb = db.collection('last_command_use');
			var exists = lastCommandUseDb.where({
				'channel': channel,
				'username': user.username
			}).items[0];
			if(exists){
				lastCommandUseDb.update(exists.cid, {
					'datetime': Date.now()
				});
			}
			else{
				lastCommandUseDb.insert({
					'channel': channel,
					'username': user.username,
					'datetime': Date.now()
				});
			}
		}
	}
}

/**
 * @brief Parse and act on the message sent by a command/forked child.
 *
 * @param message the message object
 * @param client the irc client
 */
function parseMessage(message, client){
	// determine what sort of message it is

	if( message.channel !== null ){
		// join x channel
		if( message.command === 'join' ){
			client.join(message.channel).then(function(){
				client.say('#' + _username, 'Joining ' + message.channel + '.');
			});
		}

		// leave x channel
		if( message.command === 'part' ){
			client.part(message.channel).then(function(){
				client.say('#' + _username, 'Leaving ' + message.channel + '.');
			});
		}

		if( message.command === 'say' && message.message !== null ){
			client.say(message.channel, message.message);
		}

		// Timeout w/ message if you don't want a message, have it be a 0-length string.
		if( message.command === 'to' && message.username && message.time && message.toMsg !== null ){
			client.timeout(message.channel, message.username, message.time).then(function(){
				if( message.toMsg.length > 0 ){
					client.say(message.channel, message.toMsg);
					punished_users.insert({
						'channel': channel,
						'user': user.username,
						'consequence': 'timeout',
						'reason': 'n/a'
					});
				}
			});
		}

		// Send a whisper to a user
		if( message.command === 'whisper' && message.username && message.message ){
			//forks['whisper'].send(message);
		}
	}
}

/**
 * @brief If a user posts a banned domain, punish them based on the 'banned_domains' database.
 *
 * @TODO Needs to be improved. Strip subdomains.
 */
function punishIfBannedUrl(channel, user, chatMessage){
	var banned_domains = db.collection('banned_domains');
	var matched_urls = chatMessage.match(rurl);
	var channel_settings = db.collection('channel_settings');
	var settings = channel_settings.where({
		'channel': channel
	}).items[0];

	if( matched_urls !== null && matched_urls.length > 0 ){
		// remove http or https
		var urlSplit = extractDomain(matched_urls[0]).split('.');
		var url = urlSplit.splice(-2).join('.');

		if( settings !== undefined ){
			/**
			 * Ban shortened URLs.
			 */
			var isBanShortened = settings['banshortenedlinks'] == 'on' ? true : false;
			if( isBanShortened === true ){
				url = url.replace('www.', '', 'gi'); // remove www.
				// check if it's a shortened url in our json
				if( prebannedPhrases.shorteners.indexOf(url.toLowerCase()) >= 0 ){
					// banned phrase, timeout for an hour
					client.timeout(channel, user.username, 3600).then(function(){
						client.say(channel, util.getDisplayName(user) + ' has been timed out: ' + url.toLowerCase() + ' is a link shortener.');
						console.log('LINKSHORT (timeout) -> ' + channel + ': ' + user.username);
						punished_users.insert({
							'channel': channel,
							'user': user.username,
							'consequence': 'timeout',
							'reason': 'Posted a link shortener.'
						});
					});
				}
			}

			if( settings.banlinks === 'on' ){
				if( user['user-type'] !== 'mod' || user.username !== _username ){
					// 60sec timeout @TODO Make it configurable. I should probably make a website for this bot ey.
					client.timeout(channel, user.username, 60);
					client.say(channel, util.getDisplayName(user) + ', please don\'t post links.');
					punished_users.insert({
						'channel': channel,
						'user': user.username,
						'consequence': 'timeout',
						'reason': 'Posted a link while links were banned.'
					});
				}
			}
		}

		var banned = banned_domains.where({
			'channel': channel,
			'domain': url
		});

		if( banned.items.length > 0 ){
			// we have a hit
			var item = banned.items[0];

			if( item.consequence === 'ban' ){
				client.ban(channel, user.username).then(function(){
					client.say(channel, util.getDisplayName(user) + ' has been banned: ' + item.domain + ' is a punishable domain.');
					console.log('BANNEDURL (ban) -> ' + channel + ': ' + user.username);
					punished_users.insert({
						'channel': channel,
						'user': user.username,
						'consequence': 'ban',
						'reason': 'Banned domain name.'
					});
				});
			}
			else if( item.consequence === 'timeout' ){
				client.timeout(channel, user.username, item.timeoutTime).then(function(){
					client.say(channel, util.getDisplayName(user) + ' has been timed out: ' + item.domain + ' is a punishable domain.');
					console.log('BANNEDURL (timeout) -> ' + channel + ': ' + user.username + ' (' + item.timeoutTime + ')');
					punished_users.insert({
						'channel': channel,
						'user': user.username,
						'consequence': 'timeout',
						'reason': 'Banned domain name.'
					});
				});
			}
		}
	}
}

/**
 * Add a message to a queue since we can only put out 200 messages every 30 seconds.
 */
function addToMessageQueue(channel, message){

}

// From http://stackoverflow.com/questions/8498592/extract-root-domain-name-from-string on 3 July 2015
function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}
