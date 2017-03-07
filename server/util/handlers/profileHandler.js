/*
 * profileHandler.js
 * Written by Micahel Albinson 2/15/17
 */

"use strict";

var Aggregator = require('./../aggregator');
var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals.js');
var recursiveGet = require('./../recursion').recursiveGet;

/* profileRequest(request)
 ** Handles requests from the profile page
 **
 ** request: the express request
 ** return: the information necessary to populate the profile page
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
        else {
            for (var key in request.query)
                user.addQuery(key, request.query[key]);

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


function getSaved(user, info) {
    return new Promise(function(resolve, reject) {
        var saved = new DBRow(lit.SAVED_TABLE);
        saved.addQuery(lit.FIELD_USER_ID, user.getValue(lit.FIELD_ID));
        saved.setLimit(5);
        saved.orderBy(lit.FIELD_DATE_SAVED, lit.DESC);
        saved.query().then(function() {
            recursiveGet(resolve, reject, saved, savedInfo, [info.items.saved]);
        }, function(err) {
            reject(err);
        });
    });
}

function getSubscribed(user, info) {
    return new Promise(function(resolve, reject) {
        var subscribed = new DBRow(lit.SUBSCRIPTIONS_TABLE);
        subscribed.addQuery(lit.FIELD_USER_ID, user.getValue(lit.FIELD_ID));
        subscribed.setLimit(5);
        subscribed.orderBy(lit.FIELD_DATE_SUBSCRIBED, lit.DESC);
        subscribed.query().then(function() {
            recursiveGet(resolve, reject, subscribed, subscribedInfo, [info.items.subscribed]);
        }, function(err) {
            reject(err);
        });
    });
}

function getContributions(user, info) {
    return new Promise(function(resolve, reject) {
        var contr = new DBRow(lit.CONTRIBUTION_TABLE);
        contr.addQuery(lit.FIELD_USER_ID, user.getValue(lit.FIELD_ID));
        contr.setLimit(5);
        contr.orderBy(lit.FIELD_DATE, lit.DESC);
        contr.query().then(function() {
            recursiveGet(resolve, reject, contr, contributionInfo, [info.items.contributions]);
        }, function(err) {
            reject(err);
        });
    });
}


function subscribedInfo(row, item, list) {
    var data = {
        id: item.getValue(lit.FIELD_ID),
        title: item.getValue(lit.FIELD_TITLE),
        votes: item.getValue(lit.FIELD_NETVOTES),
        author: item.getValue(lit.FIELD_AUTHOR),
        date: row.getValue(lit.FIELD_DATE_SUBSCRIBED)
    };
    list[0].push(data);
}

function savedInfo(row, item, list) {
    var data =  {
        id: item.getValue(lit.FIELD_ID),
        title: item.getValue(lit.FIELD_TITLE),
        votes: item.getValue(lit.FIELD_NETVOTES),
        author: item.getValue(lit.FIELD_AUTHOR),
        date: row.getValue(lit.FIELD_DATE_SAVED)
    };
    list[0].push(data);
}

function contributionInfo(row, item, list) {
    var data = {
        id: item.getValue(lit.FIELD_ID),
        title: item.getValue(lit.FIELD_TITLE),
        votes: item.getValue(lit.FIELD_NETVOTES),
        author: item.getValue(lit.FIELD_AUTHOR),
        date: row.getValue(lit.FIELD_DATE),
        summary: item.getValue(lit.FIELD_CONTENT)
    };
    list[0].push(data);
}