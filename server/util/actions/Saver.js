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

/** Saves the specified item for a user so long as they have not already saved it
 *
 * @param request: the express server request containing the save
 *
 * Resolves true if the save is successful, resolves the error otherwise
 */
exports.save = function(request) {
    var userID = request.signedCookies.usercookie.userID;
    var itemID = request.body.itemId;
    return new Promise(function(resolve, reject) {
        exports.isSaved(userID, itemID).then(function(res) {
            if (!res) {
                var row = new DBRow(lit.tables.SAVED);
                row.setValue(lit.fields.USER_ID, request.signedCookies.usercookie.userID);
                row.setValue(lit.fields.ITEM_ID, request.body.itemId);
                row.setValue(lit.fields.TYPE, request.body.contentType);
                row.insert().then(function() {
                    resolve(true);
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

/** Deletes the save record
 *
 * @param request: the express server request containing the information about the save to delete
 *
 * Resolves true if the save deletion is successful, the error for the reason if it was not inserted otherwise
 */
exports.removeSave = function(request) {
    var userID = request.signedCookies.usercookie.userID;
    var itemID = request.body.itemId;
    return new Promise(function(resolve, reject) {
        exports.isSaved(userID, itemID).then(function(row) {
            if (row) {
                row.delete(row.getValue(lit.fields.ID)).then(function () {
                    resolve(true);
                }).catch(function (err) {
                    log.error(err);
                    reject(err);
                });
            }
        });
    });
};

/** Checks if the user has saved the specified item
 *
 * @param userId: the id of the user who may have saved an item
 * @param itemId: the item id that the user may have saved
 */
exports.isSaved = function(userId, itemId) {
    return new Promise(function(resolve, reject) {
        var row = new DBRow(lit.tables.SAVED);
        row.addQuery(lit.fields.USER_ID, userId);
        row.addQuery(lit.fields.ITEM_ID, itemId);
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
