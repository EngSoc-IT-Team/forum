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
        var question = new DBRow(lit.POST_TABLE);
        question.getRow(request.query.id).then(function() {
            if (question.count() > 0) {
                voter.getVote(request.signedCookies.usercookie.userID, request.query.id).then(function (vote) {
                    getQuestionInfo(question, info, vote);
                    var comments = new DBRow(lit.COMMENT_TABLE);
                    comments.addQuery(lit.FIELD_COMMENT_LEVEL, 0);
                    comments.addQuery(lit.FIELD_PARENT, question.getValue(lit.FIELD_ID));
                    comments.orderBy(lit.FIELD_NETVOTES, lit.DESC);
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
    info.question.title = question.getValue(lit.FIELD_TITLE);
    info.question.date = question.getValue(lit.FIELD_TIMESTAMP);
    info.question.author = question.getValue(lit.FIELD_AUTHOR);
    info.question.tags = question.getValue(lit.FIELD_TAGS);
    info.question.summary = question.getValue(lit.FIELD_CONTENT);
    info.question.votes = question.getValue(lit.FIELD_NETVOTES);
    info.question.isDuplicate = question.getValue(lit.FIELD_DUPLICATE);
    info.question.isSelf = false; //TODO: check if this user owns the post
    info.question.id = question.getValue(lit.FIELD_ID);
    info.question.voted = vote ? (vote.getValue(lit.FIELD_VOTE_VALUE) ? "positive" : "negative") : undefined;
}