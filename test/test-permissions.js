"use strict";

var expect = require("chai").expect;

var util = require("../util.js");
var consts = require("../consts.js");

var data = {
	'channel': '#tirean',
	'normal': {
		badges: null,
		color: '#1E90FF',
		'display-name': 'SchnuffelEU',
		emotes: null,
		mod: false,
		'room-id': '20791838',
		subscriber: false,
		turbo: false,
		'user-id': '40304856',
		'user-type': null,
		'emotes-raw': null,
		username: 'schnuffeleu',
		'message-type': 'chat'
	},
	'subscriber': {
		badges: null,
		color: '#D2691E',
		'display-name': 'joswiekiller',
		emotes: { '81274': [ '46-51' ] },
		mod: false,
		'room-id': '20791838',
		subscriber: true,
		turbo: false,
		'user-id': '26329248',
		'user-type': null,
		'emotes-raw': '81274:46-51',
		username: 'joswiekiller',
		'message-type': 'chat'
	},
	'moderator': {
		badges: 'moderator/1',
		color: '#00FF7F',
		'display-name': 'megadriving',
		emotes: null,
		mod: true,
		'room-id': '20791838',
		subscriber: false,
		turbo: false,
		'user-id': '28092790',
		'user-type': 'mod',
		'emotes-raw': null,
		username: 'megadriving',
		'message-type': 'chat'
	},
	'broadcaster': {
		badges: null,
		color: '#00FF7F',
		'display-name': 'Tirean',
		emotes: null,
		mod: false,
		'room-id': '20791838',
		subscriber: true,
		turbo: false,
		'user-id': '12345678',
		'user-type': null,
		'emotes-raw': null,
		username: 'tirean',
		'message-type': 'chat'
	}
};

describe("Access Permissions", function(){
	describe("Broadcaster", function(){
		it("should permit the broadcaster to do anything", function(){
			var broadcaster = util.checkPermissionCore(data.channel, data.broadcaster, consts.access.broadcaster);
			var moderator = util.checkPermissionCore(data.channel, data.broadcaster, consts.access.moderator);
			var subscriber = util.checkPermissionCore(data.channel, data.broadcaster, consts.access.subscriber);
			var everybody = util.checkPermissionCore(data.channel, data.broadcaster, consts.access.everybody);

			expect(broadcaster).to.equal(true);
			expect(moderator).to.equal(true);
			expect(subscriber).to.equal(true);
			expect(everybody).to.equal(true);
		});
	}),
	describe("moderator", function(){
		it("should permit the moderator to do everything except what a broadcaster is allowed to do", function(){
			var broadcaster = util.checkPermissionCore(data.channel, data.moderator, consts.access.broadcaster);
			var moderator = util.checkPermissionCore(data.channel, data.moderator, consts.access.moderator);
			var subscriber = util.checkPermissionCore(data.channel, data.moderator, consts.access.subscriber);
			var everybody = util.checkPermissionCore(data.channel, data.moderator, consts.access.everybody);

			expect(broadcaster).to.equal(false);
			expect(moderator).to.equal(true);
			expect(subscriber).to.equal(true);
			expect(everybody).to.equal(true);
		});
	}),
	describe("subscriber", function(){
		it("should allow the subscriber to do sub-only things and below ('everybody')", function(){
			var broadcaster = util.checkPermissionCore(data.channel, data.subscriber, consts.access.broadcaster);
			var moderator = util.checkPermissionCore(data.channel, data.subscriber, consts.access.moderator);
			var subscriber = util.checkPermissionCore(data.channel, data.subscriber, consts.access.subscriber);
			var everybody = util.checkPermissionCore(data.channel, data.subscriber, consts.access.everybody);

			expect(broadcaster).to.equal(false);
			expect(moderator).to.equal(false);
			expect(subscriber).to.equal(true);
			expect(everybody).to.equal(true);
		});
	}),
	describe("everybody", function(){
		it("should allow everybody to do anything, all should pass", function(){
			var broadcaster = util.checkPermissionCore(data.channel, data.broadcaster, consts.access.everybody);
			var moderator = util.checkPermissionCore(data.channel, data.moderator, consts.access.everybody);
			var subscriber = util.checkPermissionCore(data.channel, data.subscriber, consts.access.everybody);

			expect(broadcaster).to.equal(true);
			expect(moderator).to.equal(true);
			expect(subscriber).to.equal(true);
		});
	});
});
