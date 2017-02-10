/*
** requestResponder.js
** Created by Michael Albinson 1/15/17
*/

"use strict";

var DBRow = require('./DBRow').DBRow;
var lit = require('./Literals.js');
var Aggregator = require('./aggregator');

/*
** requestResponder is a functional utility interface to process requests that require results from the database
** Essentially it is used to call down to other processes to remove logic from the expressServer file
*/


/** parseRequest(request)
 **
 **
 * @param request: the express request
 * @return {Promise}: Resolves the information necessary to fill in the page if successful,
 * rejects if there is an invalid request type or there is an error retrieving the information
 */
exports.parseRequest = function(request) {
	return new Promise(function(resolve, reject) {
		switch (request.body.requested) {
			case (lit.PROFILE):
				profileRequest(request).then(function(info) {
					resolve(info);
				}, function(err) {
					reject(err);
				});
				break;
			case ("list"):
				listRequest(request).then(function(info) {
					resolve(info);
				}, function(err) {
					reject(err);
				});
				break;
			default:
				reject("Invalid request type");
				break;
		}
	})	
};

/** Individual Request Type Processing Functions **/

/* profileRequest(request)
** Handles requests from the profile page
**
** request: the express request
** return: the information necessary to populate the profile page
*/

function profileRequest(request) {
	var info = {
		profile: {},
		tags: [],
		items: {
			subscribed: [],
			saved: [],
			contributions: []
	}};
    var user = new DBRow(lit.USER_TABLE);

	return new Promise(function(resolve, reject) {
		if (request.body.self) {
			var userID = request.signedCookies.usercookie.userID;
			user.getRow(userID).then(function() {
				if (user.count() < 1)
					reject("No user found");
				else {
					info.profile.username = user.getValue(lit.FIELD_USERNAME);
					info.profile.upvotes = user.getValue(lit.FIELD_TOTAL_UPVOTES);
					info.profile.downvotes = user.getValue(lit.FIELD_TOTAL_DOWNVOTES);
					info.profile.dateJoined = user.getValue(lit.FIELD_DATE_JOINED);
                    info.profile.id = user.getValue(lit.FIELD_ID);
					Aggregator.aggregateProfileInfo(user, info).then(function() {
						getSaved(user, info).then(function() { // TODO: for each of these need to check if current user is subscribed, saved etc
							getSubscribed(user, info).then(function() {
								getContributions(user, info).then(function() {
									resolve(info);
								}, function(err) {
                                    resolve(info, err);
								});
							}, function(err) {
                                resolve(info, err);
							});
							
						}, function(err) {
							resolve(info, err);
						});
					}, function(err) {
                        resolve(info, err);
					});
				}
			});
		}
		else {
			for (var key in request.query)
				user.addQuery(key, request.query[key]);

			user.query().then(function() {
				if (!user.next())
					reject("No user found");
				else {
                    info.profile.username = user.getValue(lit.FIELD_USERNAME);
                    info.profile.upvotes = user.getValue(lit.FIELD_TOTAL_UPVOTES);
                    info.profile.downvotes = user.getValue(lit.FIELD_TOTAL_DOWNVOTES);
                    info.profile.dateJoined = user.getValue(lit.FIELD_DATE_JOINED);

					Aggregator.aggregateProfileInfo(user, info).then(function() {
						getContributions(user, info).then(function() {
							resolve(info);
						}, function(err) {
                            resolve(info, err);
						});
					}, function(err) {
                        resolve(info, err); // return what we have at minimum
					});
				}
			});
		}
	});
}

/** listRequest(request)
 * Handles requests from the list page
 *
 * @param request: the express request
 * @returns {Promise}
 */

function listRequest(request) {
	var info = [];
	return new Promise(function(resolve, reject) {
		request = "";
		resolve(info);
		reject();
	});
}


/** recursiveGet(resolve, reject, rowsToGet, action, actionArgs)
 * NOTE: the action function MUST be synchronous
 *
 * @param resolve: the resolve function of the calling function's promise
 * @param reject: the reject function of the calling function's promise
 * @param rowsToGet: the DBRow object containing ids of the rows to get
 * @param action: the function to execute after each row is retrieved
 * @param actionArgs: the function arguments, if any, that need to be passed to the action function
 */

function recursiveGet(resolve, reject, rowsToGet, action, actionArgs) {
	if (!rowsToGet.next())
		resolve(actionArgs);
	else {
		var item = new DBRow(rowsToGet.getValue(lit.TYPE));
		item.getRow(rowsToGet.getValue(lit.FIELD_ITEM_ID)).then(function() {
			action(rowsToGet, item, actionArgs);
			recursiveGet(resolve, reject, rowsToGet, action, actionArgs)

		}, function(err) {
			reject(actionArgs, err);

		});
	}
}

function getSaved(user, info) {
	return new Promise(function(resolve, reject) {
		var saved = new DBRow(lit.SAVED_TABLE);
		saved.addQuery(lit.FIELD_USER_ID, user.getValue(lit.FIELD_ID));
		saved.setLimit(5);
		saved.orderBy(lit.FIELD_DATE_SAVED, lit.DESC);
		saved.query().then(function() {
			recursiveGet(resolve, reject, saved, savedInfo, [info.items.saved]);
		}, function(err) {
			reject(err);
		});
	});
}

function getSubscribed(user, info) {
	return new Promise(function(resolve, reject) {
		var subscribed = new DBRow(lit.SUBSCRIPTIONS_TABLE);
		subscribed.addQuery(lit.FIELD_USER_ID, user.getValue(lit.FIELD_ID));
		subscribed.setLimit(5);
		subscribed.orderBy(lit.FIELD_DATE_SUBSCRIBED, lit.DESC);
		subscribed.query().then(function() {
			recursiveGet(resolve, reject, subscribed, subscribedInfo, [info.items.subscribed]);
		}, function(err) {
	reject(err);
		});
	});
}

function getContributions(user, info) {
	return new Promise(function(resolve, reject) {
		var contr = new DBRow(lit.CONTRIBUTION_TABLE);
		contr.addQuery(lit.FIELD_USER_ID, user.getValue(lit.FIELD_ID));
		contr.setLimit(5);
		contr.orderBy(lit.FIELD_DATE, lit.DESC);
		contr.query().then(function() {
			recursiveGet(resolve, reject, contr, contributionInfo, [info.items.contributions]);
		}, function(err) {
			reject(err);
		});
	});
}

function contributionInfo(row, item, list) {
    var data = {
		id: item.getValue(lit.FIELD_ID),
		title: item.getValue(lit.FIELD_TITLE),
		votes: item.getValue(lit.FIELD_NETVOTES),
		author: item.getValue(lit.FIELD_AUTHOR),
		date: row.getValue(lit.FIELD_DATE),
		summary: item.getValue(lit.FIELD_CONTENT)
	};
    list[0].push(data);
}

function subscribedInfo(row, item, list) {
    var data = {
        id: item.getValue(lit.FIELD_ID),
        title: item.getValue(lit.FIELD_TITLE),
        votes: item.getValue(lit.FIELD_NETVOTES),
        author: item.getValue(lit.FIELD_AUTHOR),
		date: row.getValue(lit.FIELD_DATE_SUBSCRIBED)
	};
    list[0].push(data);
}

function savedInfo(row, item, list) {
	var data =  {
        id: item.getValue(lit.FIELD_ID),
        title: item.getValue(lit.FIELD_TITLE),
        votes: item.getValue(lit.FIELD_NETVOTES),
        author: item.getValue(lit.FIELD_AUTHOR),
		date: row.getValue(lit.FIELD_DATE_SAVED)
	};
    list[0].push(data);
}