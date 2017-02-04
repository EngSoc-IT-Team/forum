/*
** requestResponder.js
** Created by Michael Albinson 1/15/17
*/

"use strict";

var DBRow = require('./DBRow').DBRow;
var literals = require('./StringLiterals.js');
var Aggregator = require('./aggregator');

/*
** requestResponder is a functional utility interface to process requests that require results from the database
** Essentially it is used to call down to other processes to remove logic from the expressServer file
*/


/** parseRequest(requestType, userCookie, requestJSON)
**
** requestType the type of request being made, corresponding to the information to be returned
** usercookie: The usercookie for the currently logged in user
** requestJSON: Further information provided by the client to aid sorting through information to be returned
**
** Resolves the information necessary to fill in the page if successful
** Rejects if there is an invalid request type or there is an error retrieving the information
*/
exports.parseRequest = function(request) {
	return new Promise(function(resolve, reject) {
		switch (request.body.requested) {
			case (literals.PROFILE):
				profileRequest(request).then(function(info) {
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

	return new Promise(function(resolve, reject) {
		if (request.body.self) {
			var userID = request.signedCookies.usercookie.userID;
			var user = new DBRow(literals.USER_TABLE);
			user.getRow(userID).then(function() {
				if (user.count() < 1)
					reject("No user found");
				else {
					info.PROFILE.username = user.getValue(literals.FIELD_USERNAME);
					info.PROFILE.upvotes = user.getValue(literals.FIELD_TOTAL_UPVOTES);
					info.PROFILE.downvotes = user.getValue(literals.FIELD_TOTAL_DOWNVOTES);
					info.PROFILE.dateJoined = user.getValue(literals.FIELD_DATE_JOINED);
					Aggregator.aggregateProfileInfo(user, info).then(function() {
						getSaved(user, info).then(function() {
							getSubscribed(user, info).then(function() {
								getContributions(user, info).then(function() {
									resolve(info);
								}, function(err) {
									resolve(info);
								});
							}, function(err) {
								resolve(info);
							});
							
						}, function(err) {
							resolve(info);
						});
					}, function(err) {
						resolve(info);
					});
				}
			});
		}
		else {
			var user = new DBRow(literals.USER_TABLE);
			for (var key in request.query)
				user.addQuery(key, request.query[key]);

			user.query().then(function() {
				if (!user.next())
					reject("No user found");
				else {
                    info.PROFILE.username = user.getValue(literals.FIELD_USERNAME);
                    info.PROFILE.upvotes = user.getValue(literals.FIELD_TOTAL_UPVOTES);
                    info.PROFILE.downvotes = user.getValue(literals.FIELD_TOTAL_DOWNVOTES);
                    info.PROFILE.dateJoined = user.getValue(literals.FIELD_DATE_JOINED);

					Aggregator.aggregateProfileInfo(user, info).then(function() {
						getContributions(user, info).then(function() {
							resolve(info);
						}, function(err) {
							resolve(info);
						});
					}, function() { 
						resolve(info); // return what we have at minimum
					});
				}
			});
		}
	});
}



function recursiveGet(resolve, reject, rows, list, getData) {
	if (!rows.next())
		resolve(list);
	else {
		var item = new DBRow(rows.getValue(literals.TYPE));
		item.getRow(rows.getValue(literals.FIELD_ITEM_ID)).then(function() {
			list.push(getData(rows, item))
			recursiveGet(resolve, reject, rows, list, getData)
		}, function(err) {
			reject(list);
		});
	}
}

function getSaved(user, info) {
	return new Promise(function(resolve, reject) {
		var saved = new DBRow(literals.SAVED_TABLE);
		saved.addQuery(literals.FIELD_USER_ID, user.getValue(literals.FIELD_ID));
		saved.setLimit(5);
		saved.orderBy(literals.FIELD_DATE_SAVED, literals.DESC);
		saved.query().then(function() {
			recursiveGet(resolve, reject, saved, info.items.saved, savedInfo);
		}, function(err) {
			reject(err);
		});
	});
}

function getSubscribed(user, info) {
	return new Promise(function(resolve, reject) {
		var subscribed = new DBRow(literals.SUBSCRIPTIONS_TABLE);
		subscribed.addQuery(literals.FIELD_USER_ID, user.getValue(literals.FIELD_ID));
		subscribed.setLimit(5);
		subscribed.orderBy(literals.FIELD_DATE_SUBSCRIBED, literals.DESC);
		subscribed.query().then(function() {
			recursiveGet(resolve, reject, subscribed, info.items.subscribed, subscribedInfo)
		}, function(err) {

		});
	});
}

function getContributions(user, info) {
	return new Promise(function(resolve, reject) {
		var contr = new DBRow(literals.CONTRIBUTION_TABLE);
		contr.addQuery(literals.FIELD_USER_ID, user.getValue(literals.FIELD_ID));
		contr.setLimit(5);
		contr.orderBy(literals.FIELD_DATE, literals.DESC);
		contr.query().then(function() {
			recursiveGet(resolve, reject, contr, info.items.contributions, contributionInfo);
		}, function(err) {
			reject(err);
		});
	});
}

function contributionInfo(row, item) {
	return {
		id: item.getValue(literals.FIELD_ID),
		title: item.getValue(literals.FIELD_TITLE),
		votes: item.getValue(literals.FIELD_NETVOTES),
		author: item.getValue(literals.FIELD_AUTHOR),
		date: row.getValue(literals.FIELD_DATE),
		summary: item.getValue(literals.FIELD_CONTENT)
	};
}

function subscribedInfo(row, item) {
	return {
        id: item.getValue(literals.FIELD_ID),
        title: item.getValue(literals.FIELD_TITLE),
        votes: item.getValue(literals.FIELD_NETVOTES),
        author: item.getValue(literals.FIELD_AUTHOR),
		date: row.getValue(literals.FIELD_DATE_SUBSCRIBED)
	};
}

function savedInfo(row, item) {
	return {
        id: item.getValue(literals.FIELD_ID),
        title: item.getValue(literals.FIELD_TITLE),
        votes: item.getValue(literals.FIELD_NETVOTES),
        author: item.getValue(literals.FIELD_AUTHOR),
		date: row.getValue(literals.FIELD_DATE_SAVED)
	};
}