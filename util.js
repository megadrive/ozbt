
var locallydb = require('locallydb');
var db = new locallydb('db/_app');

module.exports = {
	'isMod': function(channel, username){
		var modCollection = db.collection('channel_moderators');
		var channelMods = modCollection.where({
			'channel': channel,
			'username': username
		});

		return (channelMods.items[0].username === username);
	}
}
