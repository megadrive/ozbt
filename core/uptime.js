"use strict";

var util = require("../util.js");
var user = JSON.parse(process.env.user);
var consts = require("../consts.js");

if( util.checkPermissionCore(process.env.channel, user, consts.access.everybody) ){
	util.twitch_api("streams/" + process.env.channel.substring(1))
		.then(function(j){
			if(j.stream === null){
				util.say(process.env.channel, util.getDisplayName(user) + " -> Stream is offline.");
			}
			else {
				var start = new Date(j.stream.created_at).getTime();
				var now = new Date().getTime();
				var diff = getInterval(now, start);

				util.say(process.env.channel, util.getDisplayName(user) + " -> Streaming for " + diff.hours + " hours, " + diff.minutes + " minutes, " + diff.seconds + " seconds.");
			}
		});
}

// From: http://snipplr.com/view/58379/ on 2016-07-04. Credit to wizard04
function getInterval(dateA, dateB){
	dateA = new Date(dateA);
	dateB = new Date(dateB);
	if(isNaN(dateA.valueOf()+dateB.valueOf())) return null;	//invalid date(s)

	if(dateA.valueOf() > dateB.valueOf())
	{
		var tmp = dateA;
		dateA = dateB;
		dateB = tmp;
	}

	var parts = {};

	//years
	parts.years = dateB.getFullYear() - dateA.getFullYear();

	//months
	dateA.setFullYear(dateB.getFullYear());
	parts.months = dateB.getMonth() - dateA.getMonth();

	//days
	dateA.setMonth(dateB.getMonth());
	if(dateA.valueOf() > dateB.valueOf())
	{
		dateA.setMonth(dateA.getMonth()-1);
		parts.months--;
	}
	parts.days = Math.floor((dateB.valueOf()-dateA.valueOf())/86400000);

	//time
	parts.hours = dateB.getHours() - dateA.getHours();
	parts.minutes = dateB.getMinutes() - dateA.getMinutes();
	parts.seconds = dateB.getSeconds() - dateA.getSeconds();
	parts.milliseconds = dateB.getMilliseconds() - dateA.getMilliseconds();

	//weeks
	parts.weeks = Math.floor(parts.days/7);
	parts.days = parts.days%7;

	//adjust for negative values
	if(parts.milliseconds < 0){ parts.milliseconds = 1000+parts.milliseconds; parts.seconds--; }
	if(parts.seconds < 0){ parts.seconds = 60+parts.seconds; parts.minutes--; }
	if(parts.minutes < 0){ parts.minutes = 60+parts.minutes; parts.hours--; }
	if(parts.hours < 0) parts.hours = 24+parts.hours;
	if(parts.months < 0){ parts.months = 12+parts.months; parts.years--; }

	return parts;
}
