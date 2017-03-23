
var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var f = require("util").format;
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");
var title = args.splice(1).join(" ");

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
	let now = Date.now();

	if(title !== undefined && title.length > 3){
		util.twitch_api(f("channels/%s/videos?broadcasts=true&limit=1", process.env.channel.substring(1)))
			.then(function(res){
				let vod = JSON.parse(res).videos[0];
				console.log(vod);

				if(vod.status === "recording"){
					let vod_date = new Date(vod.created_at).getTime();
					let d = new Date(now - vod_date);

					let url = f("%s?t=%dh%dm", vod.url, d.getUTCHours(), d.getUTCMinutes());

					db.insert("highlights", {
						"Channel": process.env.channel,
						"Title": title,
						"Url": url
					})
						.then(function(){
							util.say(process.env.channel, util.getDisplayName(user) + " -> Added new highlight \"" + title + "\": " + url);
						});
				}
				else {
					console.info("[ozbt] !highlight failed: " + process.env.channel.splice(1) + " not online");
				}
			});
	}
	else {
		util.say(process.env.channel, util.getDisplayName(user) + " -> Highlight failed: no title or too short.");
	}
}
