
var util = require("../util.js");
var db = require("../dbHelpers.js");
var request = require("request");
var user = JSON.parse(process.env.user);
var fs = require("fs");

// @TODO: Make this use forerunnerdb instead of a temporary file. We do NOT need to have permenence for strawpoll ids.

var api = "https://strawpoll.me/api/v2/polls";
var tempDir = "temp/strawpollIds/";

// Get arguments.
var message = process.env.message.replace("!spoll ", "", "i");
var opts = message.split(/(?=-[to])/g);

var title = "";
var options = [];
for(var i = 0; i < opts.length; ++i){
	if(opts[i].indexOf("-t") === 0){
		title = opts[i].replace(/( *)-t( +)/i, "").trim();
	}
	else if(opts[i].indexOf("-o") === 0){
		options.push(opts[i].replace(/( *)-o( +)/i, "").trim());
	}
}

var jOpts = {
	"title": title,
	"options": options
};

var createPoll = () => {
	request({
		"url": api,
		"method": "post",
		"json": true,
		"body": jOpts
	}, (err, res, body) => {
		if(err){
			console.error(err);
		}
		else {
			var j = body;
			util.say(process.env.channel, "Vote on \"" + title + "\" here: http://strawpoll.me/" + j.id);

			fs.mkdirSync(tempDir);
			var f = tempDir + process.env.channel;
			fs.writeFile(f, j.id, (err) => {
				if(!err){
					console.log("!spoll -> Saved strawpoll id for " + process.env.channel);
				}
				else {
					console.error("!spoll -> write: " + err);
				}
			});
		}
	});
};

var getResult = () => {
	fs.readFile(tempDir + process.env.channel, (err, data) => {
		if(err){
			console.error(err);
		}
		else {
			request(api + "/" + data, (err, res, body) => {
				if(err){
					console.error(err);
				}
				else {
					var j = JSON.parse(body);

					if(j.error != undefined){
						console.error(j);
					}
					else {
						var title = j.title;
						var o = [];
						for(var i = 0; i < j.options.length; ++i){
							o.push(j.options[i] + ": " + j.votes[i]);
						}
						var str = o.join(" | ");

						util.say(process.env.channel, util.getDisplayName(user) + " -> Results for \"" + title + "\": " + str);
					}
				}
			});
		}
	});
};

if(message.indexOf("results") >= 0){
	getResult();
}
else {
	createPoll();
}
