/*
 * classResponder.js
 * Written by Michael Albinson 2/28/17
 */

"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals.js');
var rater = require('./../actions/Rater');
var voter = require('./../actions/Voter');

/** Handles the request from the client by getting information about the class and its reviews and returning it to the client.
 *
 * @param request: The express request received by the express server
 */
exports.handle = function(request) {
    var info = {class: {}, reviews: []};
    return new Promise(function(resolve, reject) {
        var cl = new DBRow(lit.tables.CLASS);
        cl.getRow(request.query.id).then(function() {
            if (cl.count() > 0) {
                voter.getVote(request.signedCookies.usercookie.userID, request.query.id).then(function () {
                    getClassInfo(cl, info);
                    var ratingList = [];
                    var ratings = new DBRow(lit.tables.RATING);
                    ratings.addQuery(lit.fields.PARENT, cl.getValue(lit.fields.ID));
                    ratings.orderBy(lit.fields.NETVOTES, lit.sql.query.DESC);
                    ratings.setLimit(10);
                    ratings.query().then(function() {
                        while (ratings.next()) {
                            ratingList.push(getRatingInfo(ratings));
                        }
                        info.reviews = ratingList;
                        resolve(info);
                        rater.getRatingsRecursive(resolve, reject, ratings, cl, info, request.signedCookies.usercookie.userID);
                    });
                })
            }
            else
                reject("The class does not exist");
        });
    });
};

/** Gets all the information about a class and appends it to the JSON object that will be returned to the client
 *
 * @param cl: The class DBRow
 * @param info: the object to be returned to the client in the format {class: {}, reviews: []}
 * @param vote: The vote DBRow for the question and the user that has requested the page
 */
function getClassInfo(cl, info) {
    info.class.courseCode = cl.getValue(lit.fields.COURSE_CODE);
    info.class.title = cl.getValue(lit.fields.TITLE);
    info.class.summary = cl.getValue(lit.fields.SUMMARY);
    info.class.prereqs = cl.getValue(lit.fields.PREREQS);
    info.class.instructor = cl.getValue(lit.fields.INSTRUCTOR);
    info.class.credit = cl.getValue(lit.fields.CREDIT);
    info.class.tags = cl.getValue(lit.fields.TAGS);
    info.class.rating = cl.getValue(lit.fields.AVERAGE_RATING);
    info.class.isDuplicate = cl.getValue(lit.fields.DUPLICATE);
    info.class.id = cl.getValue(lit.fields.ID);
    //info.class.votes = cl.getValue(lit.fields.NETVOTES);
    //info.class.voted = vote ? (cl.getValue(lit.fields.VOTE_VALUE) ? "positive" : "negative") : undefined;
}

function getRatingInfo(rating, vote, justAdded) {
    var hasVoted;
    if(!justAdded)
        hasVoted = vote ? (vote.getValue(lit.fields.VOTE_VALUE) ? "positive" : "negative") : undefined;
    else
        hasVoted = "positive";
    return {
        rating: rating.getValue(lit.fields.RATING),
        author: rating.getValue(lit.fields.AUTHOR),
        date: rating.getValue(lit.fields.TIMESTAMP),
        summary: rating.getValue(lit.fields.CONTENT),
        id: rating.getValue(lit.fields.ID),
        votes: rating.getValue(lit.fields.NETVOTES),
        isSelf: true,
        //type: lit.tables.RATING,
        voted: hasVoted
    };
}

