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


/** listRequest(request)
 * Handles requests from the list page
 *
 * @param request: the express request
 * @returns {Promise}
 */

//TODO: add hidden handling -- or just avoid them

exports.handle = function (request) {
    var info = [];
    var userID = request.signedCookies.usercookie.userID;
    return new Promise(function (resolve, reject) {
        var items = new DBRow(lit.ITEM_TABLE);

        if (request.query.hasOwnProperty('query'))
            return useSearch(resolve, reject, request);

        for (var key in request.query)
            items.addQuery(key, lit.LIKE, '%' + request.query[key] + '%'); //TODO: Fix tag handling (should be able to get post by tag for any item)

        items.orderBy(lit.FIELD_TIMESTAMP, lit.DESC);
        items.setLimit(20);
        items.query().then(function () {
            recursion.recursiveGetWithVotes(resolve, reject, items, itemInfo.generalInfo, userID, [info]);
        }).catch(function () {
            reject(false);
        });
    });
};

function useSearch(resolve, reject, request) {
    var info = [];
    var userID = request.signedCookies.usercookie.userID;
    searcher.searchForContent(request.query.query, lit.POST_TABLE).then(function (res) {
        recursion.recursiveGetListWithVotes(resolve, reject, res, itemInfo.generalInfo, userID, [info], 0);
    }).catch(function (err) {
        reject(err);
    });
}