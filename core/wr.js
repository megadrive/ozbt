"use strict";

var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

/**
 * !wr
 */

var _wr = {
	"help": "!wr"
};
module.exports = _wr;

if( util.checkPermissionCore(process.env.channel, user, consts.access.subscriber) ){

}
