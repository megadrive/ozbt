/**
 * Allows commands to add and take away from a per-channel points system.
 *
 * TODO: Add a per-channel naming of points.
 */

var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var pointsCollection = db.collection('points');

/*
{
	'channel': 'ozbt',
	'username': 'megadriving',
	'points': 1000
}
*/

var DEFAULT_POINTS = 0;

module.exports = {
	// Get a users points, not the database user object.
	// @return int
	'get': function(channel, username){
		var rv = this._getUser(channel, username);
		return rv.points;
	},

	'add': function(channel, username, pointsToAdd){
		if( pointsToAdd > 0 ){
			var user = this._getUser(channel, username);
			user.points += pointsToAdd;

			this._saveUser(channel, user);
		}
	},

	// will not dip lower than 0
	'take': function(channel, username, pointsToTake){
		if( pointsToTake > 0 ){
			var user = this._getUser(channel, username);
			user.points -= pointsToTake;

			this._saveUser(channel, user);
		}
	},

	'_getUser': function(channel, username){
		var user = pointsCollection.where({
			'channel': channel,
			'username': username
		});

		var rv = user.items[0];

		// if a user doesn't have any points yet, create and return the object.
		if( user.items.length === 0 ){
			var newUser = {
				'channel': channel,
				'username': username,
				'points': DEFAULT_POINTS
			};
			pointsCollection.insert(newUser);

			rv = newUser;
		}

		return rv;
	},

	'_saveUser': function(channel, userObject){
		// check we have the right elements
		if( userObject.channel.length > 1 && userObject.username.length > 1 ){
			if( userObject.points < 0 ){
				userObject.points = 0;
			}

			// get existing
			var user = pointsCollection.where({
				'channel': channel,
				'username': userObject.username
			});
			if( user.items.length > 0 ){
				pointsCollection.update(user.items[0].cid, userObject);
			}
			else {
				console.error('ERROR: User doesn\'t exist when saving points.');
			}
		}
	}
};
