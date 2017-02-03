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
			case (literals.profile):
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
			var user = new DBRow(literals.userTable);
			user.getRow(userID).then(function() {
				if (user.count() < 1)
					reject("No user found");
				else {
					info.profile.username = user.getValue(literals.fieldUsername);
					info.profile.upvotes = user.getValue(literals.fieldTotalUpvotes);
					info.profile.downvotes = user.getValue(literals.fieldTotalDownvotes);
					info.profile.dateJoined = user.getValue(literals.fieldDateJoined);
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
			var user = new DBRow(literals.userTable);
			for (var key in request.query)
				user.addQuery(key, request.query[key]);

			user.query().then(function() {
				if (!user.next())
					reject("No user found");
				else {
                    info.profile.username = user.getValue(literals.fieldUsername);
                    info.profile.upvotes = user.getValue(literals.fieldTotalUpvotes);
                    info.profile.downvotes = user.getValue(literals.fieldTotalDownvotes);
                    info.profile.dateJoined = user.getValue(literals.fieldDateJoined);

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
		var item = new DBRow(rows.getValue(literals.type));
		item.getRow(rows.getValue(literals.fieldItemID)).then(function() {
			list.push(getData(rows, item))
			recursiveGet(resolve, reject, rows, list, getData)
		}, function(err) {
			reject(list);
		});
	}
}

function getSaved(user, info) {
	return new Promise(function(resolve, reject) {
		var saved = new DBRow(literals.savedTable);
		saved.addQuery(literals.fieldUserID, user.getValue(literals.fieldID));
		saved.setLimit(5);
		saved.orderBy(literals.fieldDateSaved, literals.DESC);
		saved.query().then(function() {
			recursiveGet(resolve, reject, saved, info.items.saved, savedInfo);
		}, function(err) {
			reject(err);
		});
	});
}

function getSubscribed(user, info) {
	return new Promise(function(resolve, reject) {
		var subscribed = new DBRow(literals.subscriptionsTable);
		subscribed.addQuery(literals.fieldUserID, user.getValue(literals.fieldID));
		subscribed.setLimit(5);
		subscribed.orderBy(literals.fieldDateSubscribed, literals.DESC);
		subscribed.query().then(function() {
			recursiveGet(resolve, reject, subscribed, info.items.subscribed, subscribedInfo)
		}, function(err) {

		});
	});
}

function getContributions(user, info) {
	return new Promise(function(resolve, reject) {
		var contr = new DBRow(literals.contributionTable);
		contr.addQuery(literals.fieldUserID, user.getValue(literals.fieldID));
		contr.setLimit(5);
		contr.orderBy(literals.fieldDate, literals.DESC);
		contr.query().then(function() {
			recursiveGet(resolve, reject, contr, info.items.contributions, contributionInfo);
		}, function(err) {
			reject(err);
		});
	});
}

function contributionInfo(row, item) {
	return {
		id: item.getValue(literals.fieldID),
		title: item.getValue(literals.fieldTitle),
		votes: item.getValue(literals.fieldNetvotes),
		author: item.getValue(literals.fieldAuthor),
		date: row.getValue(literals.fieldDate),
		summary: item.getValue(literals.fieldContent)
	};
}

function subscribedInfo(row, item) {
	return {
        id: item.getValue(literals.fieldID),
        title: item.getValue(literals.fieldTitle),
        votes: item.getValue(literals.fieldNetvotes),
        author: item.getValue(literals.fieldAuthor),
		date: row.getValue(literals.fieldDateSubscribed)
	};
}

function savedInfo(row, item) {
	return {
        id: item.getValue(literals.fieldID),
        title: item.getValue(literals.fieldTitle),
        votes: item.getValue(literals.fieldNetvotes),
        author: item.getValue(literals.fieldAuthor),
		date: row.getValue(literals.fieldDateSaved)
	};
}