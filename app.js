
var fs = require('fs');
var fork = require('child_process').fork;
var util = require('util');

var irc = require('twitch-irc');

var _oauth = '';
var _username = '';
var _delim = '!';

// clean current temp files if any exist
fs.readdir('temp/', function(err, files){
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
}

var clientOptions = {
	options: {
	    debug: true,
	    debugIgnore: ['ping', 'action']
	},
	identity: {
	    username: _username,
	    password: _oauth
	},
	channels: ['ozbt']
};

// Calling a new instance..
var client = new irc.client(clientOptions);

// Connect the client to the server..
client.connect();

client.addListener('chat', function(chan, user, msg){
	// check for commands
	if( msg.indexOf(_delim) === 0 ){
		//run command
		var cmd = msg.split(' ');
		var filename = cmd[0].replace(_delim, ''); // remove delim

		// arguments
		var defArgs = [chan, JSON.stringify(user), msg];
		//
		//var tempFile = createTemporaryFile(defArgs, chan);

		var path = './commands/' + filename + '.js';

		// check for file existance
		fs.exists(path, function(exists){
			if( exists ){
				console.log('CMD> ' + cmd + ' in ' + chan + ' by ' + user.username);
				var task = fork(path, defArgs);

				task.on('message', function(message){
					parseMessage(message, client);
				});
			}
		});
	}
});

client.addListener('join', function (channel, username) {
	if( username === 'ozbt' ){
		// if we join
		//TODO: Log join in database
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

	// join x channel
	if( message.channel !== null && message.command !== null){
		client.join(message.channel);
	}
}

/**
 * @brief Creates a temporary file with contents that is deleted after one minute.
 *
 * @param  string contents jsonified contents to remember
 * @return the file string
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