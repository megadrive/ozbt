
var args = process.argv.splice(2);
var locallydb = require('locallydb');
var db = new locallydb('db/_app');

var data = JSON.parse(args[1]);

// Join user's channel if said in #ozbt
if( args[0] === '#ozbt' ){
	var username = data.username;

	var onConnect = db.collection('onConnect');
	var exists = onConnect.where("'@channel == " + username + "'");
	if( exists !== undefined && exists.items.length === 1 ){
		var cid = onConnect.items[0].cid;
		onConnect.remove(cid);
		onConnect.save();

		// send message to client to join channel
		process.send({
			'command': 'part',
			'channel': username
		});
	}
}