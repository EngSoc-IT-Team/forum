"use strict";

/* actionResponder
 *
 * Written by Michael Albinson, 2/8/17
 *
 * A middleman for all actions that do not include the addition of true content to the database
 * and do not require information to be returned from the server, other than if the action was
 * successful or not.
 *
 * Implementations for each action can be found in the actions directory.
 *
 * i.e. votes, subscriptions, saves, reports etc.
 */

var log = require('./log');
var saver = require('./actions/Saver');
var subscriber = require('./actions/Subscriptions');
var voter = require('./actions/Voter');
var tagger = require('./actions/Tagger');
var commenter = require('./actions/Commenter');
var rater = require('./actions/Rater');
// var getter = require('./actions/Getter');
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
            case("tag"):
                use = tag;
                break;
            case('comment'):
                use = comment;
                break;
            case('rate'):
                use = rate;
                break;
            case('getMore'):
                use = getMore;
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
            saver.removeSave(request)
                .then(function() {resolve(true)}).catch(function() {reject(false)});
        else
            saver.save(request)
                .then(function() {resolve(true)}).catch(function() {reject('failure')});
    });
}

function subscribe(request) {
    return new Promise(function(resolve, reject) {
        if (request.body.subscribed)
            subscriber.cancelSubscription(request.signedCookies.usercookie.userID, request.body.itemId)
                .then(function() {resolve(true)}, function() {reject(false)});
        else
            subscriber.onSubscribed(request.body.itemId, request.signedCookies.usercookie.userID, request.body.contentType)
                .then(function() {resolve(true)}, function() {reject(false)});
    });
}

function vote(request) {
    return new Promise(function(resolve, reject) {
        if (request.body.voted)
            voter.updateVoteAndItem(request.signedCookies.usercookie.userID, request.body.itemId, request.body.value, request.body.type)
                .then(function() {resolve(true)}, function() {reject(false)});
        else
            voter.voteAndUpdateItem(request.signedCookies.usercookie.userID, request.body.itemId, request.body.value, request.body.type)
                .then(function() {resolve(true)}, function() {reject(false)});
    });
}

function report(request) {
    return new Promise(function(resolve, reject) {
        if (request.body.sub == 'enter')
            reporter.sendReport(request.signedCookies.usercookie.userID, request.body.itemId, request.body.reportReason, request.body.content)
                .then(function() {resolve(true)}, function() {reject(false)});
        else
            reporter.sendReport(request.body.reportId)
                .then(function() {resolve(true)}, function() {reject(false)});
    });
}

function tag(request) {
    return new Promise(function(resolve, reject){
        if (request.body.sub == "getArray")
            tagger.getArray().then(function(tags) {resolve(tags)}, function() {reject(false)});
        else if (request.body.sub == "getTag")
            tagger.getTag(request.body.id).then(function(tag) {resolve(tag)}, function() {reject(false)});
        else if (request.body.sub == "add")
            tagger.add(request.body.tagName).then(function() {resolve(true)}, function() {reject(false)});
        else
            log.error("Invalid request for tags");
    });
}

function comment(request) {
    return new Promise(function(resolve, reject){
        if (request.body.sub == "add")
            commenter.addComment(request).then(function(res) {resolve(res)}, function() {reject(false)});
        else if (request.body.sub == "edit")
            commenter.editComment(request).then(function() {resolve(true)}, function() {reject(false)});
        else if (request.body.sub == "delete")
            commenter.deleteComment(request).then(function() {resolve(true)}, function() {reject(false)});
        else
            log.error("Invalid request for commenting");
    });
}

function rate(request) {
    return new Promise(function(resolve, reject){
        if (request.body.sub == "add")
            rater.addRating(request).then(function(res) {resolve(res)}, function() {reject(false)});
        else if (request.body.sub == "edit")
            rater.editRating(request).then(function() {resolve(true)}, function() {reject(false)});
        else if (request.body.sub == "delete")
            rater.deleteRating(request).then(function() {resolve(true)}, function() {reject(false)});
        else
            log.error("Invalid request for rating");
    });
}

function getMore(request) {
    return new Promise(function(resolve, reject) {
        getter.getMore(request).then(function(res){resolve(res)}, function() {reject(false)})
            .catch(function(err) {console.error('Getter getMore error: ' + err)})
    })
}