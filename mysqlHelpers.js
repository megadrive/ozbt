"use strict";

module.exports = {
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
			if( typeof value === "string" ) value = "'" + value + "'";
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
				value = value.replace(/[^\\]?"/g, '\\"');
				value = value.replace(/[^\\]?'/g, "\\'");
			}
			_values.push('"' + value + '"');
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
				"broadcaster": 0,
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
