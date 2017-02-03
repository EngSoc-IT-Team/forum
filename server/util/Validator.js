"use strict";

var DBRow = require('./DBRow').DBRow;
var log = require('./log');
var generator = require('./IDGenerator');
var literals = require('./StringLiterals.js');

const allowedUserKeys = [literals.fieldID, literals.fieldUsername];

exports.validateSession = function(cookie) {
	return new Promise(function(resolve, reject){
		if (cookie){ //first of all you need to have a cookie for us to expend resources
			var row = new DBRow(literals.sessionTable);
			row.getRow(cookie.sessionID).then(function(row){
				resolve(); //allow user to continue

			}, function(err) {
				resolve(); //no session found, redirect user to login

			});
		}
		else
			reject();
	});
};

// TODO: figure out how the hell the SSO works with this because this first query will have to change
exports.loginAndCreateSession = function(postResult) {
	return new Promise(function(resolve, reject) {
		if (postResult) {
			var row = new DBRow(literals.userTable);
			row.addQuery(literals.fieldNetid, postResult.username)
			// row.addQuery("secret", postResult.secret) // BUT WE DON'T KNOW THE PASSWORD _/(O.O)\_

			row.query().then(function(result) {
				if (!row.next())
					return reject(false);
					
				var date = new Date();
				var newSession = new DBRow(literals.sessionTable);
				var sessionInfo = {sessionStart: date.toISOString().slice(0, date.toISOString().indexOf('T')), 
									userID: row.getValue(literals.fieldID)};

				newSession.setValue(literals.fieldUserID, sessionInfo.userID);
				newSession.insert().then(function(res) {
					sessionInfo.sessionID = newSession.getValue(literals.fieldID);
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
};

exports.logout = function(cookie) {
	return new Promise(function(resolve, reject) {
		if(!cookie)
			reject(false);

		var row = new DBRow(literals.sessionTable);
		row.delete(cookie.sessionID).then(function(res) {
			resolve(true);

		}, function(res) {
			reject(false);

		});
	});
};

exports.hasRole = function(userID, role) {
	return new Promise(function(resolve, reject) {
		if (!userID) {
			reject(false);
			return;
		}

		var user = new DBRow(literals.userTable);
		user.getRow(userID).then(function(res) {
			if (user.count() == 0)
				reject(false);

			if(user.getValue(literals.fieldPrivilege).includes(role))
				resolve(true);
			else
				reject(false)
			
		}, function(res) {
			reject(false);
		});
	});
};

exports.validateUser = function(request) {
	return new Promise(function(resolve, reject) {

		var user = new DBRow(literals.userTable);
		for (var key in request.query) {
			if (allowedUserKeys.includes(key)) // we do not allow searches for users by netid
				user.addQuery(key, request.query[key]);
		}

		user.query().then(function(res) {
			if (user.count() == 0)
				reject(false);
			else
				resolve(true);
			
		}, function(res) {
			reject(false);
		});
	});
};
