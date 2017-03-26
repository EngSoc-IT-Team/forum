"use strict";

/* Saver
 *
 * Written by Michael Albinson, 2/8/17
 *
 * Methods and logic pertinent to saving items
 *
 */

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals');
var log = require('./../log');

/*
 * Saves the specified item for a user
 */
exports.save = function(request) {
    var userID = request.signedCookies.usercookie.userID;
    var itemID = request.body.itemId;
    return new Promise(function(resolve, reject) {
        exports.isSaved(userID, itemID).then(function(res) {
            if (!res) {
                var row = new DBRow(lit.SAVED_TABLE);
                row.setValue(lit.FIELD_USER_ID, request.signedCookies.usercookie.userID);
                row.setValue(lit.FIELD_ITEM_ID, request.body.itemId);
                row.setValue(lit.FIELD_TYPE, request.body.contentType);
                row.insert().then(function() {
                    resolve();
                }).catch(function(err) {
                    log.error(err);
                    reject(err);
                });
            }
            else
                reject('Save already exists for this user-item pair');
        }).catch(function(err) {
            log.error(err);
            reject(err);
        })
    });
};

/*
 * Deletes the save record
 */
exports.removeSave = function(request) {
    var userID = request.signedCookies.usercookie.userID;
    var itemID = request.body.itemId;
    return new Promise(function(resolve, reject) {
        exports.isSaved(userID, itemID).then(function(row) {
            if (row) {
                row.delete(row.getValue(lit.FIELD_ID)).then(function () {
                    resolve(true);
                }).catch(function (err) {
                    log.error(err);
                    reject(err);
                });
            }
        });
    });
};

/*
 * Checks if the user has saved the specified item
 */
exports.isSaved = function(userId, itemId) {
    return new Promise(function(resolve, reject) {
        var row = new DBRow(lit.SAVED_TABLE);
        row.addQuery(lit.FIELD_USER_ID, userId);
        row.addQuery(lit.FIELD_ITEM_ID, itemId);
        row.query().then(function () {
            if (!row.next())
                resolve(false);
            else
                resolve(row);
        }).catch(function(err) {
            log.error(err);
            reject(err);
        });
    });
};
