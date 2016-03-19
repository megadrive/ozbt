"use strict";

var fs = require("fs");

module.exports = {
	"info": (arg) => {
		console.log(arg);

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

		fs.appendFile("logs/warn.txt", arg + "\n", (err) => {
			if(err)
				console.error(err);
		});
	},

	"error": (arg) => {
		console.error(arg);

		fs.appendFile("logs/error.txt", arg + "\n", (err) => {
			if(err)
				console.error(err);
		});
	}
}
