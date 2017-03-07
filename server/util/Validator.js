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
const urlTableMap = {'/question': lit.POST_TABLE, '/class': lit.CLASS_TABLE, '/link': lit.LINK_TABLE, '/profile': lit.USER_TABLE};

/* validateSession(cookie)
 *
 * Validates that the current user has a valid session.
 *
 * @param cookie the usercookie containing the id of the session to be validated
 */
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
/* loginAndCreateSession(postResult)
 *
 * Logs the user in and creates a corresponding session, resolves the session info to be appended to the usercookie
 *
 * @param postResult: the information passed to the served on a POST to the login route.
 * returns: the session info if the insert is successful, rejects false
 *
 * TODO: NOTE: The implementation of this function will change when SSO access is granted
 */
exports.loginAndCreateSession = function(postResult) {
	return new Promise(function(resolve, reject) {
		if (postResult) {
			var row = new DBRow(lit.USER_TABLE);
			row.addQuery(lit.FIELD_NETID, postResult.username);
			// row.addQuery("secret", postResult.secret) // BUT WE DON'T KNOW THE PASSWORD _/(O.O)\_

			row.query().then(function() {
				if (!row.next())
					return reject(false);
					
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


/* logout(cookie)
 *
 * Logs the current user out by deleting the corresponding user session.
 *
 * @param cookie the usercookie containing the id of the session to be deleted
 * returns true if the delete is successful, false if it fails
 */
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

/* hasRole(userID, role)
 *
 * Checks if the current user has the permissions required to perform an action or view a page
 *
 * @param userID the id of user to check the roles of
 * @param role the role to check if the current user
 * returns: true if the user has the requested privilege, false if they don't
 */
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

/* validateUser(request)
 *
 * Validates that the user given in the request id exists
 *
 * @param request The express request passed to the server
 * returns true if the user exists, false if they do not
 */
exports.validateUser = function(request) {
	return new Promise(function(resolve, reject) {

		var user = new DBRow(lit.USER_TABLE);
		for (var key in request.query) {
			if (!request.query.hasOwnProperty(key))
				continue;

			if (allowedUserKeys.includes(key)) // we do not allow searches for users by several fields
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

/* validateItemExistence(request)
 *
 * Validates that the item given in the request id exists
 *
 * @param request The express request passed to the server
 * returns true if the item exists, false if it doesn't
 */
exports.validateItemExistence = function(request) {
    return new Promise(function(resolve, reject) {
        var item = new DBRow(urlTableMap[request.path]); // get the correct table name from the urlTableMap
		item.getRow(request.query.id).then(function() {
			if (item.count() == 0)
				reject();
			else
				resolve();
		}).catch(function (err) {
			log.error(err);
			reject();
		});
    });
};