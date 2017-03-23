"use strict";

var config = require("./config/config.user.js");
var MongoClient = require("mongodb").MongoClient;
var db = undefined;
var assert = require("assert");
var f = require("util").format;

function getDb(){
	function createMongoUrl(){
		let db_name = config.mongodb_db;
		if(process.env.NODE_ENV === "debug"){
			db_name = "debug_" + db_name;
			console.info("[ozbt] Using debug database.");
		}

		let base = "mongodb://" + config.mongodb_addr + db_name;
		if(base.indexOf("%s") >= 0){
			base = f(base, config.mongodb_user, config.mongodb_pass);
		}

		return base;
	}

	return new Promise(function(resolve, reject) {
		if(db === undefined){
			MongoClient.connect(createMongoUrl())
				.then((returned_db) => {
					console.info("MongoDB connection:", createMongoUrl());
					db = returned_db;
					resolve(db);
				})
				.catch((err) => {
					assert.equal(null, err);
				});
		}
		else {
			resolve(db);
		}
	});
}

module.exports = {
	"db": getDb,

	/**
	 * Gets all items in a collection.
	 * @return array Returns a copy of the data in the collection, so you can do whatever with it.
	 */
	"findAll": (tableName, fields) => {
		return new Promise(function(resolve, reject) {
			getDb()
				.then((db) => {
					var docs = db.collection(tableName).find(fields);
					resolve(docs);
				});
		});
	},

	"find": (tableName, fields) => {
		return new Promise(function(resolve, reject) {
			getDb()
				.then((db) => {
					var docs = db.collection(tableName).findOne(fields);
					resolve(docs);
				});
		});
	},

	/**
	 * Inserts a document.
	 * @returns a Promise, resolving without data if successful and rejecting with errmsg on fail.
	 */
	"insert": (tableName, data) => {
		return new Promise(function(resolve, reject) {
			getDb()
				.then((db) => {
					let result = db.collection(tableName).insert(data);
					if(result.writeConcernError === undefined){
						resolve();
					}
					else {
						reject(new Error(result.writeConcernError.errmsg));
					}
				});
		});
	},

	/**
	 * Updates selected rows. Only returns affected rows via the callback, not the Promise.
	 */
	"update": (tableName, query, update, opts) => {
		return new Promise(function(resolve, reject) {
			getDb()
				.then((db) => {
					opts = opts ? opts : {};

					db.collection(tableName).update(query, {"$set": update}, opts)
						.then((result) => {
							if(result.result.ok){
								resolve(result.result);
							}
							else {
								reject(new Error("Update could not be performed."));
							}
						});
				});
		});
	},

	"delete": (tableName, fields) => {
		return new Promise(function(resolve, reject) {
			getDb()
				.then((db) => {
					db.collection(tableName).findOneAndDelete(fields)
						.then(function(deleted){
							resolve(deleted);
						});
				});
		});
	},

	"join": (tableName1, tableName2, localfield, foreignfield) => {
		return new Promise(function(resolve, reject) {
			getDb()
				.then((db) => {
					let docs = db.collection(tableName1).aggregate([
						{
							"$lookup": {
								"from": tableName2,
								"localField": localfield,
								"foreignField": foreignfield,
								"as": tableName2
							}
						}
					]);

					resolve(docs);
				});
		});
	}
};
