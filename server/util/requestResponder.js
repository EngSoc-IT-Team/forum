/*
** requestResponder.js
** Created by Michael Albinson 1/15/17
*/

"use strict";

var DBRow = require('./DBRow').DBRow;
var Aggregator = require('./aggregator');

/*
** requestResponder is a functional utility interface to process requests that require results from the database
** Essentially it is used to call down to other processes to remove logic from the expressServer file
*/


/* parseRequest(requestType, userCookie, requestJSON)
**
** resquestType the type of request being made, corresponding to the information to be returned
** usercookie: The usercookie for the currently logged in user
** requestJSON: Further information provided by the client to aid sorting through information to be returned
**
** Resolves the information necessary to fill in the page if successful
** Rejects if there is an invalid request type or there is an error retrieving the information
*/
exports.parseRequest = function(request) {
	return new Promise(function(resolve, reject) {
		switch (request.body.requested) {
			case ("profile"):
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
}

/** Individual Request Type Processing Funcitons **/

/* profileRequest(cookie, isSelf)
**
** cookie: the usercookie of the currently signed in user
** isSelf: 
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
			var user = new DBRow('user');
			user.getRow(userID).then(function() {
				if (user.count() < 1)
					reject("No user found");
				else {
					info.profile.username = user.getValue('username');
					info.profile.upvotes = user.getValue('totalUpvotes');
					info.profile.downvotes = user.getValue('totalDownvotes');
					info.profile.dateJoined = user.getValue('dateJoined');
					Aggregator.aggregateProfileInfo(user, info).then(function() {
						console.log('hi2')
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
						console.log(err)
						resolve(info);
					});
				}
			});
		}
		else {
			var user = new DBRow('user');
			for (var key in request.query)
				user.addQuery(key, request.query[key]);

			user.query().then(function() {
				if (!user.next())
					reject("No user found");
				else {
					info.profile.username = user.getValue('username');
					info.profile.upvotes = user.getValue('totalUpvotes');
					info.profile.downvotes = user.getValue('totalDownvotes');
					info.profile.dateJoined = user.getValue('dateJoined');

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
		var item = new DBRow(rows.getValue('type'));
		item.getRow(rows.getValue('itemID')).then(function() {
			list.push(getData(rows, item))
			recursiveGet(resolve, reject, rows, list, getData)
		}, function(err) {
			reject(list);
		});
	}
}

function getSaved(user, info) {
	return new Promise(function(resolve, reject) {
		var saved = new DBRow('saved');
		saved.addQuery('userID', user.getValue('id'));
		saved.setLimit(5);
		saved.orderBy('dateSaved', 'DESC');
		saved.query().then(function() {
			console.log('yo')
			recursiveGet(resolve, reject, saved, info.items.saved, savedInfo);
		}, function(err) {
			reject(err);
		});
	});
}

function getSubscribed(user, info) {
	return new Promise(function(resolve, reject) {
		var subscribed = new DBRow('subscriptions');
		subscribed.addQuery('userID', user.getValue('id'));
		subscribed.setLimit(5);
		subscribed.orderBy('dateSubscribed', 'DESC');
		subscribed.query().then(function() {
			console.log('o2')
			recursiveGet(resolve, reject, subscribed, info.items.subscribed, subscribedInfo)
		}, function(err) {

		});
	});
}

function getContributions(user, info) {
	return new Promise(function(resolve, reject) {
		var contr = new DBRow('contribution');
		contr.addQuery('userID', user.getValue('id'));
		contr.setLimit(5);
		contr.orderBy('date', 'DESC');
		contr.query().then(function() {
			console.log('03')
			recursiveGet(resolve, reject, contr, info.items.contributions, contributionInfo);
		}, function(err) {
			reject(err);
		});
	});
}

function contributionInfo(row, item) {
	return {
		id: item.getValue('id'),
		title: item.getValue('title'),
		votes: item.getValue('netVotes'),
		author: item.getValue('author'),
		date: row.getValue('date'),
		summary: item.getValue('content')
	};
}

function subscribedInfo(row, item) {
	return {
		id: item.getValue('id'),
		title: item.getValue('title'),
		votes: item.getValue('netVotes'),
		author: item.getValue('author'),
		date: row.getValue('dateSubscribed') 
	};
}

function savedInfo(row, item) {
	return {
		id: item.getValue('id'),
		title: item.getValue('title'),
		votes: item.getValue('netVotes'),
		author: item.getValue('author'),
		date: row.getValue('dateSaved') 
	};
}