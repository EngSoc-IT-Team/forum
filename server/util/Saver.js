"use strict";

/* Saver
 *
 * Written by Michael Albinson, 2/8/17
 *
 * Methods and logic pertinent to saving items
 *
 */

var DBRow = require('./DBRow').DBRow;
var lit = require('./Literals');
var log = require('./log');

/*
 * Saves the specified item for a user
 */
exports.save = function(userId, itemId, type) {
    return new Promise(function(resolve, reject) {
        var row = new DBRow(lit.SAVED_TABLE);
        row.setValue(lit.FIELD_USER_ID, userId);
        row.setValue(lit.FIELD_ITEM_ID, itemId);
        row.setValue(lit.FIELD_TYPE, type);
        row.insert().then(function() {
            resolve();
        }, function(err) {
            log.error(err);
            reject(err);
        }).catch(function(err) {
            reject(err)
        });
    });
};

/*
 * Deletes the save record
 */
exports.removeSave = function(userId, itemId) {
    return new Promise(function(resolve, reject) {
        var row = new DBRow(lit.SAVED_TABLE);
        row.addQuery(lit.FIELD_USER_ID, userId);
        row.addQuery(lit.FIELD_ITEM_ID, itemId);
        row.query().then(function () {
            if (!row.next())
                reject("No matching rows found");
            else {
                row.delete(row.getValue(lit.FIELD_ID)).then(function () {
                    resolve();
                }, function (err) {
                    log.error(err);
                    reject(err);
                });
            }
        }).catch(function(err) {
            reject(err);
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
            if (!row.count())
                reject(false);
            else
                resolve(true);
        }).catch(function(err) {
            reject(err);
        });
    });
};
