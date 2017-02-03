"use strict";

var dbr = require('./DBRow');
var log = require('./log');
var literals = require('./StringLiterals.js');

exports.collectPost = function(id, currentUserID) {
	return new Promise(function(resolve, reject) {
		var collection = {};
		var post = new dbr.DBRow(literals.postTable);

		post.get(id).then(function(res) {
			collection[literals.postTable] = post.getRowJSON();
			var comments = new dbr.DBRow(literals.commentTable);
			comments.addQuery(literals.fieldParentPost, id);
			comments.orderBy(literals.fieldUpvotes);
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
        var comments = new dbr.DBRow(literals.commentTable);
        comments.addQuery(literals.fieldUserID, userId);
        comments.orderBy(literals.fieldTimestamp, literals.DESC);
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
		var voted = new dbr.DBRow(literals.voteTable);
		voted.addQuery(literals.fieldCommentOrPostID, comment.getValue(literals.fieldID));
		voted.addQuery(literals.fieldUserID, currentUserID);
		voted.query().then(function(res) {
			info.vote = voted.getValue(voteValue);
			info.content = comment.getValue(literals.fieldContent);
			info.votes = comment.getValue(literals.fieldNetvotes);
			info.isSolution = comment.getValue(literals.fieldIsSolution);
			info.parentComment = comment.getValue(literals.fieldParentComment);
			info.timestamp = comment.getValue(literals.fieldTimestamp);
			info.commentLevel = comment.getValue(literals.fieldCommentLevel);
			info.author = comment.getValue(literals.fieldAuthor);
			resolve(info)
		}, function(res) {
			reject(false);
		})
	})
}

function createCommentListElement(comment, currentUserID) {
	return new Promise(function(resolve, reject) {
		var element = {};
		var voted = new dbr.DBRow(literals.voteTable);
		voted.addQuery(literals.fieldCommentOrPostID, comment.getValue(literals.fieldID));
		voted.addQuery(literals.fieldUserID, currentUserID);
		voted.query().then(function(res) {
			element.vote = voted.getValue(voteValue);
			element.content = comment.getValue(literals.fieldContent);
			element.votes = comment.getValue(literals.fieldNetvotes);
			element.isSolution = comment.getValue(literals.fieldIsSolution);
			element.parentPost = comment.getValue(literals.fieldParentPost);
			element.timestamp = comment.getValue(literals.fieldTimestamp);
			resolve(element)
		}, function(res) {
			reject(false);
		})
	})
}