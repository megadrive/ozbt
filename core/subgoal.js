"use strict";

process.exit(1);

// @TODO: Update to use MongoDB

var util = require("../util.js");
var config = require("../config/config.user.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);
var Hashids = require("hashids");
var hashids = new Hashids(config.hashids_salt + "_subgoal");

// Get arguments.
var args = process.env.message.split(" ");

var tbl = "subgoal";

/**
 * !subgoal add 10 I poop back and forth.
 * !subgoal edit nG 10 You do, not me.
 * !subgoal delete !poop
 *
 * !subgoal modpoints <hash> +10

 * !subgoal resubs nG [true|false]
 */

var intent = args[1];

// Add a new custom command
var add = () => {
	var subNum = args[2];
	var string = args.slice(3).join(" ");

	if(intent != undefined || subNum != undefined || string != undefined)
	{
		// Check for existance.
		db.find(tbl, {
			"Channel": process.env.channel,
			"Name": string
		}, (rows) => {
			if( rows.length > 0 ){
				// We have a command already, output a warning
				util.say(process.env.channel, util.getDisplayName(user) + " -> subgoal with name \"" + string + "\" already seems to exist. Try a new name or edit.");
			}
			else {
				// remove / if at the beginning of the string to prevent abuse.
				var rslashes = /^\/+/;
				string = string.replace(rslashes, "");

				db.insert(tbl, {
	  				"Name": string,
	  				"Current": 0,
	  				"Maximum": subNum,
	  				"ResubsCount": consts.true,
	  				"PublicHash": 0,
					"Channel": process.env.channel
				}, (rows) => {
					if( rows.inserted.length === 1 ){
						// Update PublicHash.
						var hash = hashids.encode(rows.insertId);
						db.update(tbl, "SubGoalId = " + rows.insertId, {"PublicHash": hash}, () => {});
						util.say(process.env.channel, util.getDisplayName(user) + " -> subgoal \"" + string + "\" was created. (hash: " + hash + ")");
					}
					else {
						console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
					}
				});
			}
		});
	}
};

var edit = () => {
	var hash = args[2];
	var subs = args[3];
	var string = args.slice(4).join(" ");

	// Check for existance. If it exists already, output an error pointing to !cmd edit.
	db.find(tbl, {
		"Channel": process.env.channel,
		"PublicHash": hash
	}, (rows) => {
		var found_rows = rows;
		if( rows.length === 1 ){
			db.update(tbl, "PublicHash='" + hash + "'", {"Name": string, "Maximum": subs}, (rows) => {
				if( rows.affectedRows === 1 ){
					console.log(rows);
					util.say(process.env.channel, util.getDisplayName(user) + " -> subgoal \"" + found_rows[0]["Name"] + "\" was updated.");
				}
				else {
					console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
				}
			});
		}
		else if( rows.length > 1 ){
			console.error("ERROR: There are duplicate entries for the channel command \"" + hash + "\" in channel " + process.env.channel + "!");
		}
		else {
			// We don't have a command, output a warning.
			util.say(process.env.channel, util.getDisplayName(user) + " -> subgoal \"" + hash + "\" doesn't exist, did you mean to use !subgoal add?");
		}
	});
};

var del = () => {
	var hash = args[2];

	// Check for existance. If it exists already, output an error pointing to !cmd edit.
	db.find(tbl, {
		"Channel": process.env.channel,
		"PublicHash": hash
	}, (rows) => {
		var found_rows = rows;
		if( rows.length > 0 ){
			if( rows.length > 1 )
				console.error("ERROR: There were duplicate entries for the subgoal \"" + hash + "\" in channel " + process.env.channel + "! They have all been removed now.");

			db.delete(tbl, {"PublicHash": hash}, (rows) => {
				if( rows.length > 0 ){
					util.say(process.env.channel, util.getDisplayName(user) + " -> subgoal \"" + found_rows[0]["Name"] + "\" was deleted.");
				}
				else {
					console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
				}
			});
		}
		else {
			// We don't have a command, output a warning.
			util.say(process.env.channel, util.getDisplayName(user) + " -> subgoal \"" + hash + "\" doesn't exist, did you mean to use !subgoal add?");
		}
	});
};

var list = () => {
	db.find(tbl, {
		"Channel": process.env.channel
	}, (rows) => {
		for(var i = 0; i < rows.length; i++){
			var r = rows[i];
			var percent = Math.floor((r.Current / r.Maximum) * 100);
			var str = i+1 + ". \"" + r.Name + "\" -- " + r.Current + "/" + r.Maximum +
							" (" + percent + "%)" +
							(percent >= 100 ? " MET!" : ".") + " (hash: " + r.PublicHash + ")";
			util.say(process.env.channel, str);
		}
	});
};

// !subgoal modsubs hash +/-pts
// !subgoal modsubs nRzs +10
var modsubs = () => {
	if( util.checkPermissionCore(process.env.channel, user, consts.access.supermoderator) ){
		var hash = args[2];
		var mod = args[3].slice(0,1);
		var amt = args[3].slice(1);

		var select = {
			"PublicHash": hash,
			"Channel": process.env.channel
		};

		var update = {};

		switch(mod){
			case "+":
				() => {
					db.find(tbl, {
						"Channel": process.env.channel,
						"PublicHash": hash
					}, (found_rows) => {
						if(found_rows.length === 1){
							var update = {
								"$inc": {
									"Current": Number(amt)
								}
							};

							db.update(tbl, selector, update, (rows) => {
								if(rows.length){
									util.say(process.env.channel, util.getDisplayName(user) + " -> \"" + found_rows[0].Name + "\" has been updated, now has " + newAmt + ".");
								}
							});
						}
					});
				};
				break;
			case "-":
				() => {
					db.find(tbl, {
						"Channel": process.env.channel,
						"PublicHash": hash
					}, (found_rows) => {
						if(found_rows.length === 1){
							var update = {
								"$inc": {
									"Current": -Number(amt)
								}
							};

							db.update(tbl, selector, update, (rows) => {
								if(rows.length){
									util.say(process.env.channel, util.getDisplayName(user) + " -> \"" + found_rows[0].Name + "\" has been updated, now has " + newAmt + ".");
								}
							});
						}
					});
				};
				break;
		}
	}
};

// !subgoal resubs nG [yes|no]
var countresubs = () => {
	var hash = args[2];
	var val = args[3].toLowerCase().trim();

	if(val == "yes" || val == "false"){
		db.update(tbl, "PublicHash = '" + hash + "'", {
			"ResubsCount": val == "yes" ? consts.true : consts.false
		}, (updated_rows) => {
			if(updated_rows.length === 1){
				util.say(process.env.channel, util.getDisplayName(user) + " -> Resubs will now count for the subgoal with hash \"" + hash + "\".");
			}
		});
	}
};

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	console.warn("Subgoals under reconstruction atm. Used in " + process.env.channel + " by " + user.username);

	switch(intent){
		case "add":
			add();
			break;
		case "edit":
			edit();
			break;
		case "delete":
			del();
			break;
		case "modsubs": // supermoderator
			modsubs();
			break;
		case "countresubs":
			countresubs();
			break;
		case "list":
		default:
			list();
			break;
	}
}
