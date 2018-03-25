/*
*feedbackHandler.js
* Written by Krishna Iyer 11/12/2017
*
* Handles requests from the feedback page
*/

"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals.js');


exports.handle = function(request) {
    return new Promise(function (resolve, reject) {
        var feedback = new DBRow(lit.tables.FEEDBACK);
        var userID = request.signedCookies.usercookie.userID;
        feedback.setValue(lit.fields.USER_ID, userID);
        feedback.setValue(lit.fields.TYPE, request.body.type);
        feedback.setValue(lit.fields.CONTENT, request.body.feedbackContent);
        feedback.insert().then(function () {
            resolve(true);

        }).catch(function (err, message) {
            reject("Error");
        });
    })
}

