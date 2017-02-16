"use strict";

var DBRow = require('./DBRow').DBRow;
var lit = require('./Literals.js');

exports.handle = function(request) {
    var info = {question: {}, comments: []};
    return new Promise(function(resolve, reject) {
        var question = new DBRow(lit.POST_TABLE);
        question.getRow(request.query.id).then(function() {
            if (question.count() > 0) {
                getQuestionInfo(question, info);
                var comments = new DBRow(lit.COMMENT_TABLE);
                comments.addQuery(lit.FIELD_COMMENT_LEVEL, 0);
                comments.addQuery(lit.FIELD_PARENT_POST, question.getValue(lit.FIELD_ID));
                comments.orderBy(lit.FIELD_NETVOTES, lit.DESC);
                comments.setLimit(10);
                comments.query().then(function() {
                    getSubComments(comments, question, resolve, info);
                });
            }
            else
                reject("The question does not exist");
        });
    });
};

function getSubComments(comment, question, resolve, info) {
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
        subComment.addQuery(lit.FIELD_PARENT_POST, question.getValue(lit.FIELD_ID));
        subComment.orderBy(lit.FIELD_NETVOTES, lit.DESC);
        subComment.setLimit(10);
        subComment.query().then(function () {
            var subCommentCount = subComment.count();
            var subComplete = 0;
            if (subCommentCount < 1 && commentCount >= complete-1) {
                resolve(info);
                return;
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
}

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

function getQuestionInfo(question, info) {
    info.question.title = question.getValue(lit.FIELD_TITLE);
    info.question.date = question.getValue(lit.FIELD_TIMESTAMP);
    info.question.author = question.getValue(lit.FIELD_AUTHOR);
    info.question.tags = question.getValue(lit.FIELD_TAGS);
    info.question.summary = question.getValue(lit.FIELD_CONTENT);
    info.question.votes = question.getValue(lit.FIELD_NETVOTES)
}