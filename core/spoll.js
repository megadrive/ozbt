
console.warn("!spoll is dead atm, strawpoll having issues. 10-04-2017");
process.exit(0);

process.env.user = '{}';

var util = require("../util.js");
var db = require("../dbHelpers.js");
var got = require("got");
var user = JSON.parse(process.env.user);
var consts = require("../consts.js");
var FormData = require("form-data");
var form = new FormData();

var api = "https://strawpoll.com/new";

process.env.channel = "#tirean";
process.env.message = "!spoll Videogames? | Hideo | Penis | Vagina?";

let message = process.env.message.split(" ").slice(1);
let title = message[0];
let options = message.slice(1).filter(function(el) { return el !== "|"; });

function createPoll(title, options){
	return new Promise(function(resolve, reject){
		form.append("newq", title);
		form.append("priv", "on");

		console.info(title, options);

		for(let o = 0; o < options.length; o++){
			form.append("a" + o, options[o]);
		}

		got.post(api, {"body": form})
			.then(function(response){
				console.info(response.body);
			})
			.catch(err => console.error(err));

		resolve({});
	});
}

function getResult(id){
	return new Promise(function(resolve, reject){
		resolve({});
	});
}

if( util.checkPermissionCore(process.env.channel, user, consts.access.everybody) ){
	if(message.indexOf("results") >= 0){
		getResult(id)
			.then(function(result){

			});
	}
	else {
		createPoll(title, options)
			.then(function(result){

			});
	}
}
