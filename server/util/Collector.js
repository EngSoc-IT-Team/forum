"use strict";

var dbr = require('./DBRow');
var log = require('./log')

exports.collectPost = function(id, currentUserID) {
	return new Promise(function(resolve, reject) {
		var collection = {};
		var post = new dbr.DBRow('post');

		post.get(id).then(function(res) {
			collection["post"] = post.getRowJSON();
			var comments = new dbr.DBRow('comment');
			comments.addQuery('parentPost', id);
			comments.orderBy('upvotes');
			comments.limit(20); // tweak for performance

			comments.query().then(function(res) {
				var i = 0;
				while(comments.next()) {
					extractCommentInfo(comments.getRowJSON(), currentUserID).then(function(res) {
						collection.i = res;
						i++;
						if (i > comments.length())
							resolve(collection);
					}, function(res) {
						log.warn("There was an error retrieving data");
						reject(false);
					});
				}
			}, function(res) {
				log.log("Failed to retrieve any rows matching query")
				reject(false);
			})

		}, function(res) {
			log.log("Failed to retrieve post related to id: " + id);
			reject(false);
		})
	})	
}

exports.collectCommentList = function(userId) {
	return new Promise(function(resolve, reject) {
		var collection = {};
		var comments = new dbr.DBRow('comment');
		comments.addQuery('userID', userId);
		comments.orderBy('timestamp', 'DESC');
		comments.query(res).then(function(res) {
			var i = 0;

			while (comments.next()){
				createCommentListElement(comments.getRowJSON(), currentUserID).then(function(res) {
					collection.i = res;
					i++;
					if (i > comments.length())
						resolve(collection);
					
				}, function(res) {
					log.log("Failed to retrieve post related to id: " + id);
					reject(false);
				})
			}
			
		}, function(res) {
			reject(false);
		})
}

function extractCommentInfo(comment, currentUserID) {
	return new Promise(function(resolve, reject) {
		var info = {};
		var voted = new dbr.DBRow('vote');
		voted.addQuery('commentOrPostID', comment.getValue("id"));
		voted.addQuery('userID', currentUserID);
		voted.query().then(function(res) {
			info.vote = voted.getValue(voteValue);
			info.content = comment.getValue('content');
			info.votes = comment.getValue('netVotes');
			info.isSolution = comment.getValue('isSolution');
			info.parentComment = comment.getValue('parentComment');
			info.timestamp = comment.getValue('timestamp');
			info.commentLevel = comment.getValue('commentLevel');
			info.author = comment.getValue('author');
			resolve(info)
		}, function(res) {
			reject(false);
		})
	})
}

function createCommentListElement(comment, currentUserID) {
	return new Promise(function(resolve, reject) {
		var element = {};
		var voted = new dbr.DBRow('vote');
		voted.addQuery('commentOrPostID', comment.getValue("id"));
		voted.addQuery('userID', currentUserID);
		voted.query().then(function(res) {
			element.vote = voted.getValue(voteValue);
			element.content = comment.getValue('content');
			element.votes = comment.getValue('netVotes');
			element.isSolution = comment.getValue('isSolution');
			element.parentPost = comment.getValue('parentPost');
			element.timestamp = comment.getValue('timestamp');
			resolve(element)
		}, function(res) {
			reject(false);
		})
	})
}