/**
 * Rock, Paper, Shotgun
 *
 * Users write !rps [rock,scissors,paper] and timed out if they lose and a +1 points if they win.
 *
 * !rps [rock|scissors|paper]
 * !rps [r|s|p]
 */

// allows for better random values
var Random = require('random-js');
var random = new Random(Random.engines.mt19937().autoSeed());

var args = process.argv.splice(2);
var user = JSON.parse(args[1]);
var util = require('../util.js');

var points = require('../points.js');

var POINTS_ON_WIN = 10;
var POINTS_ON_LOSE = 10;
var guessText = args[3].split(' ')[1];

var eOptions = {
	'rock': 0,
	'scissors': 1,
	'paper': 2,
	'_exit_': -1
};

// Convert shorthand guesses to enumeration
switch(guessText){
	case 'r':
	case 'rock':
		guess = eOptions.rock;
		break;
	case 's':
	case 'scissors':
		guess = eOptions.scissors;
		break;
	case 'p':
	case 'paper':
		guess = eOptions.paper;
		break;
	default:
		guess = eOptions._exit_;
}

// error, guess invalid
if( guess < 0 ){
	process.exit(0);
}

// lazy
var min = 0,
	max = 2;
var myGuess = random.integer(min, max);

var eOutcomes = {
	'lose': 0,
	'win': 1,
	'draw': 2
}

function guessToText(guess){
	var rv = '';
	if( guess === eOptions.rock ){
		rv = 'rock';
	}
	else if( guess === eOptions.paper ){
		rv = 'paper';
	}
	else if( guess === eOptions.scissors ){
		rv = 'scissors';
	}
	return rv;
}

var outcome = eOutcomes.win; // bias Kappa

// if we're the same draw
if( guess === myGuess ){
	outcome = eOutcomes.draw;
}
// user wins: p>r
else if( guess === eOptions.paper && myGuess === eOptions.rock ){
	outcome = eOutcomes.lose;
}
// we win: p<s
else if( guess === eOptions.paper && myGuess === eOptions.scissors) {
	outcome = eOutcomes.win;
}
// we win r<p
else if( guess === eOptions.rock && myGuess === eOptions.paper ){
	outcome = eOutcomes.win;
}
// we lose: r>s
else if( guess === eOptions.rock && myGuess === eOptions.scissors ){
	outcome = eOutcomes.lose;
}
// user loses: s<r
else if( guess === eOptions.scissors && myGuess === eOptions.rock ){
	outcome = eOutcomes.win;
}
// user wins: s>p
else if( guess === eOptions.scissors && myGuess === eOptions.paper ){
	outcome = eOutcomes.lose;
}
else {
	// uh, idk? output to chat so people can tell me its broken
	util.say(args[0], '!rps issue, pls pm megadriving');
}

var msg = '';
var username = user['display-name'] != null ? user['display-name'] : user.username;
if( outcome === eOutcomes.lose ){
	msg = username + ' wins! SeemsGood (My move was ' + guessToText(myGuess) + '.)';

	//@TODO Add points
	points.add(args[0], user.username, POINTS_ON_WIN);
}
else if( outcome === eOutcomes.win ){
	msg = username + ' loses! NotLikeThis What a dummy! (Rekt by ' + guessToText(myGuess) + '.)';

	//@TODO Remove points
	points.take(args[0], user.username, POINTS_ON_LOSE);

	//30 second timeout
	process.send({
		'command': 'to',
		'channel': args[0],
		'username': user,
		'time': 30, // in seconds
		'toMsg': ''
	});
}
else {
	// Draw
	msg = 'Bummer. We drew, ' + user['display-name'] + '! Better luck next time.';
}

if( msg.length > 0 ){
	util.say(args[0], msg);
}
