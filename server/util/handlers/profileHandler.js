/*
 * profileHandler.js
 * Written by Micahel Albinson 2/15/17
 */

"use strict";

var Aggregator = require('./../aggregator');
var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals.js');
var recursion = require('./../recursion');
var itemInfo = require('./itemInfoGetter');

/** Handles requests from the profile page and resolves with the relevant information that will be displayed on the profile
 * page about a user's contributions, saves and subscriptions if the user is looking at their own profile, or just their
 * contributions if the user is looking at someone else's profile.
 *
 * @param request: The express request received by the express server
 */
exports.handle = function(request) {
    var info = {
        profile: {},
        tags: [],
        items: {
            subscribed: [],
            saved: [],
            contributions: []
        }
    };
    var user = new DBRow(lit.USER_TABLE);

    return new Promise(function(resolve, reject) {
        //if we are getting a user's own profile
        if (request.body.self) {
            var userID = request.signedCookies.usercookie.userID;
            user.getRow(userID).then(function() {
                if (user.count() < 1)
                    reject("No user found");
                else {
                    info.profile.username = user.getValue(lit.FIELD_USERNAME);
                    info.profile.upvotes = user.getValue(lit.FIELD_TOTAL_UPVOTES);
                    info.profile.downvotes = user.getValue(lit.FIELD_TOTAL_DOWNVOTES);
                    info.profile.dateJoined = user.getValue(lit.FIELD_DATE_JOINED);
                    info.profile.id = user.getValue(lit.FIELD_ID);
                    Aggregator.aggregateProfileInfo(user, info).then(function() {
                        getSaved(user, info).then(function() { // TODO: for each of these need to check if current user is subscribed, saved etc
                            getSubscribed(user, info).then(function() {
                                getContributions(user, info).then(function() {
                                    resolve(info);
                                }, function(err) {
                                    resolve(info, err);
                                });
                            }, function(err) {
                                resolve(info, err);
                            });

                        }, function(err) {
                            resolve(info, err);
                        });
                    }, function(err) {
                        resolve(info, err);
                    });
                }
            });
        }
        else { //if the user logged in is not the user who's profile we are getting
            for (var key in request.query)
                user.addQuery(key, request.query[key]); //TODO: PREVENT SEARCH BY NETID

            user.query().then(function() {
                if (!user.next())
                    reject("No user found");
                else {
                    info.profile.username = user.getValue(lit.FIELD_USERNAME);
                    info.profile.upvotes = user.getValue(lit.FIELD_TOTAL_UPVOTES);
                    info.profile.downvotes = user.getValue(lit.FIELD_TOTAL_DOWNVOTES);
                    info.profile.dateJoined = user.getValue(lit.FIELD_DATE_JOINED);

                    Aggregator.aggregateProfileInfo(user, info).then(function() {
                        getContributions(user, info).then(function() {
                            resolve(info);
                        }, function(err) {
                            resolve(info, err);
                        });
                    }, function(err) {
                        resolve(info, err); // return what we have at minimum
                    });
                }
            });
        }
    });
};

/** Gets a user's saved items
 *
 * @param user: The user's DBRow object
 * @param info: the JSON object containing all the information about a user
 * Resolves with the user's saved items once the recursiveGet completes
 */
function getSaved(user, info) {
    return new Promise(function(resolve, reject) {
        var saved = new DBRow(lit.SAVED_TABLE);
        saved.addQuery(lit.FIELD_USER_ID, user.getValue(lit.FIELD_ID));
        saved.setLimit(5);
        saved.orderBy(lit.FIELD_TIMESTAMP, lit.DESC);
        saved.query().then(function() {
            recursion.recursiveGetWithVotes(resolve, reject, saved, itemInfo.generalInfo, user.getValue(lit.FIELD_ID),
                [info.items.saved]);
        }, function(err) {
            reject(err);
        });
    });
}
/** Gets a user's subscribed items
 *
 * @param user: The user's DBRow object
 * @param info: the JSON object containing all the information about a user
 * Resolves with the user's subscribed items once the recursiveGet completes
 */
function getSubscribed(user, info) {
    return new Promise(function(resolve, reject) {
        var subscribed = new DBRow(lit.SUBSCRIPTIONS_TABLE);
        subscribed.addQuery(lit.FIELD_USER_ID, user.getValue(lit.FIELD_ID));
        subscribed.setLimit(5);
        subscribed.orderBy(lit.FIELD_TIMESTAMP, lit.DESC);
        subscribed.query().then(function() {
            recursion.recursiveGetWithVotes(resolve, reject, subscribed, itemInfo.generalInfo, user.getValue(lit.FIELD_ID),
                [info.items.subscribed]);
        }, function(err) {
            reject(err);
        });
    });
}

/** Gets a user's contributed items
 *
 * @param user: The user's DBRow object
 * @param info: the JSON object containing all the information about a user
 * Resolves with the user's contributed items once the recursiveGet completes
 */
function getContributions(user, info) {
    return new Promise(function(resolve, reject) {
        var contr = new DBRow(lit.CONTRIBUTION_TABLE);
        contr.addQuery(lit.FIELD_USER_ID, user.getValue(lit.FIELD_ID));
        contr.setLimit(5);
        contr.orderBy(lit.FIELD_TIMESTAMP, lit.DESC);
        contr.query().then(function() {
            recursion.recursiveGetWithVotes(resolve, reject, contr, itemInfo.generalInfo, user.getValue(lit.FIELD_ID),
                [info.items.contributions]);
        }, function(err) {
            reject(err);
        });
    });
}