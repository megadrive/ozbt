"use strict";

var onChat = ("chat", (channel, user, message, self) => {
	if(self)
		return; // just in case user created a brand new account for the bot

  var rsexyladys = /https?:\/\/sexyladys\s\.(info|net|com|xxx)/gi;
  if(message.test(rsexyladys)){
    _client.ban(channel, user.username, "sexy ladys is nearly always a bot.")
  }
});

module.exports = {
	"register": (client) => {
		_client = client;
    _client.on("chat", onChat);
	}
};
