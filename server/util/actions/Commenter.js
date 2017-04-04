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

/** Adds a new comment
 *
 * @param request
 */
exports.addComment = function (request) {
    return new Promise(function(resolve, reject) {
        var u = new DBRow(lit.USER_TABLE);
        u.getRow(request.signedCookies.usercookie.userID).then(function() {
            if (u.count() < 1)
                return reject('unauthorized user');

            var comment = new DBRow(lit.COMMENT_TABLE);
            comment.setValue(lit.FIELD_AUTHOR, u.getValue(lit.FIELD_USERNAME));
            comment.setValue(lit.FIELD_PARENT_POST, request.body.parent);
            comment.setValue(lit.FIELD_PARENT_COMMENT, request.body.parentComment);
            comment.setValue(lit.FIELD_CONTENT, request.body.content);
            comment.setValue(lit.FIELD_COMMENT_LEVEL, request.body.level);
            comment.insert().then(function () {
                voter.vote(request.signedCookies.usercookie.userID, comment.getValue(lit.FIELD_ID), 1); // don't need to wait for this to complete
                contributor.generateContribution(comment, request.signedCookies.usercookie.userID, lit.COMMENT_TABLE); //or this
                resolve(getCommentInfo(comment, undefined, true));
            }, function (err) {
                reject(err);
            });
        });
    });
};

/**
 *
 * @param request
 */
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

/**
 *
 * @param request
 */
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
** Super dense, recursive promises to get comments out without race conditions
*
* One of the most significant issues I've had here is that unless recursive promises are used, there is no reliable
* way to know that comments are added to the info array before the promise chain is entirely resolved. Any suggestions
* that work are more than welcome to replace this solution, this is just all I could o to get it working.
 */

/** getCommentsRecursive()
 *
 * @param resolve
 * @param reject
 * @param comments
 * @param item
 * @param info
 * @param userID
 * @returns {*}
 */
exports.getCommentsRecursive = function(resolve, reject, comments, item, info, userID) {
    if (!comments.next())
        return resolve(info);
    else {
        voter.getVote(userID, comments.getValue(lit.FIELD_ID)).then(function(vote) {
            var commentInfo = getCommentInfo(comments, vote); // commentInfo is a mutable object that can be modified by getSubComments
            getSubComments(comments, item, info, userID, commentInfo).then(function () {
                info.comments.push(commentInfo); // only add to this object when the commentInfo object is complete
                exports.getCommentsRecursive(resolve, reject, comments, item, info, userID);
            }, function (err) {
                reject(err);
            });
        });
    }
};

/** getSubComments
 *
 * @param comment
 * @param item
 * @param info
 * @param userID
 * @param commentInfo
 */
function getSubComments(comment, item, info, userID, commentInfo) {
    return new Promise(function(resolve, reject) {
        var subComments = new DBRow(lit.COMMENT_TABLE);
        subComments.addQuery(lit.FIELD_COMMENT_LEVEL, 1);
        subComments.addQuery(lit.FIELD_PARENT_POST, item.getValue(lit.FIELD_ID));
        subComments.addQuery(lit.FIELD_PARENT_COMMENT, comment.getValue(lit.FIELD_ID));
        subComments.orderBy(lit.FIELD_NETVOTES, lit.DESC); //TODO: enable sorting by best or by new
        subComments.setLimit(10);
        subComments.query().then(function() {
            if (subComments.count() < 1)
                resolve(info);

            subCommentRecurse(resolve, reject, subComments, commentInfo, item, info, userID)
        }).catch(function(err) {
            log.error(err);
        })
    })
}

/** subCommentRecurse
 *
 * @param resolve
 * @param reject
 * @param subComments
 * @param commentInfo
 * @param item
 * @param info
 * @param userID
 * @returns {*}
 */
function subCommentRecurse(resolve, reject, subComments, commentInfo, item, info, userID) {
    if (!subComments.next())
        return resolve(info);
    else {
        voter.getVote(userID, subComments.getValue(lit.FIELD_ID)).then(function(vote) {
            getSubCommentInfo(subComments, vote, commentInfo);
            subCommentRecurse(resolve, reject, subComments, commentInfo, item, info, userID);

        }, function(err) {
            reject(err);
        });
    }
}

/**
 *
 * @param comment: the comment to get information for
 * @param vote: the relevant vote for the comment
 * @param justAdded: whether or not this object was just inserted into the database, this is an optional parameter
 * @returns {{summary, author, votes, date, id, isSelf: boolean, voted: *}}
 */
function getCommentInfo(comment, vote, justAdded) {
    var hasVoted;
    if (!justAdded)
        hasVoted = vote ? (vote.getValue(lit.FIELD_VOTE_VALUE) ? "positive" : "negative") : undefined; // true if there is a vote, false if there is no vote
    else
        hasVoted = "positive";

    return {
        summary: comment.getValue(lit.FIELD_CONTENT),
        author: comment.getValue(lit.FIELD_AUTHOR),
        votes: comment.getValue(lit.FIELD_NETVOTES),
        date: comment.getValue(lit.FIELD_TIMESTAMP),
        id: comment.getValue(lit.FIELD_ID),
        isSelf: true, //TODO: pass this information in
        voted: hasVoted,
        children: []
    };
}

/**
 *
 * @param sub: the subcomment to get information for
 * @param vote: the relevant vote for the subcomment
 * @param commentInfo: the information object for the parent comment
 * @param justAdded: whether or not this object was just inserted into the database, this is an optional parameter
 */
function getSubCommentInfo(sub, vote, commentInfo, justAdded) {
    var hasVoted;
    if (!justAdded)
        hasVoted = vote ? (vote.getValue(lit.FIELD_VOTE_VALUE) ? "positive" : "negative") : undefined; // true if there is a vote, false if there is no vote
    else
        hasVoted = "positive";

    var info = {
        summary: sub.getValue(lit.FIELD_CONTENT),
        author: sub.getValue(lit.FIELD_AUTHOR),
        votes: sub.getValue(lit.FIELD_NETVOTES),
        date: sub.getValue(lit.FIELD_TIMESTAMP),
        id: sub.getValue(lit.FIELD_ID),
        isSelf: true, //TODO: pass this information in
        voted: hasVoted
    };
    commentInfo.children.push(info);
}