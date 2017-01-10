"use strict";

var DBRow = require('./DBRow').DBRow;
var log = require('./log');
var generator = require('./IDGenerator');

exports.validateSession = function(cookie) {
	return new Promise(function(resolve, reject){
		if (cookie){ //first of all you need to have a cookie for us to expend resources
			var row = new DBRow("session");
			row.getRow(cookie.sessionID).then(function(row){
				resolve(); //allow user to continue

			}, function(err) {
				resolve(); //no session found, redirect user to login

			});
		}
		else
			reject();
	});
}

//TODO: check if previous session exists and use this session instead
// also TODO: figure out how the hell the SSL works with this because this first query will have to change
exports.loginAndCreateSession = function(postResult) {
	return new Promise(function(resolve, reject) {
		if (postResult) {
			var row = new DBRow("user");
			row.addQuery("netid", postResult.username)
			// row.addQuery("secret", postResult.secret) // BUT WE DON'T KNOW THE PASSWORD _/(O.O)\_

			row.query().then(function(result) {
				if (row.count() == 0){
					reject(false);
					return;
				}
				var date = new Date();

				row.next()
				var newSession = new DBRow("session");
				var sessionInfo = {sessionStart: date.toISOString().slice(0, date.toISOString().indexOf('T')), 
									userID: row.getValue("id")};

				newSession.setValue('sessionStart', sessionInfo.sessionStart);
				newSession.setValue('userID', sessionInfo.userID);
				newSession.insert().then(function(res) {
					sessionInfo.sessionID = newSession.getValue('id')
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

		var row = new DBRow('session');
		row.delete(cookie.sessionID).then(function(res) {
			resolve(true);

		}, function(res) {
			reject(false);

		});
	});
}

exports.hasRole = function(userID, role) {
	return new Promise(function(resolve, reject) {
		if (!userID) {
			reject(false);
			return;
		}

		var user = new DBRow('user');
		user.getRow(userID).then(function(res) {
			if (user.count() == 0)
				reject(false);

			if(user.getValue('privilege').includes(role))
				resolve(true);
			else
				reject(false)
			
		}, function(res) {
			reject(false);
		});
	});
}

