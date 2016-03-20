
var request = require('request');
var util = require("../util.js");

var uptime_url = 'http://tireansucks.com/twitch/uptime.php?channel=' + process.env.channel.substring(1);
var user = JSON.parse(process.env.user);

request(uptime_url, (err, res, body) => {
	if( !err && res.statusCode === 200 ){
		var uptimeObj = JSON.parse(body);
		var txt = uptimeObj.uptime === 'offline' ? 'Stream is ' : 'Streaming for ';
		util.say(process.env.channel, util.getDisplayName(user) + ' -> ' + txt + uptimeObj.uptime);
	}
});
