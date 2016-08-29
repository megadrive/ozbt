"use strict";

var config = require("./config/config.user.js");
var ForerunnerDB = require("forerunnerdb");
var fdb = new ForerunnerDB();
var db = fdb.db("ozbt");
db.persist.dataDir("db");

module.exports = {
	"db": () => {
		return db;
	},

	/**
	 * Gets all items in a collection.
	 * @return array Returns a copy of the data in the collection, so you can do whatever with it.
	 */
	"findAll": (db, tableName, callback) => {
		db.collection(tableName).load(function(err){
			if(err)
				throw new Error(err);

			var docs = db.collection(tableName).data().slice(0);
			callback(docs);
		});
	},

	"find": (db, tableName, fields, callback) => {
		db.collection(tableName).load(() => {
			var docs = db.collection(tableName).find(fields);
			callback(docs);
		});
	},

	/**
	 *
	 */
	"insert": (db, tableName, data, callback) => {
		db.collection(tableName).load(() => {
			db.collection(tableName).insert(data, callback);
			db.collection(tableName).save();
		});
	},

	"update": (db, tableName, selectors, update, onUpdate) => {
		db.collection(tableName).load(() => {
			db.collection(tableName).update(selectors, update, {}, onUpdate);
			db.collection(tableName).save((err) => {
				if(err)
					throw new Error(err);
			});
		});
	},

	"delete": (db, tableName, fields, callback) => {
		db.collection(tableName).load(() => {
			db.collection(tableName).remove(fields, {}, callback);
			db.collection(tableName).save();
		});
	},

	"join": (db, tableName1, tableName2, selector, joinSelectors, callback) => {
		if(joinSelectors["$require"] === undefined) joinSelectors["$require"] = true;
		if(joinSelectors["$multi"] === undefined) joinSelectors["$multi"] = false;

		db.collection(tableName1).load(() => {
			db.collection(tableName2).load(() => {
				var join = {};
				join[tableName2] = joinSelectors;

				var results = db.collection(tableName1).find(selector, {
					"$join": [join]
				});

				callback(results);
			});
		});
	}
};
