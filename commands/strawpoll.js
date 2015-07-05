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

var user = JSON.parse(args[1]);

var strawpoll_api = 'https://strawpoll.me/api/v2/polls';

var poll_args = (((args[2].split(' ')).splice(1)).join(' ')).split(','); //im so sorry.
var poll_title = poll_args[0];
var poll_answers = poll_args.splice(1);

// only show if the broadcaster
if( util.checkAccess(args[0], user, 'moderator') ){
	var strawpoll_id = 0;

	// if there is one argument and it's an integer, its an id for results.
	//TODO: this check needs to be improved
	if( !isNaN(poll_title) ){
		request(strawpoll_api + '/' + poll_title, function(err, response, body){
				if( err === null ){
					var results = JSON.parse(body);

					var txt = 'Results for "' + results.title + '" -- ';

					// i am sure there is a better way to do this
					var tempObj = '{';
					for(var i = 0; i < results.options.length; ++i){
						tempObj += '"' + results.options[i] + '": ' + results.votes[i] + ',';
					}
					tempObj = tempObj.substr(0,tempObj.length - 1);
					tempObj += '}';
					// end dumb code
					var votes = JSON.parse(tempObj);
					votes = sortObject(votes);

					for (var i = 0; i < votes.length; i++) {
						txt += votes[i].key + ': ' + votes[i].value + ' ';
					};

					process.send({
						'command': 'say',
						'channel': args[0],
						'message': txt
					});
				}
			}
		);
	}
	// If we have a list of arguments, create the poll.
	else{
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

					process.send({
						'command': 'say',
						'channel': args[0],
						'message': 'Strawpoll here: http://strawpoll.me/' + strawpoll_id
					});
				}
			}
		);
	}
}

//TODO: Add credit for this function. It was from a StackOverflow comment iirc.
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
