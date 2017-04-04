"use strict";

/* Saver
 *
 * Written by Michael Albinson, 2/8/17
 *
 * Methods and logic pertinent to reporting items
 *
 */

var DBRow = require('../DBRow').DBRow;
var lit = require('../Literals');
var log = require('../log');

/** Enters the report into the database
 *
 * @param userId: the id of the user making the report
 * @param itemId: the id of the item being reported
 * @param reportReason: the integer representing the report reason
 * @param reportContent: the string content of the report
 */
exports.sendReport = function(userId, itemId, reportReason, reportContent) {
    return new Promise(function(resolve, reject) {
        exports.hasBeenReported(userId, itemId).then(function(res) {
            if (res)
                reject('sendReport error: This item has already been reported by this user');

            var report = new DBRow(lit.REPORT_TABLE);
            report.setValue(lit.FIELD_USER_ID, userId);
            report.setValue(lit.FIELD_RELATED_ITEM_ID, itemId);
            report.setValue(lit.FIELD_REPORT_REASON, reportReason);
            report.setValue(lit.FIELD_REPORT, reportContent);
            report.insert().then(function() {
                resolve(true);
            }).catch(function (err) {
                log.error("sendReport error: " + err);
                reject(false);
            });
        });

    });
};

/** Resolves the report in the database so that it is known that the issue in the report
 * has been fixed
 *
 * @param reportId: The id of the report to resolve.
 *
 * TODO: Figure out how to specify that a report has been resolved
 */
exports.resolveReport = function(reportId) {
    return new Promise(function(resolve, reject) {
        var report = new DBRow(lit.REPORT_TABLE);
        report.getRow(reportId).then(function() {
            // TODO: resolve the report somehow
            resolve(true);
        }).catch(function (err) {
            log.error("sendReport error: " + err);
            reject(false);
        });
    });
};

/** Checks to see if the given user has already reported the provided item
 *
 * @param userID: the ID of the user who reported the item
 * @param itemID: the ID of the reported item
 */
exports.hasBeenReported = function(userID, itemID) {
    return new Promise(function(resolve, reject) {
        var report = new DBRow(lit.REPORT_TABLE);
        report.addQuery(lit.FIELD_USER_ID, userID);
        report.addQuery(lit.FIELD_ITEM_ID, itemID);
        report.query(reportId).then(function() {
            if (report.next())
                resolve(report);
            else
                resolve(false);
        }).catch(function (err) {
            log.error("sendReport error: " + err);
            reject(false);
        });
    });
};