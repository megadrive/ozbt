"use strict"

var util = require("../util.js");
var db = require("../dbHelpers.js");
var fuzzy = require("fuzzy");
var consts = require("../consts.js");

/**
 * This block makes testing this individual function easier.
 */
util.say = process.env.channel ? util.say : util.say = (c, m) => { console.info(c, m) };
process.env.user = process.env.user ? process.env.user : '{"username": "dummy", "mod": true}';
process.env.channel = process.env.channel ? process.env.channel : "#megadriving";
process.env.message = process.env.message ? process.env.message : "!search spyro";

var user = JSON.parse(process.env.user);

// Get arguments.
let args = process.env.message.split(" ");

let query = args.splice(1).join(" ");
let ssheetid = "1GHSGtC2NkudIH3a4UFreE2BImo2K2FBBM6GyQvZmM1E";
let range = ["A13", "B1714"];

if(!util.checkPermissionCore(process.env.channel, user, consts.access.moderator)){
	console.info("!search failed, not mod:", user.username);
	process.exit(0);
}

var request = require("request-promise");
let api_key = "AIzaSyBHIbQxJidKiQwYt2QWu34ZyFJwHX49UCc";
request(`https://sheets.googleapis.com/v4/spreadsheets/${ssheetid}/values/Games%20list!${range.join(":")}?key=${api_key}`)
	.then(function(games_data){
		let games = JSON.parse(games_data).values;
		console.info("Number of games:", games.length);

		if(query.length){
			var results = fuzzy.filter(query, games, {"extract": function(el){ return el[0]; } });
			var matches = results.map(function(el){
				return el.string;
			});

			let top3 = matches.slice(0, 3);
			let say = `Best ${top3.length} matches: ` + top3.join(", ") + ". ";
			if(matches.length > 3) say += matches.length + " total matches.";
			util.say(process.env.channel, util.getDisplayName(user) + ' -> ' + say);
		}
		else {
			util.say(process.env.channel, util.getDisplayName(user) + ' -> Total games in PS1 challenge: ' + games.length);
		}
	});
