"use strict"

var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
//var args = '!battle create "Dark Souls", "Half-Life", "Portal"'.split(" ");
//var args = '!battle mod_vote "Dark Souls" 100'.split(" ");
//var args = '!battle vote "Dark Souls"'.split(" ");
//var args = '!battle'.split(" ");
var args = process.env.message.split(" ");

/*
var user = {"user-id": 12345, "username": "User"};
var util = {
	say: function(a, b){
		console.info(`[${a}] ${b}`);
	},
	getDisplayName: () => { return "User"; },
	checkPermissionCore: () => { return false; }
};
*/

var intent = args[1];

// Regex to match quotes
let rquotes = /(["'])(?:(?=(\\?))\2.)*?\1/g;

/**
 * Creates a new battle
 * @param {string} channel 
 * @param {string} message The message the user said, without editing
 */
function create(channel, message){
	return new Promise(function(resolve, reject){
		let opts_raw = args.slice(2).join(" ");
		let opts = [];

		let match = opts_raw.match(rquotes);

		opts = match.reduce(function(result, v, i){
			v = v.substr(1, v.length - 2);
			result[i] = {"Name": v, "Points": 0};
			return result;
		}, []);

		db.update("battle", { "Channel": channel }, {"Items": opts}, {"upsert": true})
			.then(function(result){
				util.say(channel, util.getDisplayName(process.env.user) + " -> Created a new battle between " + match.join(", ") + "!");
			});
	});
};

/**
 * Lets a user vote on a battle.
 * 
 * Checks the temporary db for an existing claim, if it exists, let them vote.
 * @param {string} channel 
 * @param {object} user 
 * @param {string} query
 */
function vote(channel, user, query){
	db.find("battle_temp", {
		"Channel": channel,
		"User.id": user["user-id"]
	}).then(function(res){
		console.log(res);
		if(res !== null){
			db.find("battle", {"Channel": channel})
				.then(function(battle){
					let voted = {};
					for(let i = 0; i < battle.Items.length; i++){
						if(battle.Items[i].Name.toLowerCase().indexOf(query.toLowerCase()) >= 0){
							battle.Items[i].Points += res.Amount;
							voted = battle.Items[i];
						}
					}

					db.update("battle", {"Channel": channel}, battle)
						.then(function(){
							db.delete("battle_temp", res);

							util.say(channel, util.getDisplayName(user) + 
								" -> Successfully added your " + res.Type + " vote to " + voted.Name + " bringing it to " + voted.Points + " points!");
						});
				});
		}
	});
};

/**
 * Lets a moderator add an amount to a current battle. Should track these.
 * @param {string} channel 
 * @param {object} user 
 * @param {string} query 
 * @param {number} amount 
 */
function mod_vote(channel, user, query, amount){
	db.find("battle", {"Channel": channel})
		.then(function(battle){
			for(let i = 0; i < battle.Items.length; i++){
				if(battle.Items[i].Name.toLowerCase().indexOf(query.toLowerCase()) >= 0){
					battle.Items[i].Points += Number(amount);
				}
			}

			db.update("battle", {"Channel": channel}, battle)
				.then(function(){
					util.say(channel, util.getDisplayName(user) + " -> Updated battle!");
				});
		});
};

/**
 * Delete the active battle.
 */
function del(channel){
	db.delete("battle", {"Channel": channel})
		.then(function(){
			util.say(channel, util.getDisplayName(user) + " -> Current battle for " + channel.substring(1) + " was deleted.");
		});
};

/**
 * Lists the current battle statistics in chat.
 * @param {string} channel 
 */
function list(channel){
	db.find("battle", {"Channel": channel})
		.then(function(battle){
			if(battle !== null){
				let s = [];
				for(let i = 0; i < battle.Items.length; i++){
					s.push(battle.Items[i].Name + ": " + battle.Items[i].Points);
				}
				util.say(channel, util.getDisplayName(user) + " -> Current points are as follows: " + s.join(", "));
			}
		});
}

let match = args.join(" ").match(rquotes); if(match) match = match[0];
if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	switch(intent){
		case "create":
			create(process.env.channel);
			break;
		case "mod_vote":
			mod_vote(process.env.channel, user, match.substring(1, match.length - 1), args[args.length - 1]);
			break;
		case "vote":
			vote(process.env.channel, user, match.substring(1, match.length - 1));
			break;
		case "delete":
			del(process.env.channel);
			break;
		default:
			list(process.env.channel);
			break;
	}
}
else {
	switch(intent){
		case "vote":
			vote(process.env.channel, user, match.substring(1, match.length - 1));
			break;
		default:
			list(process.env.channel);
			break;
	}
}
