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
var voter = require('./actions/Voter');
var rater = require('./actions/Rater');

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
                voter.getVote(userID, rowsToGet.getValue(lit.FIELD_ITEM_ID)).then(function (vote) {
                    if (vote)
                        action(item, vote, type, actionArgs);
                    else
                        action(item, undefined, type, actionArgs);

                    exports.recursiveGetWithVotes(resolve, reject, rowsToGet, action, userID, actionArgs)
                }, function (err) {
                    reject(actionArgs, err);
                });
            }
            else {
                var u = new DBRow(lit.USER_TABLE);
                u.getRow(userID).then(function() {
                    rater.getRating(u.getValue(lit.FIELD_USERNAME), item.getValue(lit.FIELD_ID)).then(function(rating) {
                        if (rating)
                            action(item, rating, type, actionArgs);
                        else
                            action(item, undefined, type, actionArgs);

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

exports.recursiveGetListWithVotes = function(resolve, reject, rowList, action, userID, actionArgs, index) {
    if (index > rowList.length)
        resolve(actionArgs);
    else {
        var current = rowList[index];
        if (!current)
            return exports.recursiveGetListWithVotes(resolve, reject, rowList, action, userID, actionArgs, ++index);

        var post = new DBRow(lit.POST_TABLE);
        post.getRow(current).then(function () {
            voter.getVote(userID,current).then(function (vote) {
                if (vote)
                    action(post, vote, 'post', actionArgs);
                else
                    action(post, undefined, 'post', actionArgs);

                exports.recursiveGetListWithVotes(resolve, reject, rowList, action, userID, actionArgs, ++index)
            }, function (err) {
                reject(actionArgs, err);
            });
        });
    }
};