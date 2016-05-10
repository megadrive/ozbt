"use strict";

var config = require("../config/config.user.js");
var db = require("../mysqlHelpers.js");
var conn = db.db();
var restify = require("restify");
var server = restify.createServer({
	"name": "ozbt api",
	"version": "1.0.0"
});

var limitFunc = (table, channel, next, callback) => {
	if(next < 0){
		cmdFunc(table, channel, next);
		return;
	}

	var sql = "SELECT * FROM " + table + 
			" WHERE Channel = '#" + channel +
			"' LIMIT 10 OFFSET " + next + ";";

	conn.query(sql, (err, rows, fields) => {
		if(!err){
			callback(rows);
		}
	});
};

var cmdFunc = (req, res, next) => {
	if(req.params["next"]){
		limitFunc("customcommand", req.params["channel"], req.params["next"], (commands) => {
				res.send(JSON.stringify(commands));
		});
	}
	else {
		db.find(conn, "customcommand", {"Channel": "#"+req.params.channel}, 
			(commands) => {
				res.send(JSON.stringify(commands));
			});
	}

	next();
};

server.get("/command/:channel", cmdFunc);
server.get("/command/:channel/:next", cmdFunc);

server.listen(config.api_port);

server.on("error", (err) => {
	console.error(err);
});
