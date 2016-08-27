var mysql = require("mysql");
var config = require("./config/config.user.js");

var ForerunnerDB = require("forerunnerdb");
var fdb = new ForerunnerDB();
var db = fdb.db("ozbt");
db.persist.dataDir("db");

var conn = mysql.createConnection({
	"host": config.mysql_addr,
	"user": config.mysql_user,
	"password": config.mysql_pass,
	"database": config.mysql_db
});

console.info("Just CTRL+C out of this script after it stops saying stuff.");

// Get all tables
conn.query("SHOW TABLES", function(err, rows, fields){
	if(err)
		throw new Error(err);

	// Loop through tables
	for(var i = 0; i < rows.length; i++){
		var tbl = rows[i]["Tables_in_" + config.mysql_db];

		(function importRecords(dest){
			conn.query("SELECT * FROM " + dest, function(err, data, fields){
				if(err)
					throw new Error(err);

				var destCol = db.collection(dest);
				for(var i = 0; i < data.length; i++){
					destCol.insert(data[i]);
				}
				destCol.save(function(err, tableStats, metaStats){
					if(err)
						console.error(err);

						console.info(dest + " -> " + data.length + " records");
				});
			});
		})(tbl);
	}
});
