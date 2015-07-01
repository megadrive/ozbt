
var fs = require('fs');
var fork = require('child_process').fork;
var util = require('util');

var irc = require('twitch-irc');
var locallydb = require('locallydb');
var db = new locallydb('db/_app');

var _oauth = '';
var _username = '';
var _delim = '!';

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
	//DEBUG: Remove this later
	client.join('#tirean');

	client.join('#' + _username);
	for (var i = 0; i < _joinTheseChannels.length; i++) {
		client.join('#' + _joinTheseChannels[i]);
	}
});

/**
 * @brief Listens to `chat` events from twitch-irc and responds accordingly.
 */
client.addListener('chat', function(chan, user, msg){
	// check for commands
	if( msg.indexOf(_delim) === 0 ){
		//run command
		var cmd = msg.split(' ');
		var filename = cmd[0].replace(_delim, ''); // remove delim

		// arguments. we need to stringify user because you can't send objects through argument.
		var defArgs = [chan, JSON.stringify(user), msg];

		// check for file existance
		var path = './commands/' + filename + '.js';
		fs.exists(path, function(exists){
			// Exists, so run the command.
			if( exists ){
				util.log('CMD> ' + cmd + ' in ' + chan + ' by ' + user.username);
				var task = fork(path, defArgs);

				task.on('message', function(message){
					parseMessage(message, client);
				});
			}
		});
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