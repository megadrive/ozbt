"use strict";

module.exports = {
	// LokiJS database
	"lokidb": "ozbt",

	"core_command_prefix": "!",

	"true": 1,
	"false": 0,
	"access": {
		"everybody": 5,
		"regular": 4,
		"subscriber": 3,
		"moderator": 2,
		"supermoderator": 1,
		"broadcaster": 0
	},
	"greeting": {
		"sub": 0,
		"resub": 1,
		"cheer": 2
	},
	"giveaways": {
		"type": {
			"active": "active",
			"keyword": "keyword"
		},
		"status": {
			"not_started": -1,
			"started": 0,
			"ended": 1
		}
	},
	"max_time_command_s": 15
};
