"use strict"

var util = require("../util.js");
var db = require("../dbHelpers.js");
var Fuse = require("fuse.js");
var consts = require("../consts.js");

/**
 * This block makes testing this individual function easier.
 */
//util.say = process.env.channel ? util.say : util.say = (c, m) => { console.info(`[${c}]`, m) };
//process.env.user = process.env.user ? process.env.user : '{"username": "dummy", "mod": true}';
//process.env.channel = process.env.channel ? process.env.channel : "#megadriving";
//process.env.message = process.env.message ? process.env.message : "!search LLLLLLLLLLLL";

var user = JSON.parse(process.env.user);

// Get arguments.
let args = process.env.message.split(" ");

let query = args.splice(1).join(" ");
let ssheetid = "1GHSGtC2NkudIH3a4UFreE2BImo2K2FBBM6GyQvZmM1E";
let range = ["A13", "B1714"];

var got = require("got");
let api_key = "AIzaSyBHIbQxJidKiQwYt2QWu34ZyFJwHX49UCc";

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	got(`https://sheets.googleapis.com/v4/spreadsheets/${ssheetid}/values/Games%20list!${range.join(":")}?key=${api_key}`)
		.then(function(response){
			let games_data = response.body;
			let games = JSON.parse(games_data).values;
			console.info("Number of games:", games.length);

			if(query.length){
				var options = {
					shouldSort: true,
					tokenize: false,
					threshold: 0.6,
					location: 0,
					distance: 100,
					maxPatternLength: 32,
					minMatchCharLength: 2,
					keys: [0]
				};
				var fuse = new Fuse(games, options);
				var result = fuse.search(query);

				let say = `No matches for "${query}"`;
				if(result.length){
					let top3 = [];
					let top3_tmp = result.slice(0,3);
					for(let i = 0; i < top3_tmp.length; i++){
						top3[i] = top3_tmp[i][0];
					}
					say = `Best ${top3.length} matches: ` + top3.join(", ") + ". ";
					if(top3_tmp.length > 3) say += top3_tmp.length + " total matches.";
				}

				util.say(process.env.channel, util.getDisplayName(user) + ' -> ' + say);
			}
			else {
				util.say(process.env.channel, util.getDisplayName(user) + ' -> Total games in PS1 challenge: ' + games.length);
			}
		});
}
