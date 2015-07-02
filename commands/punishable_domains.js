/**
 * Output punishable domains
 */

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);
var util = require('../util.js');

var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var bannedDomainsCollection = db.collection('banned_domains');

if( util.isMod(args[0], user.username) ){
	var banned_domains = bannedDomainsCollection.where({'channel': args[0]});

	var message = 'Punishable domains in this channel are: ';

	var domainTexts = [];
	for (var i = 0; i < banned_domains.items.length; i++) {
		domainTexts.push(banned_domains.items[i].domain + ' (' + banned_domains.items[i].consequence + ')');
	};

	message += domainTexts.join(', ') + '.';

	process.send({
		'command': 'say',
		'channel': args[0],
		'message': message
	});
}
