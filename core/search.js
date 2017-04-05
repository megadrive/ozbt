"use strict"

var util = require("../util.js");
var db = require("../dbHelpers.js");
var gapi = require("../config/googleapi.js");
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var user = JSON.parse(process.env.user);
var fs = require("fs");
var readline = require("readline");
var fuzzy = require("fuzzy");

// Get arguments.
let args = process.env.message.split(" ");

let query = args.splice(1).join(" ");
let ssheetid = "1GHSGtC2NkudIH3a4UFreE2BImo2K2FBBM6GyQvZmM1E";
let range = ["A13", "B1714"];

authorize(gapi)
	.then(function(token){
		getGameNames(token)
			.then(function(games){
				console.info("Number of games:", games.length);
				var results = fuzzy.filter(query, games, {"extract": function(el){ return el[0]; } });
				var matches = results.map(function(el){
					return el.string;
				});

				let top3 = matches.slice(0, 3);
				let say = `Best ${top3.length} matches: ` + top3.join(", ") + ". ";
				if(matches.length > 3) say += matches.length + " total matches.";
				util.say(process.env.channel, util.getDisplayName(user) + ' -> ' + say);
			});
	});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 */
function authorize(credentials) {
	return new Promise(function(resolve, reject){
		var clientSecret = credentials.installed.client_secret;
		var clientId = credentials.installed.client_id;
		var redirectUrl = credentials.installed.redirect_uris[0];
		var auth = new googleAuth();
		var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

		db.find("api_credentials", {"Type": "GoogleSheets"})
			.then(function(curr){
				if(curr === null){
					// No current API token
					getNewToken(oauth2Client)
						.then(function(token){
							console.info("token:", token);
						});
				}
				else {
					// Active token, use this.
					oauth2Client.credentials = curr;
					resolve(oauth2Client);
				}
			});
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 */
function getNewToken(oauth2Client) {
	return new Promise(function(resolve, reject){
		var authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES
		});
		console.log('Authorize this app by visiting this url: ', authUrl);
		var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		rl.question('Enter the code from that page here: ', function(code) {
			rl.close();
			oauth2Client.getToken(code, function(err, token) {
			if (err) {
				console.log('Error while trying to retrieve access token', err);
				return;
			}
			oauth2Client.credentials = token;
			token["Type"] = "GoogleSheets";
			db.insert("api_credentials", token)
				.then(function(){
					resolve(oauth2Client);
				});
			});
		});
	});
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function getGameNames(auth) {
	return new Promise(function(resolve, reject){
		var sheets = google.sheets('v4');
		sheets.spreadsheets.values.get({
			auth: auth,
			spreadsheetId: ssheetid,
			range: 'Games list!' + range.join(":"),
		}, function(err, response) {
			if (err) {
				console.log('The API returned an error: ' + err);
				return;
			}
			var rows = response.values;
			if (rows.length == 0) {
				reject(new Error('No data found.'));
			} else {
				resolve(rows);
			}
		});
	});
}
