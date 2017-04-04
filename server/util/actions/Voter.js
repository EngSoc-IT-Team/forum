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

/** Adds a vote to the specified item so long as the user does not already have a vote on the item
 *
 * @param userId: the id of the user wanting to insert the vote
 * @param itemId: the id of the item to vote on
 * @param voteValue: the value of the vote (0 for -1, 1 for +1)
 *
 * Resolves true if the vote is successful, otherwise resolves a message that the user has already voted on the given item
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

/** Modifies an existing vote on an item
 * SHOULD NOT BE USED if the vote value is trying to be changed to the current value
 *
 * @param userId: the id of the user wanting to edit the vote
 * @param itemId: the id of the item to vote on
 * @param newVoteValue: the changed
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

/** Gets the vote for the user and item specified
 *
 * @param userId: the id of the user wanting to edit the vote
 * @param itemId: the id of the item to vote on
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

/** Inserts a new vote and updates the vote count of the corresponding item
 *
 * @param userId: the id of the user wanting to edit the vote
 * @param itemId: the id of the item to vote on
 * @param voteValue: the value of the new vote (0 for -1, 1 for +1)
 * @param type: the type of item being voted on
 */
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

/** Edits vote and updates the vote count of the corresponding item
 *
 * @param userId: the id of the user wanting to edit the vote
 * @param itemId: the id of the item to vote on
 * @param voteValue: the new value of the modified vote (0 for -1, 1 for +1)
 * @param type: the type of item being voted on
 */
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

/** Updates the item with the new vote count after a vote has been inserted or edited
 *
 * @param itemID: the id of the item to vote on
 * @param voteValue: the value of the vote (0 for -1, 1 for +1)
 * @param type: the type of item being voted on
 * @param voteIsUpdated: indicates if the vote added is a new vote or a modified vote
 */
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