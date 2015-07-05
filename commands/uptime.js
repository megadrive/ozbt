/**
 * Output stream's uptime to chat.
 * @author: Megadrive
 *
 * !uptime
 */

var uptime_url = 'http://tireansucks.com/twitch/uptime.php?channel=';

var request = require('request');
var util = require('../util.js');
var args = process.argv.splice(2);
var user = JSON.parse(args[1]);

if( util.checkAccess(args[0], user, 'viewer') ){
	request(uptime_url + args[0].substr(1, args[0].length -1), function(err, res, body){
		if( !err && res.statusCode === 200 ){
			var uptimeObj = JSON.parse(body);
			var txt = uptimeObj.uptime === 'offline' ? 'Stream is ' : 'Streaming for ';
			process.send({
				'command': 'say',
				'channel': args[0],
				'message': txt + uptimeObj.uptime
			});
		}
	});
}
