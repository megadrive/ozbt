
var util = require("../util.js");
var db = require("../mysqlHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

var fs = require("fs");
var facts = JSON.parse(fs.readFileSync("./config/random_facts.json"));

// Get arguments.
var args = process.env.message.split(" ");

var static = {
	"help": "!fact"
};
module.exports = static;

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	var n = Math.floor(Math.random(0, facts.length) * facts.length);
	var fact = facts[n];

	util.say(process.env.channel, "Random fact! " + fact);
}
