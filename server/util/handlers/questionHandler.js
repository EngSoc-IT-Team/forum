/*
 * questionHandler.js
 * Written by Michael Albinson 2/15/17
 *
 * Handles requests from the question page.
 */

"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals.js');
var commenter = require('./../actions/Commenter');
var voter = require('./../actions/Voter');

//TODO: add duplicate handling

/** Handles the request from the client by getting information about the question and its subcomments and returning it to
 * the client.
 *
 * @param request: The express request received by the express server
 */
exports.handle = function(request) {
    var info = {question: {}, comments: []};
    return new Promise(function(resolve, reject) {
        var question = new DBRow(lit.tables.POST);
        question.getRow(request.query.id).then(function() {
            if (question.count() > 0) {
                voter.getVote(request.signedCookies.usercookie.userID, request.query.id).then(function (vote) {
                    getQuestionInfo(question, info, vote);
                    var comments = new DBRow(lit.tables.COMMENT);
                    comments.addQuery(lit.fields.COMMENT_LEVEL, 0);
                    comments.addQuery(lit.fields.PARENT, question.getValue(lit.fields.ID));
                    comments.orderBy(lit.fields.NETVOTES, lit.DESC);
                    comments.setLimit(10);
                    comments.query().then(function() {
                        commenter.getCommentsRecursive(resolve, reject, comments, question, info, request.signedCookies.usercookie.userID);
                    });
                })
            }
            else
                reject("The question does not exist");
        });
    });
};

/** Gets all the information about a question and appends it to the JSON object that will be returned to the client
 *
 * @param question: The question DBRow
 * @param info: the object to be returned to the client in the format {question: {}, comments: []}
 * @param vote: The vote DBRow for the question and the user that has requested the page
 */
function getQuestionInfo(question, info, vote) {
    info.question.title = question.getValue(lit.fields.TITLE);
    info.question.date = question.getValue(lit.fields.TIMESTAMP);
    info.question.author = question.getValue(lit.fields.AUTHOR);
    info.question.tags = question.getValue(lit.fields.TAGS);
    info.question.summary = question.getValue(lit.fields.CONTENT);
    info.question.votes = question.getValue(lit.fields.NETVOTES);
    info.question.isDuplicate = question.getValue(lit.fields.DUPLICATE);
    info.question.isSelf = false; //TODO: check if this user owns the post
    info.question.id = question.getValue(lit.fields.ID);
    info.question.voted = vote ? (vote.getValue(lit.fields.VOTE_VALUE) ? "positive" : "negative") : undefined;
}