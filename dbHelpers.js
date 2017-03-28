"use strict";

var config = require("./config/config.user.js");
var MongoClient = require("mongodb").MongoClient;
var db = undefined;
var assert = require("assert");
var f = require("util").format;

/**
 * Gets the database, creating a connection for use.
 */
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
	 * Find many documents, filtered by fields.
	 * @param {string} tableName
	 * @param {object} fields
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

	/**
	 * Find a single document, filtered by fields.
	 * @param {string} tableName
	 * @param {object} fields
	 */
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
	 * @param {string} tableName
	 * @param {object} data Data to insert
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
	 * Updates a document.
	 * @param {string} tableName
	 * @param {object} query Query fields. Similar to "WHERE" in SQL.
	 * @param {object} update Fields to update
	 * @param {object} opts MongoDB fields. If left unset, will only update.
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

	/**
	 * Deletes a single document, unless isMulti is true.
	 * @param {string} tableName
	 * @param {object} fields
	 * @param {boolean} isMulti Deletes multiple documents if true.
	 */
	"delete": (tableName, fields, isMulti) => {
		return new Promise(function(resolve, reject) {
			getDb()
				.then((db) => {
					function resolveFunc(deleted){
						resolve(deleted);
					}

					if(isMulti){
						db.collection(tableName).deleteMany(fields)
							.then(resolveFunc);
					}
					else {
						db.collection(tableName).findOneAndDelete(fields)
							.then(resolveFunc);
					}
				});
		});
	},

	/**
	 * Joins two collections together to find documents.
	 * @param {string} tableName1
	 * @param {string} tableName2
	 * @param {string} localfield
	 * @param {string} foreignfield
	 */
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
