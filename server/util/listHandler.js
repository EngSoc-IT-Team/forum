"use strict";

var DBRow = require('./DBRow').DBRow;
var lit = require('./Literals.js');
var log = require('./log');
var recursiveGet = require('./recursion').recursiveGet;


/** listRequest(request)
 * Handles requests from the list page
 *
 * @param request: the express request
 * @returns {Promise}
 */

exports.handle = function(request) {
    var info = [];
    return new Promise(function(resolve, reject) {
        var items = new DBRow(lit.CONTRIBUTION_TABLE);
        for (var key in request.query)
            items.addQuery(key, request.query[key]);

        items.orderBy(lit.FIELD_DATE, lit.ASC);
        items.setLimit(10);
        items.query().then(function() {
            recursiveGet(resolve, reject, items, listInfo, [info]);
        }).catch(function(err) {
            log.error(err.message);
            reject(false);
        });
    });
};

function listInfo(row, item, list) {
    var data = {
        id: item.getValue(lit.FIELD_ID),
        title: item.getValue(lit.FIELD_TITLE),
        votes: item.getValue(lit.FIELD_NETVOTES),
        author: item.getValue(lit.FIELD_AUTHOR),
        date: row.getValue(lit.FIELD_DATE),
        summary: item.getValue(lit.FIELD_CONTENT),
        type: row.getValue(lit.FIELD_TYPE),
        tags: item.getValue(lit.FIELD_TAGS)
    };
    list[0].push(data);
}