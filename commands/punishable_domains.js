/**
 * Output punishable domains into chat.
 * @author Megadrive
 *
 * !punishable_domains
 */

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);
var util = require('../util.js');

var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var bannedDomainsCollection = db.collection('banned_domains');

if( util.checkAccess(args[0], user, args[2], 'moderator') ){
	var banned_domains = bannedDomainsCollection.where({'channel': args[0]});

	var message = 'Punishable domains in this channel are: ';

	var domainTexts = [];
	for (var i = 0; i < banned_domains.items.length; i++) {
		domainTexts.push(banned_domains.items[i].domain + ' (' + banned_domains.items[i].consequence + ')');
	};

	message += domainTexts.join(', ') + '.';

	util.say(args[0], message);
}
