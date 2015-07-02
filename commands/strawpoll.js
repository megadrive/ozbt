/**
 * Creates a simple strawpoll.
 *
 * !strawpoll [title],[item1],[item2],[item3],[item4]
 */

var args = process.argv.splice(2);
var request = require('request');
var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var commandsDb = db.collection('custom_commands');
var util = require('../util.js');

var user = JSON.parse(args[1]);

var strawpoll_api = 'https://strawpoll.me/api/v2/polls';

var poll_args = (((args[2].split(' ')).splice(1)).join(' ')).split(','); //im so sorry.
var poll_title = poll_args[0];
var poll_answers = poll_args.splice(1);

// only show if the broadcaster
if( util.isMod(args[0], user.username) ){
	var strawpoll_id = 0;

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
