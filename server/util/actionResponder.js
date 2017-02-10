"use strict";

/* actionResponder
 *
 * Written by Michael Albinson, 2/8/17
 *
 * A middleman for all actions that do not include the addition of true content to the database
 * and do not require information to be returned from the server, other than if the action was
 * successful or not.
 *
 * i.e. votes, subscriptions, saves, reports etc.
 */

var log = require('./log');
var saver = require('./Saver');
var subscriber = require('./Subscriptions');
var voter = require('./Voter');
var DBRow = require('./DBRow').DBRow;


exports.respond = function(request) {
    return new Promise(function(resolve, reject) {
        var use = undefined;
        var action = request.body.action;
        switch(action) {
           case("vote"):
               use = vote;
               break;
           case("subscribe"):
               use = subscribe;
               break;
           case("save"):
               use = save;
               break;
            case("report"):
                use = report;
                break;
           default:
                log.error("Attempt access an invalid action: '" + action + "'");
               break;
        }

        if (use)
            use(request).then(function(res) {
                resolve(res);
            }, function(res) {
                reject(res);
            });
    });
};

function save(request) {
    return new Promise(function(resolve, reject) {
        if (request.body.saved)
            saver.removeSave(request.body.userId, request.body.itemId)
                .then(function() {resolve(true)}, function() {reject(false)});
        else
            saver.save(request.body.userId, request.body.itemId, request.body.type)
                .then(function() {resolve(true)}, function() {reject(false)});
    });
}

function subscribe(request) {
    return new Promise(function(resolve, reject) {
        if (request.body.subscribed)
            subscriber.cancelSubscription(request.body.userId, request.body.itemId)
                .then(function() {resolve(true)}, function() {reject(false)});
        else
            subscriber.onSubscribed(request.body.userId, request.body.itemId, request.body.type)
                .then(function() {resolve(true)}, function() {reject(false)});
    });
}

function vote(request) {
    return new Promise(function(resolve, reject) {
        if (request.body.voted)
            voter.changeVote(request.body.userId, request.body.itemId, request.body.voteValue)
                .then(function() {resolve(true)}, function() {reject(false)});
        else
            voter.onSubscribed(request.body.userId, request.body.itemId, request.body.voteValue)
                .then(function() {resolve(true)}, function() {reject(false)});
    });
}

function report(request) {
    return new Promise(function(resolve, reject) {
        if (request.body.subsction == 'enter')
            reporter.sendReport(request.body.userId, request.body.itemId, request.body.reportReason, request.body.content)
                .then(function() {resolve(true)}, function() {reject(false)});
        else
            reporter.sendReport(request.body.reportId)
                .then(function() {resolve(true)}, function() {reject(false)});
    });
}