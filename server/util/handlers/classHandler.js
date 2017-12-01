/*
 * classResponder.js
 * Written by Michael Albinson 2/28/17
 */

"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals.js');
var rater = require('./../actions/Rater');

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
                getClassInfo(cl, info);
                rater.getRatingList(cl.getValue(lit.fields.ID), info, resolve);
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
 */
function getClassInfo(cl, info) {
    info.class = {
        courseCode: cl.getValue(lit.fields.COURSE_CODE),
        title: cl.getValue(lit.fields.TITLE),
        summary: cl.getValue(lit.fields.SUMMARY),
        prereqs: cl.getValue(lit.fields.PREREQS),
        instructor: cl.getValue(lit.fields.INSTRUCTOR),
        credit: cl.getValue(lit.fields.CREDIT),
        tags: cl.getValue(lit.fields.TAGS),
        rating: cl.getValue(lit.fields.AVERAGE_RATING),
        isDuplicate: cl.getValue(lit.fields.DUPLICATE),
        id: cl.getValue(lit.fields.ID)
    }
}