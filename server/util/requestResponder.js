/*
** requestResponder.js
** Created by Michael Albinson 1/15/17
*/

"use strict";

var DBRow = require('./DBRow').DBRow;

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
	return new Promise(function(resolve, reject) {
		console.log(request.body.self)
		if (request.body.self) {
			var userID = request.signedCookies.usercookie.userID;
			var row = new DBRow('user');
			row.getRow(userID).then(function() {
				if (row.count() < 1)
					reject("No user found");
				else {
					var info = {profile: { username: row.getValue('username'),
										upvotes: row.getValue('totalUpvotes'),
										downvotes: row.getValue('totalDownvotes'),
										dateJoined: row.getValue('dateJoined') } 
									};
					aggregateOthers(row, info).then(function() {
						resolve(info);
					}, function() {
						resolve(info);
					})
				}
			})
		}
		else {
			var user = new DBRow('user');
			for (var key in request.query)
				user.addQuery(key, request.query[key]);

			user.query().then(function() {
				if (!user.next())
					reject("No user found");
				else {
					var info = {profile: { username: user.getValue('username'),
										upvotes: user.getValue('totalUpvotes'),
										downvotes: user.getValue('totalDownvotes'),
										dateJoined: user.getValue('dateJoined') } 
									};
					aggregateOthers(user, info).then(function() {
						resolve(info);
					}, function() {
						resolve(info);
					})
				}
			})
		}
	})
}

function aggregateOthers(user, info) { // turn this into a file called aggregator(table, matches [, more queries])
	return new Promise(function(resolve, reject) {
		info.profile.other = 0;

		var posts = new DBRow('post');
		posts.addQuery('author', user.getValue('username'));
		posts.query().then(function() {
			info.profile.posts = posts.count();
			var comments = new DBRow('comment');
			comments.addQuery('author', user.getValue('username'));

			comments.query().then(function() {
				info.profile.comments = comments.count();
				var links = new DBRow('link');
				links.addQuery('addedBy', user.getValue('id'));

				links.query().then(function() {
					info.profile.links = links.count();
					resolve(info)

				}, function() {
					reject();
				})
			}, function() {
				reject()
			})
		}, function() {
			console.log("failed here")
			reject();
		})
	})
}