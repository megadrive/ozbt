"use strict";

var _config = require("../config/config.user.js");
var _client = undefined;
var consts = require("../consts.js");
var db = require("../dbHelpers.js");
var util = require("../util.js");

var tbl = "subgoal";

var onSub = (channel, username) => {
	db.find(db.db(), "subgoal", {
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
				db.update(db.db(), tbl, "PublicHash = '" + goal.PublicHash + "'", {
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
	db.find(db.db(), "subgoal", {
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

var _subgoals = {
	"register": (client) => {
		_client = client;
	},
	"onSub": onSub,
	"onResub": onResub
};

module.exports = _subgoals;
