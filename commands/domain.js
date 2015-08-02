/**
 * Sets options on banning or timing out users who link punishable domains.
 * @author Megadrive
 *
 * !domain [add|remove] [domain] [consequence] [timeoutTimeInSeconds]
 * !domain add google.com ban
 * !domain add twitch.tv timeout 10
 * !domain remove twitch.tv
 */

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);
var util = require('../util.js');

var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var bannedDomainsCollection = db.collection('banned_domains');

/*
	{
		channel
		domain
		consequence: [ban|timeout]
		timeoutTime
		added_by
	}
*/

if( util.checkAccess(args[0], user, 'moderator') ){
	var spl = args[2].toLowerCase().split(' ');

	// for sanity
	var action = spl[1];
	var domain = spl[2];
	var consequence = spl[3];
	var timeoutTime = spl[4]; // only if consequence == 'timeout' or 'to'

	if( action === 'add' ){
		addDomain(domain, consequence, timeoutTime);
	}

	if( action === 'remove' ){
		removeDomain(domain);
	}
}

function addDomain(domain, consequence, timeoutTime){
	var isTimeout = consequence === 'timeout' || consequence === 'to';
	var domaindb = bannedDomainsCollection.where({
		'channel': args[0],
		'domain': domain
	});

	if( domaindb.items.length === 0 ){
		bannedDomainsCollection.insert({
			'channel': args[0],
			'domain': domain,
			'consequence': consequence,
			'timeoutTime': timeoutTime ? timeoutTime : 0,
			'added_by': user.username
		});
		bannedDomainsCollection.save();
	}

	util.say(args[0], 'I will now ' + consequence + ' anyone who posts a link from ' + domain + '.');
}

function removeDomain(domain){
	var domaindb = bannedDomainsCollection.where({
		'channel': args[0],
		'domain': domain
	});

	if( domaindb.items.length === 1 ){
		bannedDomainsCollection.remove(domaindb.items[0].cid);
		bannedDomainsCollection.save();
	}

	util.say(args[0], domain + ' removed from list of punishable domains.');
}
