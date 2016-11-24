"use strict";

var dbr = require('./DBRow');
var log = require('./log');
var generator = require('./IDGenerator');

exports.validateSession = function(cookie) {
	return new Promise(function(resolve, reject){
		if (cookie){ //first of all you need to have a cookie for us to expend resources
			var row = new dbr.DBRow("session");
			row.getRow(cookie.sessionID).then(function(row){
				resolve(); //allow user to continue

			}, function(err) {
				resolve(); //no session found, redirect user to login

			});
		}
		else
			reject();
	})
}

//TODO: check if previous session exists and use this session instead
// also TODO: figure out how the hell the SSL works with this because this first query will have to change
exports.loginAndCreateSession = function(postResult) {
	return new Promise(function(resolve, reject) {
		if (postResult) {
			var row = new dbr.DBRow("user");
			row.addQuery("netid", postResult.username)
			// row.addQuery("secret", postResult.secret) // BUT WE DON'T KNOW THE PASSWORD _/(O.O)\_

			row.query().then(function(result) {
				if (row.count() == 0){
					reject(false);
					return;
				}

				row.next()
				var newSession = new dbr.DBRow("session");
				var sessionInfo = {sessionStart: "2016-11-24", 
									userID: row.getValue("id"), 
									sessionID: generator.generate()};

				newSession.setValue('sessionStart', sessionInfo.sessionStart);
				newSession.setValue('userID', sessionInfo.userID);
				newSession.setValue('id', sessionInfo.sessionID);
				newSession.insert().then(function(res) {
					resolve(sessionInfo);
				}, function(res) {
					reject(false);
				});

			}, function(err){
				reject(false); // no matching user found - indicate failure
			});
		}
		else
			reject(false);
	})
}

exports.logout = function(cookie) {
	return new Promise(function(resolve, reject) {
		if(!cookie)
			reject(false);

		var row = new dbr.DBRow('session');
		row.delete(cookie.sessionID).then(function(res) {
			resolve(true);

		}, function(res) {
			reject(false);

		});
	});
}

