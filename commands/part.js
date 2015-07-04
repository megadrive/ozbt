/**
 * Gets ozbt to leave your channel if said in ozbt's chat or your own and you have said it.
 * @author Megadrive
 *
 * !part
 */

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);

var locallydb = require('locallydb');
var db = new locallydb('db/_app');

// Join user's channel if said in #ozbt or in the users channel and they are the broadcaster
if( args[0] === '#ozbt' ||
   ( args[0] === '#' + user.username && user.special.indexOf('broadcaster') >= 0 ) ){
	var onConnect = db.collection('onConnect');
	var exists = onConnect.where({'channel': user.username});
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
