/**
 * Creates a simple strawpoll.
 * @author Megadrive
 *
 * !strawpoll [title],[item1],[item2],[item3],[item4]
 */

var args = process.argv.splice(2);
var request = require('request');
var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var util = require('../util.js');
var strawpollDb = db.collection('strawpoll_ids');

var user = JSON.parse(args[1]);

var strawpoll_api = 'https://strawpoll.me/api/v2/polls';

var poll_args = (((args[3].split(' ')).splice(1)).join(' ')).split(','); //im so sorry.
var poll_title = poll_args[0];
var poll_answers = poll_args.splice(1);

// only show if the broadcaster
if( util.checkAccess(args[0], user, args[2], 'moderator') ){
	var strawpoll_id = strawpollDb.where({'channel': args[0]})[0];

	//@TODO this check needs to be improved
	// results?
	if( poll_args.length == 1 && poll_args[0].toLowerCase() == 'results' ){
		request(strawpoll_api + '/' + strawpoll_id,
			function(err, response, body){
				if( err === null ){
					var j = JSON.parse(body);

					var title = j.title;
					var opts = j.options;
					var votes = j.votes;

					var output = 'Results for "' + title + '" -- ';
					for(var i = 0; i < opts.lenth; i++){
						output += opts[i] + ': ' + votes[i];
					}

					util.say(args[0], output);
				}
			}
		);
	}
	// If we have a list of arguments, create the poll.
	else{
		if( poll_args.length >= 3){
			request.post(
				{
					url: strawpoll_api,
					form: {
						options: poll_answers,
						title: poll_title
					}
				},
				function(err, response, body){
					if( err === null ){
						strawpoll_id = JSON.parse(body).id;

						util.say(args[0], 'Vote here: http://strawpoll.me/' + strawpoll_id);

						// Add id to db so we can call it back when using `!strawpoll last`
						updateInDatabase(args[0], strawpoll_id);
					}
				}
			);
		}
	}
}

//@TODO Add credit for this function. It was from a StackOverflow comment iirc.
function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort(function(a, b) { return b.value - a.value; });
    //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
    return arr; // returns array
}

/**
 * Updates the strawpoll_id in the database so we can call it later.
 *
 * @method     updateInDatabase
 * @param      {string}  channel  channel name
 * @param      {integer}  id   strawpoll id
 * @return     {id} the strawpoll id. why not
 */
function updateInDatabase(channel, id){
	// get current if exists
	var current = strawpollDb.where({'channel': channel}).items;
	if(current.length){
		// Update
		strawpollDb.update(current[0].cid, {'id': id});
	}
	else {
		// Create new
		strawpollDb.insert({'channel': channel, 'id': id});
	}

	return id;
}

function getLast(channel){
	var current = strawpollDb.where({'channel': channel}).items;

	if(current.length){
		util.say(args[0], 'Vote here: http://strawpoll.me/' + current[0].id);
	}
	else{
		util.say(args[0], 'No last strawpoll available!');
	}
}
