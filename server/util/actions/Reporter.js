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

/*
 * Enters the report into the database
 *
 */

exports.sendReport = function(userId, itemId, reportReason, reportContent) {
    return new Promise(function(resolve, reject) {
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
};

/*
 * Resolves the report in the database so that it is known that the issue in the report
 * has been fixed
 * @param reportId The id of hte report to resolve.
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