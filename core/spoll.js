
var util = require("../util.js");
var db = require("../mysqlHelpers.js");
var request = require("request");
var user = JSON.parse(process.env.user);
var fs = require("fs");

var static = {
	"help": "!spoll -t Title of poll -o Option 1 -o Option 2 -o Option 3"
};
module.exports = static;

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

var createPoll = () => {
	request.post({
		"url": api,
		"formData": {
			"title": title,
			"options": options
		},
		"headers": "Content-Type: application/json"
	}, (err, res, body) => {
		if(err){
			console.error(err);
		}
		else {
			var j = JSON.parse(body);
			util.say(process.env.channel, "Vote on \"" + title + "\" here: http://strawpoll.me/" + j.id);

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
				console.log(api + "/" + data);

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
