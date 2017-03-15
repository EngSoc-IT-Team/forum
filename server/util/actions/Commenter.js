/*
 * Commenter.js
 *
 * Written by Michael Albinson 3/10/17
 *
 * Action handler responsible for adding, getting, and modifying comments
 *
 */

"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals');
var log = require('./../log');
var voter = require('./Voter');
var contributor = require('./Contributor');

exports.addComment = function (request) {
    return new Promise(function(resolve, reject) {
        var comment = new DBRow(lit.COMMENT_TABLE);
        comment.setValue(lit.FIELD_AUTHOR, request.body.author);
        comment.setValue(lit.FIELD_PARENT_POST, request.body.parent);
        comment.setValue(lit.FIELD_PARENT_COMMENT, request.body.parentComment);
        comment.setValue(lit.FIELD_CONTENT, request.body.content);
        comment.setValue(lit.FIELD_USER_ID, request.body.userID);
        comment.insert().then(function () {
            voter.vote(request.signedCookies.usercookie.userID, comment.getValue(lit.FIELD_ID), 1); // don't need to wait for this to complete
            contributor.generateContribution(comment, request.signedCookies.usercookie.userID, lit.COMMENT_TABLE);
            resolve();
        }, function (err) {
            reject(err);
        });
    });
};

exports.editComment = function (request) {
    return new Promise(function(resolve, reject) {
        var comment = new DBRow(lit.COMMENT_TABLE);
        comment.getRow(request.body.id).then(function() {
            if (!comment.count())
                return reject("No comment to edit found");

            comment.setValue(lit.FIELD_CONTENT, request.body.content); // once a comment is inserted, we only need update its content
            comment.update().then(function() {
                resolve();
            }, function(err) {
                reject(err)
            });
        });
    });
};

exports.deleteComment = function(request) {
    return new Promise(function(resolve, reject) {
        var comment = new DBRow(lit.COMMENT_TABLE);
        comment.getRow(request.body.id).then(function() {
            if (!comment.count())
                return reject("No comment to delete found");

            comment.delete().then(function () {
                resolve();
            }, function(err) {
                reject(err);
            });
        });
    });
};

/*
* Used by many of the requestResponder subclasses to get their subComments
*/
exports.getSubComments = function(comment, item, resolve, info) {
    var commentCount = comment.count();
    var complete = 0;
    if(commentCount < 1) { // if there are no comments just resolve with the question information
        resolve(info);
        return;
    }

    while (comment.next()) {
        var commentInfo = getCommentInfo(comment);
        var subComment = new DBRow(lit.COMMENT_TABLE);
        subComment.addQuery(lit.FIELD_COMMENT_LEVEL, 1);
        subComment.addQuery(lit.FIELD_PARENT_POST, item.getValue(lit.FIELD_ID));
        subComment.addQuery(lit.FIELD_PARENT_COMMENT, comment.getValue(lit.FIELD_ID));
        subComment.orderBy(lit.FIELD_NETVOTES, lit.DESC); //TODO: enable sorting by best or by new
        subComment.setLimit(10);
        subComment.query().then(function () {
            var subCommentCount = subComment.count();
            var subComplete = 0;
            if (subCommentCount < 1 && commentCount >= complete - 1) {
                resolve(info);
            }
            else {
                while (subComment.next()) {
                    getSubCommentInfo(subComment, commentInfo); // pass reference to the base comment object, fill children
                    if (commentCount >= complete && subCommentCount >= subComplete) {
                        resolve(info);
                        return;
                    }
                    subComplete++;

                }
            }
        });
        info.comments.push(commentInfo); // push comment and its children to the comment array
        complete++;
    }
};

function getCommentInfo(comment) {
    return {
        summary: comment.getValue(lit.FIELD_CONTENT),
        author: comment.getValue(lit.FIELD_AUTHOR),
        votes: comment.getValue(lit.FIELD_NETVOTES),
        date: comment.getValue(lit.FIELD_TIMESTAMP),
        isSelf: true, //TODO: pass this information in
        hasVoted: false, //TODO: pass this information in
        voteValue: 0,
        children: []
    };
}

function getSubCommentInfo(sub, comment) {
    var info = {
        summary: sub.getValue(lit.FIELD_CONTENT),
        author: sub.getValue(lit.FIELD_AUTHOR),
        votes: sub.getValue(lit.FIELD_NETVOTES),
        date: sub.getValue(lit.FIELD_TIMESTAMP),
        isSelf: true, //TODO: pass this information in
        hasVoted: false, //TODO: pass this information in
        voteValue: 0
    };
    comment.children.push(info);
}