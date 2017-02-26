/* Voter
 *
 * Written by Michael Albinson, 2/8/17
 *
 * Methods and logic that carries out actions on votes
 * TODO: should be able to eventually get vote values through here efficiently
 *
 */

"use strict";

var DBRow = require('./DBRow').DBRow;
var lit = require('./Literals');
var log = require('./log');

/*
 * Adds the vote to the specified item
 */
exports.vote = function(userId, itemId, voteValue) {
    return new Promise(function(resolve, reject) {
        var row = new DBRow(lit.VOTE_TABLE);
        row.setValue(lit.FIELD_USER_ID, userId);
        row.setValue(lit.FIELD_ITEM_ID, itemId);
        row.setValue(lit.FIELD_VOTE_VALUE, voteValue);
        row.insert().then(function() {
            resolve();
        }, function(err) {
            log.error(err);
            reject(err);
        });
    });
};

/*
 * Modifies an existing vote on an item
 * SHOULD NOT BE USED if the vote value is trying to be changed to the current value
 */
exports.changeVote = function(userId, itemId, newVoteValue) {
    return new Promise(function(resolve, reject) {
        var row = new DBRow(lit.VOTE_TABLE);
        row.addQuery(lit.FIELD_USER_ID, userId);
        row.addQuery(lit.FIELD_ITEM_ID, itemId);
        row.query().then(function () {
            if (!row.next())
                reject("No matching votes found");
            else {
                row.setValue(lit.FIELD_VOTE_VALUE, newVoteValue);
                row.update().then(function () {
                    resolve();
                }, function (err) {
                    log.error(err);
                    reject(err);
                });
            }
        });
    });
};
