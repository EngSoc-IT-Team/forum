/* Voter
 *
 * Written by Michael Albinson, 2/8/17
 *
 * Methods and logic that carries out actions on votes
 *
 */

"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals');
var log = require('./../log');

/*
 * Adds the vote to the specified item
 */
exports.vote = function(userId, itemId, voteValue) {
    return new Promise(function(resolve, reject) {
        exports.getVote(userId, itemId).then(function (vote) {
            if (!vote) {
                var row = new DBRow(lit.VOTE_TABLE);
                row.setValue(lit.FIELD_USER_ID, userId);
                row.setValue(lit.FIELD_ITEM_ID, itemId);
                row.setValue(lit.FIELD_VOTE_VALUE, voteValue);
                row.insert().then(function () {
                    resolve(true);
                }, function (err) {
                    log.error(err);
                    reject(err);
                });
            }
            else
                resolve('already voted');
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

/*
 * Gets the vote for the user and item specified
 */

exports.getVote = function(userId, itemId) {
    return new Promise(function(resolve) {
        var vote = new DBRow(lit.VOTE_TABLE);
        vote.addQuery(lit.FIELD_USER_ID, userId);
        vote.addQuery(lit.FIELD_ITEM_ID, itemId);
        vote.query().then(function() {
            if (!vote.next())
                return resolve(undefined);

            resolve(vote);
        });
    });
};

exports.voteAndUpdateItem = function(userId, itemId, voteValue, type) {
    return new Promise(function(resolve, reject) {
        exports.vote(userId, itemId, voteValue).then(function() {
            updateItem(itemId, voteValue, type).then(function() {
                resolve(true);
            }, function(err) {
                log.error(err);
                reject(err);
            })
        }, function(err) {
            log.error(err);
            reject(err);
        });
    });
};

exports.updateVoteAndItem = function(userId, itemId, voteValue, type) {
    return new Promise(function(resolve, reject) {
        exports.changeVote(userId, itemId, voteValue).then(function() {
            updateItem(itemId, voteValue, type, true).then(function() {
                resolve(true);
            }, function(err) {
                log.error(err);
                reject(err);
            })
        }, function(err) {
            log.error(err);
            reject(err);
        });
    });
};

function updateItem(itemID, voteValue, type, voteIsUpdated) {
    var netChange = (voteIsUpdated ? 2 : 1) * (voteValue ? 1 : -1);
    return new Promise(function(resolve, reject) {
        var it = new DBRow(type);
        it.getRow(itemID).then(function() {
            it.setValue(lit.FIELD_NETVOTES, it.getValue(lit.FIELD_NETVOTES) + netChange);
            it.update().then(function() {
                resolve();
            }, function(err) {
                reject(err);
            })
        }, function(err) {
            reject(err);
        })
    });
}