"use strict";

var fs = require("fs");

var isDir = function(){
	try{
		fs.mkdirSync("logs/");
	}
	catch(ex){
		if(ex.code !== "EEXIST"){
			console.warn("Could not create logs/ folder, NO PERMANENT LOGGING WILL OCCUR.");
			console.warn(ex);
		}
	}

	try{
		fs.mkdirSync("logs/chat/");
	}
	catch(ex){
		if(ex.code !== "EEXIST"){
			console.warn("Could not create logs/chat/ folder, NO PERMANENT LOGGING WILL OCCUR.");
			console.warn(ex);
		}
	}
};

module.exports = {
	"info": (arg) => {
		console.log(arg);

		isDir();

		var rchattext = /\[(#.{1,25})\] (<.{1,25}>.+)/g;
		var exec = rchattext.exec(arg);

		// If it's channel related.
		if(exec){
			fs.appendFile("logs/chat/" + exec[1] + ".txt", "[" + new Date().toLocaleString() + "] " + exec[2] + "\n", (err) => {
				if(err)
					console.error(err);
			});
		}
		else {
			fs.appendFile("logs/info.txt", "[" + new Date().toLocaleString() + "] " + arg + "\n", (err) => {
				if(err)
					console.error(err);
			});
		}
	},

	"warn": (arg) => {
		console.warn(arg);

		isDir();
		fs.appendFile("logs/warn.txt", arg + "\n", (err) => {
			if(err)
				console.error(err);
		});
	},

	"error": (arg) => {
		console.error(arg);

		isDir();
		fs.appendFile("logs/error.txt", arg + "\n", (err) => {
			if(err)
				console.error(err);
		});
	}
}
