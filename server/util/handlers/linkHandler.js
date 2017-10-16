/*
 * linkResponder.js
 * Written by Michael Albinson 2/28/17
 */

"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals.js');
var commenter = require('./../actions/Commenter');
var voter = require('./../actions/Voter');

/** Handles the request from the client by getting information about the link and its comments and returning it to the client.
 *
 * @param request: The express request received by the express server
 */
exports.handle = function(request) {
    var info = {link: {}, comments: []};
    return new Promise(function(resolve, reject) {
        var link = new DBRow(lit.LINK_TABLE);
        link.getRow(request.query.id).then(function() {
            if (link.count() > 0) {
                voter.getVote(request.signedCookies.usercookie.userID, request.query.id).then(function(vote) {
                    getLinkInfo(link, info, vote);
                    var comments = new DBRow(lit.COMMENT_TABLE);
                    comments.addQuery(lit.FIELD_COMMENT_LEVEL, 0);
                    comments.addQuery(lit.FIELD_PARENT, link.getValue(lit.FIELD_ID));
                    comments.orderBy(lit.FIELD_NETVOTES, lit.DESC);
                    comments.setLimit(10);
                    comments.query().then(function() {
                        if (comments.count() < 1)
                            resolve(info);
                        else
                            commenter.getCommentsRecursive(resolve, reject, comments, link, info, request.signedCookies.usercookie.userID);
                    });
                });
            }
            else
                reject("The link does not exist");
        });
    });
};

/** Gets all the information about a link and appends it to the JSON object that will be returned to the client
 *
 * @param link: The link DBRow
 * @param info: the object to be returned to the client in the format {link: {}, comments: []}
 * @param vote: The vote DBRow for the link and the user that has requested the page
 */
function getLinkInfo(link, info, vote) {
    info.link.title = link.getValue(lit.FIELD_TITLE);
    info.link.url = link.getValue(lit.FIELD_LINK);
    info.link.date = link.getValue(lit.FIELD_TIMESTAMP);
    info.link.author = link.getValue(lit.FIELD_ADDED_BY);
    info.link.tags = link.getValue(lit.FIELD_TAGS);
    info.link.summary = link.getValue(lit.FIELD_SUMMARY);
    info.link.votes = link.getValue(lit.FIELD_NETVOTES);
    info.link.id = link.getValue(lit.FIELD_ID);
    info.link.voted = vote ? (vote.getValue(lit.FIELD_VOTE_VALUE) ? "positive" : "negative") : undefined;
}