/*
 * subcommentGetter.js
 * Written by Michael Albinson 2/28/17
 *
 * Used by many of the requestResponder subclasses to get their subcomments
 */

"use strict";

var DBRow = require('./DBRow').DBRow;
var lit = require('./Literals.js');

exports.get = function(comment, item, resolve, info) {
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