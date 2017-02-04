"use strict";

var dbr = require('./DBRow');
var log = require('./log');
var literals = require('./StringLiterals.js');

exports.collectPost = function(id, currentUserID) {
	return new Promise(function(resolve, reject) {
		var collection = {};
		var post = new dbr.DBRow(literals.POST_TABLE);

		post.get(id).then(function(res) {
			collection[literals.POST_TABLE] = post.getRowJSON();
			var comments = new dbr.DBRow(literals.COMMENT_TABLE);
			comments.addQuery(literals.FIELD_PARENT_POST, id);
			comments.orderBy(literals.FIELD_UPVOTES);
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
    return new Promise(function (resolve, reject) {
        var collection = {};
        var comments = new dbr.DBRow(literals.COMMENT_TABLE);
        comments.addQuery(literals.FIELD_USER_ID, userId);
        comments.orderBy(literals.FIELD_TIMESTAMP, literals.DESC);
        comments.query(res).then(function (res) {
            var i = 0;

            while (comments.next()) {
                createCommentListElement(comments.getRowJSON(), currentUserID).then(function (res) {
                    collection.i = res;
                    i++;
                    if (i > comments.length())
                        resolve(collection);

                }, function (res) {
                    log.log("Failed to retrieve post related to id: " + id);
                    reject(false);
                })
            }

        }, function (res) {
            reject(false);
        })
    });
}

function extractCommentInfo(comment, currentUserID) {
	return new Promise(function(resolve, reject) {
		var info = {};
		var voted = new dbr.DBRow(literals.VOTE_TABLE);
		voted.addQuery(literals.FIELD_COMMENT_OR_POST_ID, comment.getValue(literals.FIELD_ID));
		voted.addQuery(literals.FIELD_USER_ID, currentUserID);
		voted.query().then(function(res) {
			info.vote = voted.getValue(voteValue);
			info.content = comment.getValue(literals.FIELD_CONTENT);
			info.votes = comment.getValue(literals.FIELD_NETVOTES);
			info.isSolution = comment.getValue(literals.FIELD_IS_SOLUTION);
			info.parentComment = comment.getValue(literals.FIELD_PARENT_COMMENT);
			info.timestamp = comment.getValue(literals.FIELD_TIMESTAMP);
			info.commentLevel = comment.getValue(literals.FIELD_COMMENT_LEVEL);
			info.author = comment.getValue(literals.FIELD_AUTHOR);
			resolve(info)
		}, function(res) {
			reject(false);
		})
	})
}

function createCommentListElement(comment, currentUserID) {
	return new Promise(function(resolve, reject) {
		var element = {};
		var voted = new dbr.DBRow(literals.VOTE_TABLE);
		voted.addQuery(literals.FIELD_COMMENT_OR_POST_ID, comment.getValue(literals.FIELD_ID));
		voted.addQuery(literals.FIELD_USER_ID, currentUserID);
		voted.query().then(function(res) {
			element.vote = voted.getValue(voteValue);
			element.content = comment.getValue(literals.FIELD_CONTENT);
			element.votes = comment.getValue(literals.FIELD_NETVOTES);
			element.isSolution = comment.getValue(literals.FIELD_IS_SOLUTION);
			element.parentPost = comment.getValue(literals.FIELD_PARENT_POST);
			element.timestamp = comment.getValue(literals.FIELD_TIMESTAMP);
			resolve(element)
		}, function(res) {
			reject(false);
		})
	})
}