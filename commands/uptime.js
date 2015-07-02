/**
 * Steal night's hard work
 */

var uptime_url = 'https://nightdev.com/hosted/uptime.php?channel=';

var request = require('request');
var util = require('../util.js');
var args = process.argv.splice(2);
var user = JSON.parse(args[1]);

if( util.isMod(args[0], user.username) ){
	request(uptime_url + args[0].substr(1, args[0].length -1), function(err, res, body){
		if( !err && res.statusCode === 200 ){
			process.send({
				'command': 'say',
				'channel': args[0],
				'message': body
			});
		}
	});
}
