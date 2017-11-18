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
var searcher = require('./actions/Searcher');
var log = require('./log');

/** recursiveGet(resolve, reject, rowsToGet, action, actionArgs)
 * NOTE: the action function MUST be synchronous
 *
 * @param resolve: the resolve function of the calling function's promise
 * @param reject: the reject function of the calling function's promise
 * @param rowsToGet: the DBRow object containing ids of the rows to get
 * @param action: the function to execute after each row is retrieved
 * @param actionArgs: the function arguments, if any, that need to be passed to the action function
 */

exports.recursiveGet = function (resolve, reject, rowsToGet, action, actionArgs) {
    if (!rowsToGet.next())
        resolve(actionArgs);
    else {
        var item = new DBRow(rowsToGet.getValue(lit.sql.TYPE));
        item.getRow(rowsToGet.getValue(lit.fields.ITEM_ID)).then(function () {
            action(rowsToGet, item, actionArgs);
            exports.recursiveGet(resolve, reject, rowsToGet, action, actionArgs)

        }, function (err) {
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

exports.recursiveGetWithVotes = function (resolve, reject, rowsToGet, action, userID, actionArgs) {
    if (!rowsToGet.next())
        resolve(actionArgs);
    else {
        var type = rowsToGet.getValue(lit.fields.TYPE);
        var item = new DBRow(type);
        item.getRow(rowsToGet.getValue(lit.fields.ITEM_ID)).then(function () {
            if (type == 'link' || type == 'post') {
                voter.getVote(userID, rowsToGet.getValue(lit.fields.ITEM_ID)).then(function (vote) {
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
                var u = new DBRow(lit.tables.USER);
                u.getRow(userID).then(function () {
                    rater.getRating(u.getValue(lit.fields.USERNAME), item.getValue(lit.fields.ID)).then(function (rating) {
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

        }, function (err) {
            reject(actionArgs, err);

        });
    }
};

exports.recursiveGetListWithVotes = function (resolve, reject, rowList, tableList, action, userID, actionArgs, index) {
    if (index > rowList.length) //tableList and rowList have the same length
        resolve(actionArgs);
    else {
        var current = rowList[index];
        if (!current)
            return exports.recursiveGetListWithVotes(resolve, reject, rowList, tableList, action, userID, actionArgs, ++index);
        var content = new DBRow(tableList[index]);
        content.getRow(current).then(function () {
            voter.getVote(userID, current).then(function (vote) {
                if (vote)
                    action(content, vote, tableList[index], actionArgs);
                else {
                    action(content, undefined, tableList[index], actionArgs);
                }
                exports.recursiveGetListWithVotes(resolve, reject, rowList, tableList, action, userID, actionArgs, ++index)
            }, function (err) {
                reject(actionArgs, err);
            });
        });
    }
};

/**
 * Function that recursively queries multiple tables for each row of each table's generated tags.
 * @param resolve The Promise resolve used to make the code act synchronously.
 * @param reject The Promise reject used to pass errors up the Promise chains.
 * @param tables The tables to be queried.
 * @param index The current table to be queried within tables.
 * @param allDocInfo One information object (id, measure, table) is added for each row of each table.
 * @param queryOneTable Function parameter that queries one table and gets the generated tags for each row in that table.
 */
exports.recursiveGetTagsMultiTables = function (resolve, reject, tables, index, allDocInfo, queryOneTable) {
    if (index > tables.length - 1) {
        resolve(allDocInfo);
    } else {
        queryOneTable(tables[index]).then(function (oneDoc) {
            allDocInfo = allDocInfo.concat(oneDoc);
            exports.recursiveGetTagsMultiTables(resolve, reject, tables, ++index, allDocInfo, queryOneTable);
        }).catch(function (err) {
            log.error("recursiveGetTagsMultiTables error: " + err);
            reject(err);
        });
    }
};

/**
 * Function that recursively retrieves the generated tags for each row from a given table.
 * @param resolve The Promise resolve used to make the code act synchronously.
 * @param reject The Promise reject used to pass errors up the Promise chains.
 * @param row The individual row of a table that each recursive call is using.
 * @param addDocument Function to add the tags to the wordRelater in Searcher.js.
 * @param table The table row is in.
 * @param docInfo An object holding a placeholder measure for wordRelater and the ID of the row.
 * @returns {*} An array is built with each recursive call to eventually be an array of all docInfo's made
 */
exports.recursiveGetTags = function (resolve, reject, row, addDocument, table, docInfo) {
    if (!row.next()) {
        resolve(docInfo);
    } else {
        var genTags = row.getValue(lit.fields.GEN_TAGS);
        if (genTags !== null) {
            docInfo.push(addDocument(genTags, row, table));
            exports.recursiveGetTags(resolve, reject, row, addDocument, table, docInfo);
        } else {
            searcher.generateTags(row, table).then(function (tags) {
                docInfo.push(addDocument(tags, row, table));
                exports.recursiveGetTags(resolve, reject, row, addDocument, table, docInfo);
            }).catch(function (err) {
                log.error("recursiveGetTags error: " + err);
                reject(err);
            });
        }
    }
};