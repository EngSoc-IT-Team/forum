/*
* Validator.js
* Written by Michael Albinson 11/24/16
*
* Multi-tool that validates common things in the database.
 */

"use strict";

var DBRow = require('./DBRow').DBRow;
var log = require('./log');
var lit = require('./Literals.js');

const allowedUserKeys = [lit.FIELD_ID, lit.FIELD_USERNAME];

exports.validateSession = function(cookie) {
	return new Promise(function(resolve, reject){
		if (cookie){ //first of all you need to have a cookie for us to expend resources
			var row = new DBRow(lit.SESSION_TABLE);
			row.getRow(cookie.sessionID).then(function(){
				resolve(); //allow user to continue

			}, function() {
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
			var row = new DBRow(lit.USER_TABLE);
			row.addQuery(lit.FIELD_NETID, postResult.username);
			// row.addQuery("secret", postResult.secret) // BUT WE DON'T KNOW THE PASSWORD _/(O.O)\_

			row.query().then(function(result) {
				if (!row.next())
					return reject(result);
					
				var date = new Date();
				var newSession = new DBRow(lit.SESSION_TABLE);
				var sessionInfo = {sessionStart: date.toISOString().slice(0, date.toISOString().indexOf('T')), 
									userID: row.getValue(lit.FIELD_ID)};

				newSession.setValue(lit.FIELD_USER_ID, sessionInfo.userID);
				newSession.insert().then(function() {
					sessionInfo.sessionID = newSession.getValue(lit.FIELD_ID);
					resolve(sessionInfo);
				}, function(err) {
					log.error(err);
					reject(false);
				});

			}, function(err){
                log.error(err);
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

		var row = new DBRow(lit.SESSION_TABLE);
		row.delete(cookie.sessionID).then(function() {
			resolve(true);

		}, function(err) {
            log.error(err);
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

		var user = new DBRow(lit.USER_TABLE);
		user.getRow(userID).then(function() {
			if (user.count() == 0)
                return reject(false);

			if(user.getValue(lit.FIELD_PRIVILEGE).includes(role))
				resolve(true);
			else
				reject(false)
			
		}, function(res) {
			log.error(res);
			reject(false);
		});
	});
};

exports.validateUser = function(request) {
	return new Promise(function(resolve, reject) {

		var user = new DBRow(lit.USER_TABLE);
		for (var key in request.query) {
			if (!request.query.hasOwnProperty(key))
				continue;

			if (allowedUserKeys.includes(key)) // we do not allow searches for users by netid
				user.addQuery(key, request.query[key]);
		}

		user.query().then(function() {
			if (user.count() == 0)
				reject(false);
			else
				resolve(true);
			
		}, function(err) {
            log.error(err);
			reject(false);
		});
	});
};
