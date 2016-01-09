/**
 * 
 * @author: Megadrive
 *
 * !subgoal [list|create|update|remove] [number of subs] [goal name]
 * 
 * !subgoal create 10 
 */

var args = process.argv.splice(2);
var locallydb = require('locallydb');
var db = new locallydb('db/_app');
var subgoalsDb = db.collection('subgoals');
var util = require('../util.js');

var user = JSON.parse(args[1]);

// Only mods and above can do this
if( util.checkAccess(args[0], user, args[2], 'moderator') ){
	var tArgs = args[3].split(' ');
	tArgs.splice(0, 1); // remove command

	var func = tArgs[0];
	tArgs.splice(0, 1); // remove function

	var numSubs = tArgs[0];
	tArgs.splice(0, 1); // remove numSubs

	var name = tArgs.join(' ');

	var uid = numSubs; //@TODO Needs to be figured out

	switch(func){
		case 'resubs':
			resubs(numSubs); // just use numSubs because its the first argument
			break;
		case 'create':
			create(name, numSubs);
			break;
		case 'update':
			update(uid, name, numSubs);
			break;
		case 'remove':
			remove(uid);
			break;
		case 'removeall':
			removeall(uid);
			break;
		case 'list':
		default:
			list();
	}
}

/**
 * List subs
 *
 * List of sub goals:
 * GTASA 100% Run: 3/10 subs (30%) (c0)
 */
function list(){
	var goals = subgoalsDb.where({'channel': args[0]}).items;
	if(goals.length){
		for (var i = 0; i < goals.length; i++) {
			var name = goals[i].name;
			var numSubs = goals[i].numSubs;
			var current = goals[i].current;
			var cid = goals[i].cid;
			var percent = Math.floor((parseInt(current) / parseInt(numSubs)) * 100);
			util.say(args[0], '"' + name + '": ' + current + '/' + numSubs + ' subs. (' + percent + '%) (cid: ' + cid + ')');
		};
	}
	else {
		util.say(args[0], user['display-name'] + ' -> There are no sub goals present.');
	}
}

/**
 * Creates a sub goal
 *
 * @method     create
 * @param      {string}  name     Name of the sub goal
 * @param      {integer}  numSubs  Number of subs for goal
 */
function create(name, numSubs){
	if(name == undefined || numSubs == undefined){

	}
	else {
		var cid = subgoalsDb.insert({
			'channel': args[0],
			'name': name,
			'numSubs': numSubs,
			'current': 0
		});

		util.say(args[0], user['display-name'] + ' -> Sub goal "' + name + '" with a goal of ' + numSubs + ' was created. cid: ' + cid);
	}
}

/**
 * Updates an existing sub goal.
 *
 * @method     update
 * @param      {integer}  uid      Unique id for the sub goal. Get it via !subgoal list
 * @param      {string}  name     New name of the sub goal
 * @param      {integer}  numSubs  New number of subs for goal
 */
function update(uid, name, numSubs){

}

/**
 * remove a sub goal
 * 
 * @method     remove
 * @param      {integer}  uid      Unique id for the sub goal. Get it via !subgoal list 
 */
function remove(uid){
	var goal = subgoalsDb.get(parseInt(uid));
	subgoalsDb.remove(parseInt(uid));
	util.say(args[0], user['display-name'] + ' -> "' + goal.name + '" has been removed.');
}

/**
 * Remove all sub goals and start fresh.
 *
 * @method     removeall
 */
function removeall(check){
	if(check != args[0]){
		util.say(args[0], user['display-name'] + ' -> Are you sure you wish to remove all sub goals? If so, use !subgoal removeall ' + args[0]);
	}
	else{
		var goals = subgoalsDb.where({'channel': args[0]}).items;
		for (var i = 0; i < goals.length; i++) {
			subgoalsDb.remove(goals[i].cid);
		};
		util.say(args[0], user['display-name'] + ' -> Removed all sub goals for ' + args[0] + ', ' + goals.length + ' in total.');
	}
}

/**
 * Include resubs?
 *
 * @method     resub
 * @param      {string}  onoff   on/off
 */
function resubs(onoff){
	if(onoff){
		onoff = onoff.toLowerCase();

		var channel_settings = db.collection('channel_settings');
		var settings = channel_settings.where({'channel': args[0]}).items[0]; // undefined if not exist

		if(onoff == 'on' || onoff == 'off'){
			if(settings != undefined){
				channel_settings.update(settings.cid, {'subgoal_resubs': onoff});
				util.say(args[0], user['display-name'] + ' -> Your sub goals will now ' + (onoff == 'off' ? 'not' : '') + ' take resubs into account.');
			}
		}
		else {
			util.say(args[0], user['display-name'] + ' -> Syntax: !subgoal resubs [on|off]');
		}
	}
	else{
		util.say(args[0], user['display-name'] + ' -> Syntax: !subgoal resubs [on|off]');
	}
}
