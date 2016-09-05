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
		return new Promise(function(resolve, reject) {
			db.collection(tableName).load(function(err){
				if(err)
					reject(err);

				var docs = db.collection(tableName).find();
				resolve(docs);

				if(callback && typeof callback === "function") callback(docs);
			});
		});
	},

	"find": (db, tableName, fields, callback) => {
		return new Promise(function(resolve, reject) {
			db.collection(tableName).load(function(err){
				if(err)
					reject(err);

				var docs = db.collection(tableName).find(fields);
				resolve(docs);

				if(callback && typeof callback === "function") callback(docs);
			});
		});
	},

	/**
	 *
	 */
	"insert": (db, tableName, data, callback) => {
		return new Promise(function(resolve, reject) {
			db.collection(tableName).load(function(err){
				if(err)
					reject(err);

				db.collection(tableName).insert(data, callback);
				db.collection(tableName).save(function(err){
					if(err)
						reject(err);
				});
				resolve();
			});
		});
	},

	"update": (db, tableName, selectors, update, onUpdate) => {
		return new Promise(function(resolve, reject) {
			db.collection(tableName).load(function(err){
				if(err)
					reject(err);

				db.collection(tableName).update(selectors, update, {}, onUpdate);
				db.collection(tableName).save(function(err){
					if(err){
						reject(err);
						throw new Error(err);
					}

					resolve();
				});
			});
		});
	},

	"delete": (db, tableName, fields, callback) => {
		return new Promise(function(resolve, reject) {
			db.collection(tableName).load(function(err){
				if(err)
					reject(err);

				db.collection(tableName).remove(fields, {}, callback);
				db.collection(tableName).save((err) => {
					if(err){
						reject(err);
						throw new Error(err);
					}

					resolve();
				});
			});
		});
	},

	"join": (db, tableName1, tableName2, selector, joinSelectors, callback) => {
		return new Promise(function(resolve, reject) {
			if(joinSelectors["$require"] === undefined) joinSelectors["$require"] = true;
			if(joinSelectors["$multi"] === undefined) joinSelectors["$multi"] = false;

			db.collection(tableName1).load(() => {
				db.collection(tableName2).load(() => {
					var join = {};
					join[tableName2] = joinSelectors;

					var results = db.collection(tableName1).find(selector, {
						"$join": [join]
					});

					if(callback && typeof callback === "function") callback(results);
				});
			});
		});
	}
};
