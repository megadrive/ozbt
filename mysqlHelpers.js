"use strict";

var _config = require("./config/config.user.js");
var _mysql = require("mysql");
var _db = undefined;

module.exports = {
	"db": () => {
		if( _db === undefined ){
			// Create MySQL connection
			_db = _mysql.createConnection({
				"host": _config.mysql_addr,
				"user": _config.mysql_user,
				"password": _config.mysql_pass,
				"database": _config.mysql_db

				//@debug
				//,"debug": true
			});
			_db.connect();

			console.log("Connected to MySQL.");
		}

		return _db;
	},

	"findAll": (db, tableName, callback) => {
		var sql = "SELECT * FROM `" + tableName + "` AS " + tableName;
		db.query(sql, (err, rows, fields) => {
			if(err) throw err;
			callback(rows);
		});
	},

	"find": (db, tableName, fields, callback) => {
		var _fields = [];

		Object.keys(fields).forEach((key) => {
			var value = fields[key];
			if( typeof value === "boolean" ) value = +value;
			if( typeof value === "string" ) value = "'" + value.replace(/[^\\]?'/g, "\\\'") + "'";
			_fields.push("`" + key + "` = " + value);
		});
		_fields = _fields.join(" AND "); // from array to string literal

		var sql = "SELECT * FROM `" + tableName + "` AS " + tableName + " WHERE " + _fields;
		db.query(sql, (err, rows, fields) => {
			if(err) throw err;
			callback(rows);
		});
	},

	"insert": (db, tableName, fields, callback) => {
		var _fields = [];
		var _values = [];

		// Fields
		Object.keys(fields).forEach((key) => {
			_fields.push("`" + key + "`");
		});
		_fields = _fields.join(", ");

		// Values
		Object.keys(fields).forEach((key) => {
			var value = fields[key];
			if( typeof value === "boolean" ) value = +value;
			if( typeof value === "string" ){
				value = value.replace(/([^\\]?)'/g, "$1\\'");
			}
			_values.push("'" + value + "'");
		});
		_values = _values.join(", ");

		var sql = "INSERT INTO `" + tableName + "` (" + _fields + ") VALUES (" + _values + ")";
		db.query(sql, (err, rows, fields) => {
			if(err){
				throw err;
			}
			callback(rows);
		});
	},

	"update": (db, tableName, where, fields, callback) => {
		var _fields = [];
		var _values = [];

		// Fields
		Object.keys(fields).forEach((key) => {
			var value = fields[key];
			if( typeof value === "boolean" ) value = +value;
			if( typeof value === "string" ){
				value = value.replace(/([^\\]?)'/g, "$1\\'");
			}
			_values.push(key + " = '" + value + "'");
		});
		_values = _values.join(",\n");

		var sql = "UPDATE `" + tableName + "` SET " + _values + " WHERE " + where;
		db.query(sql, (err, rows, fields) => {
			if(err){
				throw err;
			}
			callback(rows);
		});

	},

	"delete": (db, tableName, fields, callback) => {
		// Fields
		var _values = [];
		Object.keys(fields).forEach((key) => {
			var value = fields[key];
			if( typeof value === "boolean" ) value = +value;
			if( typeof value === "string" ){
				value = value.replace(/[^\\]?'/g, "\\\'");
			}
			_values.push(key + " = '" + value + "'");
		});
		_values = _values.join(" AND ");

		var sql = "DELETE FROM `" + tableName + "` WHERE " + _values;
		db.query(sql, (err, rows, fields) => {
			if(err){
				throw err;
			}
			callback(rows);
		});
	},

	"addslashes": (text) => {
		return text.replace(/([^\\]?)'/g, "$1\\'");
	},

	"removeslashes": (text) => {
		return text.replace(/([^\\]?)\\'/g, "\'");
	},

	//@NOTE Keeping for posterity.
	"_______locallydb2mysql_______": () => {
		//@debug
		//insert all custom commands per channel
		var old = require("./tmp.js");
		for(let i = 0; i < old.length; i++){
			var cc = old[i];

			// If channel doesnt exist, create a new record
			_dbHelpers.find(_db, "channel", {"Channel": cc.channel}, (rows) => {
				// Create new record
				if( rows.length === 0 ){
					_dbHelpers.insert(_db, "channel", {"Channel": cc.channel}, (result) => {
						if(result.affectedRows === 1 )
							console.log("> Created channel " + cc.channel);
					});
				}
			});

			// Add custom command
			_dbHelpers.insert(_db, "customcommand", {
				"Command": "!" + cc.trigger,
				"OutputText": cc.message,
				"Channel": cc.channel
			}, (rows) => {});

			let access = {
				"everybody": 5,
				"regular": 4, // dont exist as yet
				"subscriber": 3,
				"moderator": 2,
				"supermoderator": 1, // dont exist as yet
				"broadcaster": 0
			};

			// Add command permission
			_dbHelpers.insert(_db, "commandpermission", {
				"Command": "!" + cc.trigger,
				"PermissionLevel": access[cc.access],
				"Channel": cc.channel
			}, (rows) => {});
		}
	}
};
