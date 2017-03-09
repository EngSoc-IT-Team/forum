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
var recursiveGet = require('./../recursion').recursiveGet;


/** listRequest(request)
 * Handles requests from the list page
 *
 * @param request: the express request
 * @returns {Promise}
 */

//TODO: add hidden handling -- or just avoid them

exports.handle = function(request) {
    var info = [];
    return new Promise(function(resolve, reject) {
        var items = new DBRow(lit.CONTRIBUTION_TABLE);
        for (var key in request.query)
            items.addQuery(key, request.query[key]);

        items.orderBy(lit.FIELD_TIMESTAMP, lit.DESC);
        items.setLimit(20);
        items.query().then(function() {
            recursiveGet(resolve, reject, items, listInfo, [info]);
        }).catch(function(err) {
            log.error(err.message);
            reject(false);
        });
    });
};

function listInfo(row, item, list) {
    var data;
    switch(row.getValue(lit.FIELD_TYPE)) {
        case('post'):
            data = {
                id: item.getValue(lit.FIELD_ID),
                title: item.getValue(lit.FIELD_TITLE),
                votes: item.getValue(lit.FIELD_NETVOTES),
                author: item.getValue(lit.FIELD_AUTHOR),
                date: row.getValue(lit.FIELD_TIMESTAMP),
                summary: item.getValue(lit.FIELD_CONTENT),
                type: row.getValue(lit.FIELD_TYPE),
                tags: item.getValue(lit.FIELD_TAGS)
            };
            break;
        case('link'):
            data = {
                id: item.getValue(lit.FIELD_ID),
                title: item.getValue(lit.FIELD_TITLE),
                votes: item.getValue(lit.FIELD_NETVOTES),
                author: item.getValue(lit.FIELD_ADDED_BY),
                date: row.getValue(lit.FIELD_TIMESTAMP),
                summary: item.getValue(lit.FIELD_SUMMARY),
                type: row.getValue(lit.FIELD_TYPE),
                tags: item.getValue(lit.FIELD_TAGS),
                url: item.getValue(lit.FIELD_LINK)
            };
            break;
        case('class'):
            data = {
                id: item.getValue(lit.FIELD_ID),
                title: item.getValue(lit.FIELD_TITLE),
                courseCode: item.getValue(lit.FIELD_COURSE_CODE),
                rating: item.getValue(lit.FIELD_AVERAGE_RATING),
                author: item.getValue(lit.FIELD_ADDED_BY),
                date: row.getValue(lit.FIELD_TIMESTAMP),
                summary: item.getValue(lit.FIELD_SUMMARY),
                type: row.getValue(lit.FIELD_TYPE),
                tags: item.getValue(lit.FIELD_TAGS)
            };
            break;
        default:
            break;
    }

    list[0].push(data);
}