/*
* Rater.js
* Written by Michael Albinson 3/14/17 (happy pi day)
*
* The rater functionally controls creating, editing, and deleting ratings
 */

"use strict";

var DBRow = require('../DBRow').DBRow;
var lit = require('../Literals');
var voter = require('./Voter');
var contributor = require('./Contributor');
var log = require('../log');

exports.addRating = function (request) {
    return new Promise(function(resolve, reject) {
        var userID = request.signedCookies.usercookie.userID;
        var u = new DBRow(lit.USER_TABLE);
        u.getRow(userID).then(function() {
            if (u.count() < 1)
                return reject('No user found');

            hasAlreadyRatedItem(u, request.body.info.parent).then(function(res) {
                if (res)
                    return resolve(false);

                var rating = new DBRow(lit.RATING_TABLE);
                rating.setValue(lit.FIELD_AUTHOR, u.getValue(lit.FIELD_USERNAME));
                rating.setValue(lit.FIELD_PARENT, request.body.info.parent);
                rating.setValue(lit.FIELD_CONTENT, request.body.info.content ? request.body.info.content : null);
                rating.setValue(lit.FIELD_RATING, request.body.info.rating);
                rating.insert().then(function () {
                    voter.vote(request.signedCookies.usercookie.userID, rating.getValue(lit.FIELD_ID), 1); // don't need to wait for this to complete
                    contributor.generateContribution(rating, request.signedCookies.usercookie.userID, lit.RATING_TABLE);
                    resolve({id: rating.getValue(lit.FIELD_ID), author: rating.getValue(lit.FIELD_AUTHOR)});
                }, function (err) {
                    reject(err);
                });
            })

        }, function (err) {
            log.error("No user found to insert rating for");
            reject(err);
        });
    });
};

exports.editRating = function (request) {
    return new Promise(function(resolve, reject) {
        var rating = new DBRow(lit.RATING_TABLE);
        rating.getRow(request.body.id).then(function() {
            if (!rating.count())
                return reject("No rating to edit found");

            rating.setValue(lit.FIELD_CONTENT, request.body.content);
            rating.update().then(function() {
                resolve();
            }, function(err) {
                reject(err)
            });
        });
    });
};

exports.deleteRating = function(request) {
    return new Promise(function(resolve, reject) {
        var rating = new DBRow(lit.RATING_TABLE);
        rating.getRow(request.body.id).then(function() {
            if (!rating.count())
                return reject("No comment to delete found");

            rating.delete().then(function () {
                resolve();
            }, function(err) {
                reject(err);
            });
        });
    });
};

exports.getRating = function(username, parentID) {
    return new Promise(function(resolve) {
        var rating = new DBRow(lit.RATING_TABLE);
        rating.addQuery(lit.FIELD_PARENT, parentID);
        rating.addQuery(lit.FIELD_AUTHOR, username);
        rating.query().then(function() {
            if (rating.next)
                resolve(rating);
            else
                resolve(undefined);
        })
    })
};

exports.getRatingList = function(parentID, info, resolve) {
    var ratingList = [];
    var ratings = new DBRow(lit.RATING_TABLE);
    ratings.addQuery(lit.FIELD_PARENT, parentID);
    ratings.setLimit(10);
    ratings.orderBy(lit.FIELD_TIMESTAMP, lit.DESC);
    ratings.query().then(function() {
        while (ratings.next()) {
            ratingList.push(getRatingInfo(ratings));
        }
        info.reviews = ratingList;
        resolve(info);
   })
};

function getRatingInfo(rating) {
    return {
        rating: rating.getValue(lit.FIELD_RATING),
        author: rating.getValue(lit.FIELD_AUTHOR),
        date: rating.getValue(lit.FIELD_TIMESTAMP),
        content: rating.getValue(lit.FIELD_CONTENT),
        id: rating.getValue(lit.FIELD_ID)
    }
}

function hasAlreadyRatedItem(user, item) {
    return new Promise(function(resolve, reject) {
        var rating = new DBRow(lit.FIELD_RATING);
        rating.addQuery(lit.FIELD_AUTHOR, user.getValue(lit.FIELD_USERNAME));
        rating.addQuery(lit.FIELD_PARENT, item);
        rating.query().then(function() {
            if (rating.next())
                return resolve(true);

            resolve(false);
        }, function(err) {
            reject(err);
        });
    });
}