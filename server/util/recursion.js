/*
 * recursion.js
 * Written by Michael Albinson 2/15/17
 *
 * A (hopefully growing) collection of recursive promise functions to
 * ease getting large numbers of rows and doing the same things to them.
 */

"use strict";

var DBRow = require('./DBRow').DBRow;
var lit = require('./Literals');

/** recursiveGet(resolve, reject, rowsToGet, action, actionArgs)
 * NOTE: the action function MUST be synchronous
 *
 * @param resolve: the resolve function of the calling function's promise
 * @param reject: the reject function of the calling function's promise
 * @param rowsToGet: the DBRow object containing ids of the rows to get
 * @param action: the function to execute after each row is retrieved
 * @param actionArgs: the function arguments, if any, that need to be passed to the action function
 */

exports.recursiveGet = function(resolve, reject, rowsToGet, action, actionArgs) {
    if (!rowsToGet.next())
        resolve(actionArgs);
    else {
        var item = new DBRow(rowsToGet.getValue(lit.TYPE));
        item.getRow(rowsToGet.getValue(lit.FIELD_ITEM_ID)).then(function() {
            action(rowsToGet, item, actionArgs);
            exports.recursiveGet(resolve, reject, rowsToGet, action, actionArgs)

        }, function(err) {
            reject(actionArgs, err);

        });
    }
};

/** recursiveGetWithVotes(resolve, reject, rowsToGet, action, actionArgs)
 * A modified version of recursive get that gets the vote or comment associated with the item.
 *
 * @param resolve: the resolve function of the calling function's promise
 * @param reject: the reject function of the calling function's promise
 * @param rowsToGet: the DBRow object containing ids of the rows to get
 * @param action: the function to execute after each row is retrieved
 * @param actionArgs: the function arguments, if any, that need to be passed to the action function
 * @param userID: the userID of the user to get votes for
 */

exports.recursiveGetWithVotes = function(resolve, reject, rowsToGet, action, userID, actionArgs) {
    if (!rowsToGet.next())
        resolve(actionArgs);
    else {
        var type = rowsToGet.getValue(lit.FIELD_TYPE);
        var item = new DBRow(type);
        item.getRow(rowsToGet.getValue(lit.FIELD_ITEM_ID)).then(function() {
            if (type == 'link' || type == 'post') {
                var vote = new DBRow(lit.VOTE_TABLE);
                vote.addQuery(lit.FIELD_ITEM_ID, rowsToGet.getValue(lit.FIELD_ITEM_ID));
                vote.addQuery(lit.FIELD_USER_ID, userID);
                vote.query().then(function () {
                    if (vote.next())
                        action(rowsToGet, item, vote, type, actionArgs);
                    else
                        action(rowsToGet, item, undefined, type, actionArgs);

                    exports.recursiveGetWithVotes(resolve, reject, rowsToGet, action, userID, actionArgs)
                }, function (err) {
                    reject(actionArgs, err);
                });
            }
            else {
                var u = new DBRow(lit.USER_TABLE);
                u.getRow(userID).then(function() {
                    var rating = new DBRow(lit.RATING_TABLE);
                    rating.addQuery(lit.FIELD_PARENT, rowsToGet.getValue(lit.FIELD_ITEM_ID));
                    rating.addQuery(lit.FIELD_AUTHOR, u.getValue(lit.FIELD_USERNAME));
                    rating.query().then(function () {
                        if (rating.next())
                            action(rowsToGet, item, rating, type, actionArgs);
                        else
                            action(rowsToGet, item, undefined, type, actionArgs);

                        exports.recursiveGetWithVotes(resolve, reject, rowsToGet, action, userID, actionArgs)
                    }, function (err) {
                        reject(actionArgs, err);
                    });
                })
            }

        }, function(err) {
            reject(actionArgs, err);

        });
    }
};