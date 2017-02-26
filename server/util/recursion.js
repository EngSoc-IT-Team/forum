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