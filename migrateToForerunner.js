var mysql = require("mysql");
var config = require("./config/config.user.js");

var ForerunnerDB = require("forerunnerdb");
var fdb = new ForerunnerDB();
var db = fdb.db("ozbt");
db.persist.dataDir("db");

var conn = mysql.createConnection({
	"host": "localhost",
	"user": "root",
	"password": "",
	"database": "ozbt"
});

conn.query("SHOW TABLES", function(err, rows, fields){
	if(err)
		throw new Error(err);

	for(var i = 0; i < rows.length; i++){
		var tbl = rows[i]["Tables_in_ozbt"];
		
		(function importRecords(dest){
			conn.query("SELECT * FROM " + dest, function(err, data, fields){
				if(err)
					throw new Error(err);

				var destCol = db.collection(dest);
				for(var i = 0; i < data.length; i++){
					destCol.insert(data[i]);
				}
				console.info(dest + " -> " + data.length + " records");
				destCol.save(function(err, tableStats, metaStats){
					if(err)
						console.error(err);

					console.info(tableStats, metaStats);
				});
			});
		})(tbl);
	}
});
