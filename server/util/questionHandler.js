/*
 * questionHandler.js
 * Written by Michael Albinson 2/15/17
 *
 * Handles requests from the question page.
 */

"use strict";

var DBRow = require('./DBRow').DBRow;
var lit = require('./Literals.js');
var subComments = require('./subcommentGetter');

//TODO: add duplicate handling

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
                    subComments.get(comments, question, resolve, info);
                });
            }
            else
                reject("The question does not exist");
        });
    });
};

function getQuestionInfo(question, info) {
    info.question.title = question.getValue(lit.FIELD_TITLE);
    info.question.date = question.getValue(lit.FIELD_TIMESTAMP);
    info.question.author = question.getValue(lit.FIELD_AUTHOR);
    info.question.tags = question.getValue(lit.FIELD_TAGS);
    info.question.summary = question.getValue(lit.FIELD_CONTENT);
    info.question.votes = question.getValue(lit.FIELD_NETVOTES);
    info.question.isDuplicate = question.getValue(lit.FIELD_DUPLICATE);
    info.question.isSelf = false; //TODO: check if this user owns the post
}