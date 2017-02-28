/*
* newHandler.js
 */

"use strict";

var log = require('./log');
var DBRow = require('./DBRow').DBRow;
var lit = require('./Literals');
var voter = require('./Voter');

exports.handle = function(request) {
    return new Promise(function(resolve, reject) {
        var userID = request.signedCookies.usercookie.userID;
        var u = new DBRow(lit.USER_TABLE);
        u.getRow(userID).then(function() {
            switch(request.body.type) {
                case ("class"):
                    return createClass(request.body.content, u, resolve, reject);
                case ("link"):
                    return createLink(request.body.content, u, resolve, reject);
                case ("question"):
                    return createQuestion(request.body.content, u, resolve, reject);
                default:
                    reject('Invalid request type');
            }
        }, function() {
            reject("User does not exist, should be logged out");
        })
    }).catch(function(err) {
        log.error(err);
        reject('Error during insertion of new content');
    });
};

function createClass(body, user, resolve, reject) {
    getTagsIfNotPresent(body);

    var c = new DBRow(lit.CLASS_TABLE);
    c.setValue(lit.FIELD_TITLE, body.title);
    c.setValue(lit.FIELD_COURSE_CODE, body.courseCode);
    c.setValue(lit.FIELD_SUMMARY, body.summary);
    c.setValue(lit.FIELD_TAGS, body.tags);
    c.setValue(lit.FIELD_ADDED_BY, user.getValue(lit.FIELD_USERNAME));

    c.insert().then(function() {
        vote(user, c, resolve); // if we make it this far we will always resolve
        generateContribution(c, user, "class"); // we can get away with creating the contribution in parallel in this case
    }, function(err) {
        log.error(err);
        reject("Error entering the new class");
    })
}

function createLink(body, user, resolve, reject) { // check if this link should be trusted
    getTagsIfNotPresent(body);

    var l = new DBRow(lit.LINK_TABLE);
    l.setValue(lit.FIELD_TITLE, body.title);
    l.setValue(lit.FIELD_SUMMARY, body.summary);
    l.setValue(lit.FIELD_LINK, body.href); // get this
    l.setValue(lit.FIELD_TAGS, body.tags);
    l.setValue(lit.FIELD_ADDED_BY, user.getValue(lit.FIELD_USERNAME));
    l.insert().then(function() {
        vote(user, l, resolve); // if we make it this far we will always resolve
        generateContribution(l, user, "link"); // we can get away with creating the contribution in parallel in this case
    }, function(err) {
        log.error(err);
        reject("Error entering the new link");
    })
}

function createQuestion(body, user, resolve, reject) { // also create a vote
    getTagsIfNotPresent(body);

    var q = new DBRow(lit.POST_TABLE);
    q.setValue(lit.FIELD_TITLE, body.title);
    q.setValue(lit.FIELD_CONTENT, body.summary);
    q.setValue(lit.FIELD_AUTHOR, user.getValue(lit.FIELD_USERNAME)); // get this
    q.setValue(lit.FIELD_TAGS, body.tags);

    q.insert().then(function() {
        vote(user, q, resolve); // if we make it this far we will always resolve
        generateContribution(q, user, "post"); // we can get away with creating the contribution in parallel in this case
    }, function(err) {
        log.error(err);
        reject("Error entering the new question");
    })
}

function getTagsIfNotPresent(body) { // needs to be fully implemented
    if (!body.tags)
        body.tags = "DEFAULT";
}

function vote(user, item, resolve) {
    voter.vote(user.getValue(lit.FIELD_ID), item.getValue(lit.FIELD_ID), 1).then(function() {
        resolve({'id': item.getValue(lit.FIELD_ID)});
    }, function(err) {
        log.error(err);
        resolve({'id': item.getValue(lit.FIELD_ID)});
    })
}

function generateContribution(item, user, type) {
    var contr = new DBRow(lit.CONTRIBUTION_TABLE);
    contr.setValue(lit.FIELD_TYPE, type);
    contr.setValue(lit.FIELD_USER_ID, user.getValue(lit.FIELD_ID));
    contr.setValue(lit.FIELD_ITEM_ID, item.getValue(lit.FIELD_ID));
    contr.insert().then(function() {

    }, function(err) {
        log.error(err);
    })
}