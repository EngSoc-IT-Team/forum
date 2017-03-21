/*
 * listHandler.js
 * Written by Michael Albinson 2/15/17
 *
 * Logic for handling requests from the list page.
 */

"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals.js');
var log = require('./../log');
var searcher = require('./../actions/Searcher');
var voter = require('./../actions/Voter');
var recursion = require('./../recursion');


/** listRequest(request)
 * Handles requests from the list page
 *
 * @param request: the express request
 * @returns {Promise}
 */

//TODO: add hidden handling -- or just avoid them

exports.handle = function(request) {
    var info = [];
    var userID = request.signedCookies.usercookie.userID;
    return new Promise(function(resolve, reject) {
        var items = new DBRow(lit.ITEM_TABLE);

        if (request.query.hasOwnProperty('query'))
            return useSearch(resolve, reject, request);

        for (var key in request.query)
            items.addQuery(key, lit.LIKE, '%' + request.query[key] + '%'); //TODO: Fix tag handling (should be able to get post by tag for any item)

        items.orderBy(lit.FIELD_TIMESTAMP, lit.DESC);
        items.setLimit(20);
        items.query().then(function() {
            recursion.recursiveGetWithVotes(resolve, reject, items, listInfo, userID, [info]);
        }).catch(function() {
            reject(false);
        });
    });
};

function listInfo(item, vote, type, list) {
    var hasVoted = vote ? (vote.getValue(lit.FIELD_VOTE_VALUE) ? "positive" : "negative") : undefined; // true if there is a vote, false if there is no vote
    var voteValue;
    if (type == 'post' || type == 'link')
        voteValue = vote ? vote.getValue(lit.FIELD_VOTE_VALUE) : 0;

    var data;
    switch(type) { //TODO: still need isSubscribed and isSaved information about each row
        case('post'):
            data = {
                id: item.getValue(lit.FIELD_ID),
                title: item.getValue(lit.FIELD_TITLE),
                votes: item.getValue(lit.FIELD_NETVOTES),
                author: item.getValue(lit.FIELD_AUTHOR),
                date: item.getValue(lit.FIELD_TIMESTAMP),
                summary: item.getValue(lit.FIELD_CONTENT),
                type: lit.POST_TABLE,
                tags: item.getValue(lit.FIELD_TAGS),
                voted: hasVoted,
                voteValue: voteValue
            };
            break;
        case('link'):
            data = {
                id: item.getValue(lit.FIELD_ID),
                title: item.getValue(lit.FIELD_TITLE),
                votes: item.getValue(lit.FIELD_NETVOTES),
                author: item.getValue(lit.FIELD_ADDED_BY),
                date: item.getValue('datetime'),
                summary: item.getValue(lit.FIELD_SUMMARY),
                type: lit.LINK_TABLE,
                tags: item.getValue(lit.FIELD_TAGS),
                url: item.getValue(lit.FIELD_LINK),
                voted: hasVoted,
                voteValue: voteValue
            };
            break;
        case('class'):
            data = {
                id: item.getValue(lit.FIELD_ID),
                title: item.getValue(lit.FIELD_TITLE),
                courseCode: item.getValue(lit.FIELD_COURSE_CODE),
                rating: item.getValue(lit.FIELD_AVERAGE_RATING),
                author: item.getValue(lit.FIELD_ADDED_BY),
                summary: item.getValue(lit.FIELD_SUMMARY),
                type: lit.CLASS_TABLE,
                tags: item.getValue(lit.FIELD_TAGS),
                voted: hasVoted
            };
            break;
        default:
            break;
    }
    list[0].push(data);
}

function useSearch(resolve, reject, request) {
    var info = [];
    var userID = request.signedCookies.usercookie.userID;
    searcher.searchByUserTag(request.query.query).then(function(res) {
        recursion.recursiveGetListWithVotes(resolve, reject, res, listInfo, userID, [info], 0);
    }).catch(function(err) {
        reject(err);
    });
}