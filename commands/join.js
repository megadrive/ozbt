
var fs = require('fs');
var args = process.argv.splice(2);
var util = require('util');

var data = JSON.parse(args[1]);

// Join user's channel if said in #ozbt
if( args[0] === '#ozbt' ){
	var username = data.username;

	// send message to client to join channel
	process.send({
		'command': 'join',
		'channel': username
	});
}