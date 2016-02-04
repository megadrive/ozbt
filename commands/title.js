/**
 * Output stream's uptime to chat.
 * @author: Megadrive
 *
 * !uptime
 */

var api_url = 'https://api.twitch.tv/kraken/streams/';

var request = require('request');
var util = require('../util.js');
var args = process.argv.splice(2);
var user = JSON.parse(args[1]);

request(api_url + args[0].substr(1, args[0].length -1), function(err, res, body){
	if( !err && res.statusCode === 200 ){
		var jsonObj = JSON.parse(body);
		if(jsonObj.stream != null){
			console.log(jsonObj.stream);
			util.say(args[0], util.getDisplayName(user) + ' -> Title is: "' + jsonObj.stream.channel.status + '".');
		}
	}
});
