"use strict";

var fs = require('fs');
var tmijs = require('tmi.js');

var _oauth = '';
var _username = '';

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
	    'debug': false,
	    'debugIgnore': ['ping', 'action', 'chat', 'join', 'part']
	},
	connection: {
		'random': 'group',
		'server': '199.9.253.120',
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

var okToWhisper = false;

client.on('join', function(){
	okToWhisper = true;
});

process.on('message', function(message){
	if( message.part || message.join ){
		if( message.part ){
			console.log('parting ' + message.part);
			client.part(message.part);
		}
		if(message.join){
			console.log('joining ' + message.join);
			client.join(message.join);
		}
	}
	else{
		console.log('Whisper ' + message.username + ': ' + message.message);
		client.whisper(message.username, message.message);
	}
});
