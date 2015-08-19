/**
 * Say this in ozbt's chat room to get it to join your channel.
 * @author Megadrive
 *
 * !join
 */

var args = process.argv.splice(2);
var locallydb = require('locallydb');
var db = new locallydb('db/_app');

var user = JSON.parse(args[1]);

// Join user's channel if said in #ozbt
// @TODO Change #ozbt to grab username from config file
if( args[0] === '#ozbt' ){
	var username = user.username;

	var onConnect = db.collection('join_on_connect');
	var exists = onConnect.where({'channel': username});
	if( exists.items.length === 0 ){
		onConnect.insert({'channel': username});
		onConnect.save();

		// send message to client to join channel
		process.send({
			'command': 'join',
			'channel': username
		});
	}
}