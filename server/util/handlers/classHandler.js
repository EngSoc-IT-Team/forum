/*
 * classResponder.js
 * Written by Michael Albinson 2/28/17
 */

"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals.js');
var rater = require('./../actions/Rater');

exports.handle = function(request) {
    var info = {class: {}, reviews: []};
    return new Promise(function(resolve, reject) {
        var cl = new DBRow(lit.CLASS_TABLE);
        cl.getRow(request.query.id).then(function() {
            if (cl.count() > 0) {
                getClassInfo(cl, info);
                rater.getRatingList(cl.getValue(lit.FIELD_ID), info, resolve);
            }
            else
                reject("The class does not exist");
        });
    });
};

function getClassInfo(cl, info) {
    info.class = {
        courseCode: cl.getValue(lit.FIELD_COURSE_CODE),
        title: cl.getValue(lit.FIELD_TITLE),
        summary: cl.getValue(lit.FIELD_SUMMARY),
        prereqs: cl.getValue(lit.FIELD_PREREQS),
        instructor: cl.getValue(lit.FIELD_INSTRUCTOR),
        credit: cl.getValue(lit.FIELD_CREDIT),
        tags: cl.getValue(lit.FIELD_TAGS),
        rating: cl.getValue(lit.FIELD_AVERAGE_RATING),
        isDuplicate: cl.getValue(lit.FIELD_DUPLICATE),
        id: cl.getValue(lit.FIELD_ID)
    }
}