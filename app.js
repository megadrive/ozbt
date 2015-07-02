
var fs = require('fs');
var fork = require('child_process').fork;
var util = require('util');

var irc = require('twitch-irc');
var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var request = require('request');

var _oauth = '';
var _username = '';
var _delim = '!';

var rurl = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/;

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
	    debug: true,
	    debugIgnore: ['ping', 'action']
	},
	identity: {
	    username: _username,
	    password: _oauth
	}
};

// Calling a new instance..
var client = new irc.client(clientOptions);

// Connect the client to the server..
client.connect();

/**
 * This slab of text gets the channels that have connected to ozbt through the !join command.
 */
var dbOnConnect = db.collection('onConnect');
var dbChannels = dbOnConnect.items;
var _joinTheseChannels = [];
for (var i = dbChannels.length - 1; i >= 0; i--) {
	_joinTheseChannels.push(dbChannels[i].channel);
};
client.addListener('connected', function (address, port) {
	client.join('#' + _username);
	for (var i = 0; i < _joinTheseChannels.length; i++) {
		client.join('#' + _joinTheseChannels[i]);
	}
});

client.addListener('join', function (channel, username) {
	// Gets moderators for the channel being joined since the user object
	// for chat seems to be broken sometimes.
	request('https://tmi.twitch.tv/group/user/' + channel.replace('#', '') + '/chatters', function(err, res, body){
		if( !err && res.statusCode === 200 ){
			var moderatorsCollection = db.collection('channel_moderators');
			var json = JSON.parse(body);

			var mods = json.chatters.moderators;

			// wipe mods clean
			//TODO: Make it do a diff or something
			var dbMods = moderatorsCollection.where({'channel': channel});
			if( dbMods.items.length > 0 ){
				for (var i = 0; i < dbMods.items.length; i++) {
					moderatorsCollection.remove(dbMods.items[i].cid);
				};
			}

			for (var i = 0; i < mods.length; i++) {
				moderatorsCollection.insert({
					'channel': channel,
					'username': mods[i]
				});
			};
			moderatorsCollection.save();
		}
	});
});

client.addListener('hosted', function(channel, username, viewers){
	client.say(channel, 'Now being hosted by ' + username + ' for ' + viewers + ' viewers! Thanks!');
});

/**
 * @brief Listens to `chat` events from twitch-irc and responds accordingly.
 */
client.addListener('chat', function(channel, user, msg){
	punishIfBannedUrl(channel, user, msg);

	// check for commands
	if( msg.indexOf(_delim) === 0 ){
		//run command
		var cmd = msg.split(' ');
		var filename = cmd[0].replace(_delim, ''); // remove delim

		// arguments. we need to stringify user because you can't send objects through argument.
		var defArgs = [channel, JSON.stringify(user), msg];

		// check if it's available for use.
		var channel_settings = db.collection('channel_settings');
		var commandItems = channel_settings.where({
			'channel': channel,
			'trigger': filename
		}).items;
		if( commandItems.length === 0 ){
			canUse = true; //implicit
		}
		else {
			canUse = commandItems[0].on;
		}

		// Undefined and null are truey because if they implicity allow use.
		if( canUse === true || canUse === undefined || canUse === null ){
			// check for file existance
			var path = './commands/' + filename + '.js';
			fs.exists(path, function(exists){
				// Exists, so run the command.
				if( exists ){
					var task = fork(path, defArgs);

					task.on('message', function(message){
						parseMessage(message, client);
					});
				}
				// if the path doesn't exist, maybe it's a per-channel custom command
				else {
					//TODO: move this out
					var commanddb = db.collection('custom_commands');
					var channel_commands = commanddb.where({'channel': channel, 'trigger': filename});
					if( channel_commands.items.length === 1 ){
						client.say(channel, channel_commands.items[0].message);
					}
				}
			});
		}
	}
});

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
				}
			});
		}
	}
}

/**
 * @brief If a user posts a banned domain, punish them based on the 'banned_domains' database.
 *
 * TODO: Needs to be improved. Strip subdomains.
 */
function punishIfBannedUrl(channel, user, chatMessage){
	var banned_domains = db.collection('banned_domains');

	var matched_urls = chatMessage.match(rurl);

	if( matched_urls !== null && matched_urls.length > 0 ){
		// remove http or https

		var urlSplit = extractDomain(matched_urls[0]).split('.');
		var url = urlSplit.splice(-2).join('.');

		var banned = banned_domains.where({
			'channel': channel,
			'domain': url
		});

		if( banned.items.length > 0 ){
			// we have a hit
			var item = banned.items[0];

			if( item.consequence === 'ban' ){
				client.ban(channel, user.username).then(function(){
					client.say(user.username + ' has been banned: ' + item.domain + ' is a punishable domain.');
				});
			}
			else if( item.consequence === 'timeout' ){
				client.timeout(channel, user.username, item.timeoutTime).then(function(){
					client.say(user.username + ' has been timed out: ' + item.domain + ' is a punishable domain.');
				});
			}
		}
	}
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

/**
 * @brief Creates a temporary file with contents that is deleted after one minute.
 *
 * @param  string contents jsonified contents to remember
 * @return the file string
 *
 * NOTE: Currently unused.
 */
function createTemporaryFile(contents, prepend){
	var filename = prepend + Date.now();
	var fd = fs.openSync('./temp/' + filename, 'w');
	fs.write(fd, contents);
	fs.close(fd);

	setTimeout(function(){
		fs.unlink('./temp/' + filename);
		console.log('del temp file: ' + filename);
	}, 60000);

	return './temp/' + filename;
}
