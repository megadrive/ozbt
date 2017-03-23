"use strict";

// @TODO: Update to MongoDB

var _config = require("../config/config.user.js");
var _client = undefined;
var consts = require("../consts.js");
var db = require("../dbHelpers.js");
var util = require("../util.js");

var tbl = "subgoal";

var onSub = (channel, username) => {
	console.error("subgoals.js not updated. exiting.."); return;

	db.find("subgoal", {
		"Channel": channel
	}, (rows) => {
		if(rows.length > 0){
			var goal = null;
			for(var i = 0; i < rows.length; i++){
				if(rows[i].Current < rows[i].Maximum){
					goal = rows[i];
					i = rows.length; // break
				}
			}

			if(goal !== null){
				db.update(tbl, "PublicHash = '" + goal.PublicHash + "'", {
					"Current": goal.Current + 1
				}, (updated_rows) => {
					if( updated_rows.affectedRows === 1 ){
						var r = goal;
						goal.Current++; // add the new sub
						var percent = Math.floor((r.Current / r.Maximum) * 100);
						var str = "\"" + r.Name + "\" -- " + r.Current + "/" + r.Maximum +
										" (" + percent + "%)" +
										(percent >= 100 ? " MET!" : ".") + " (hash: " + r.PublicHash + ")";
						_client.say(channel, str);
					}
				});
			}
			else {
				console.warn("No subgoals created for channel " + channel);
			}
		}
	});
};

var onResub = (channel, username, months) => {
	console.error("subgoals.js not updated. exiting.."); return;
	
	db.find("subgoal", {
		"Channel": channel
	}, (rows) => {
		if(rows.length > 0){
			var goal = null;
			for(var i = 0; i < rows.length; i++){
				if(rows[i].Current < rows[i].Maximum){
					goal = rows[i];
					i = rows.length; // break
				}
			}

			if(goal !== null && goal.ResubsCount === consts.true){
				onSub(channel, username);
			}
			else if(goal !== null && goal.ResubsCount === consts.false){
				var percent = Math.floor((goal.Current / goal.Maximum) * 100);
				var str = "\"" + goal.Name + "\" -- " + goal.Current + "/" + goal.Maximum +
								" (" + percent + "%)" +
								(percent >= 100 ? " MET!" : ".") + " (hash: " + goal.PublicHash + ")";
				_client.say(channel, str);
			}
		}
	});
};

module.exports = {
	"register": (client) => {
		if(client){
			_client = client;
			_client.on("subscription", onSub);
			_client.on("resub", onResub);
		}

		return client ? true : false;
	}
};
