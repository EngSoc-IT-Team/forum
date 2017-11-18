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
var recursion = require('./../recursion');
var itemInfo = require('./itemInfoGetter');

//TODO: add hidden handling -- or just avoid them

/** Handles requests from the list page and resolves a list of matching items for the query, or uses the Searcher functionality
 * to use more advanced query parsing. Resolves an array of JSON objects containing
 *
 * @param request: the express request from the client
 */
exports.handle = function (request) {
    var info = [];
    var userID = request.signedCookies.usercookie.userID;
    return new Promise(function (resolve, reject) {
        var items = new DBRow(lit.tables.ITEM);

        if (request.query.hasOwnProperty('query'))
            return useSearch(resolve, reject, request);

        if (request.query.hasOwnProperty('advanced') && request.query.advanced === true)
            return executeAdvanced(resolve, reject, request);

        for (var key in request.query)
            items.addQuery(key, lit.sql.query.LIKE, '%' + request.query[key] + '%'); //TODO: Fix tag handling (should be able to get post by tag for any item)

        items.orderBy(lit.fields.TIMESTAMP, lit.sql.query.DESC);
        items.setLimit(20);
        items.query().then(function () {
            recursion.recursiveGetWithVotes(resolve, reject, items, itemInfo.generalInfo, userID, [info]);
        }).catch(function () {
            reject(false);
        });
    });
};

/** Uses the Searcher's searchForContent function parse a search query string to build the list page's information array.
 *
 * @param resolve: The handle function's resolution
 * @param reject: The handle function's rejection
 * @param request: The express server's request
 */
function useSearch(resolve, reject, request) {
    var info = [];
    var userID = request.signedCookies.usercookie.userID;
    searcher.searchForContent(request.query.query).then(function (res) {
        recursion.recursiveGetListWithVotes(resolve, reject, res[0], res[1], itemInfo.generalInfo, userID, [info], 0);
    }).catch(function (err) {
        reject(err);
    });
}

function executeAdvanced(resolve, reject, request) {
    // does search
}