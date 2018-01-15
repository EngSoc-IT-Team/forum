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

/** Adds a rating for a class
 *
 * @param request: the express server request containing the review
 *
 * Resolves a JSON object containing the inserted values of the rating if it is successful, resolves false if something
 * goes wrong or if the user has already submitted a rating for the current class
 */
exports.addRating = function (request) {
    return new Promise(function(resolve, reject) {
        var userID = request.signedCookies.usercookie.userID;
        var u = new DBRow(lit.tables.USER);
        u.getRow(userID).then(function() {
            if (u.count() < 1)
                return reject('No user found');

            hasAlreadyRatedItem(u, request.body.info.parent).then(function(res) {
                if (res)
                    return resolve(false);

                var rating = new DBRow(lit.tables.RATING);
                rating.setValue(lit.fields.AUTHOR, u.getValue(lit.fields.USERNAME));
                rating.setValue(lit.fields.PARENT, request.body.info.parent);
                rating.setValue(lit.fields.CONTENT, request.body.info.content ? request.body.info.content : null);
                rating.setValue(lit.fields.RATING, request.body.info.rating);
                rating.insert().then(function () {
                    voter.vote(request.signedCookies.usercookie.userID, rating.getValue(lit.fields.ID), 1); // don't need to wait for this to complete
                    contributor.generateContribution(rating, request.signedCookies.usercookie.userID, lit.tables.RATING);
                    exports.setAverageRating(rating.getValue(lit.fields.PARENT));
                    resolve({id: rating.getValue(lit.fields.ID), author: rating.getValue(lit.fields.AUTHOR)});
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

/** Edits an existing rating. The user editing the rating must be the same as the user that inserted the rating.
 *
 * @param request: the express server request containing the edited review
 */
exports.editRating = function (request) {
    return new Promise(function(resolve, reject) {
        var rating = new DBRow(lit.tables.RATING);
        rating.getRow(request.body.id).then(function() {
            if (!rating.count())
                return reject("No rating to edit found");

            if (rating.getValue(lit.fields.USER_ID != request.signedCookies.usercookie.userID))
                return reject("The user attempting to edit the row is not the one that inserted it");

            rating.setValue(lit.fields.CONTENT, request.body.info.content);
            rating.setValue(lit.fields.RATING, request.body.info.rating);
            rating.update().then(function() {
                exports.setAverageRating(rating.getValue(lit.fields.PARENT));
                resolve();
            }, function(err) {
                reject(err)
            });
        });
    });
};

/** Deletes the specified rating. The user deleting the rating must be the same as the user that inserted the rating.
 *
 * @param request: the express server request containing the review to delete
 */
exports.deleteRating = function(request) {
    return new Promise(function(resolve, reject) {
        var rating = new DBRow(lit.tables.RATING);
        rating.getRow(request.body.id).then(function() {
            if (!rating.count())
                return reject("No comment to delete found");

            if (rating.getValue(lit.fields.USER_ID != request.signedCookies.usercookie.userID))
                return reject("The user attempting to edit the row is not the one that inserted it");

            rating.delete().then(function () {
                resolve();
            }, function(err) {
                reject(err);
            });
        });
    });
};

/** Gets a rating for a specific user on the specified class
 *
 * @param username: the username of the user who created the rating
 * @param parentID: the id of the parent class
 *
 * Resolves the retrieved rating DBRow containing the user's review on a specific class or undefined if the row
 * doesn't exist
 */
exports.getRating = function(username, parentID) {
    return new Promise(function(resolve) {
        var rating = new DBRow(lit.tables.RATING);
        rating.addQuery(lit.fields.PARENT, parentID);
        rating.addQuery(lit.fields.AUTHOR, username);
        rating.query().then(function() {
            if (rating.next())
                resolve(rating);
            else
                resolve(undefined);
        })
    })
};

/** Gets a list of ratings based on the specified parentID
 *
 * @param parentID: the id of the parent post
 * @param info: the JSON object to store
 * @param resolve: the resolution of the calling function
 *
 * Resolves the JSON object containing all of the ratings stored in an array ordered by the date they were added
 */
exports.getRatingList = function(parentID, info, resolve) {
    //var ratingList = [];
    var ratings = new DBRow(lit.tables.RATING);
    ratings.addQuery(lit.fields.PARENT, parentID);
    ratings.setLimit(10);
    ratings.orderBy(lit.fields.TIMESTAMP, lit.sql.query.DESC);
    ratings.query().then(function() {
        exports.getRatingsRecursive = function(resolve, reject, ratings, item, info, userID){         //implemented recursive function to receive votes
            if(!ratings.next())
                return resolve(info);
            else{
                rater.getVote(userID, ratings.getValue(lit.fields.ID)).then(function(vote){
                    var ratingInfo = (ratings, vote);
                    info.ratings.push(ratingInfo);
                    exports.getRatingsRecursive(resolve, reject, ratings, item, info, userID);
                })
            }
        }


        /*while (ratings.next()) {
            ratingList.push(getRatingInfo(ratings));
        }
        info.reviews = ratingList;
        resolve(info);*/
   })
};

/** Gets the rating information for a rating from its DBRow and formats it to be passed to the client
 *
 * @param rating: the rating DBRow to get info for
 * @returns {{rating, author, date, content, id}}
 */
function getRatingInfo(rating, vote, justAdded) {
    var hasVoted;
    if(!justAdded)
        hasVoted = vote ? (vote.getValue(lit.fields.VOTE_VALUE) ? "positive" : "negative") : undefined;
    else
        hasVoted = "positive";
    return {
        rating: rating.getValue(lit.fields.RATING),
        author: rating.getValue(lit.fields.AUTHOR),
        date: rating.getValue(lit.fields.TIMESTAMP),
        content: rating.getValue(lit.fields.CONTENT),
        id: rating.getValue(lit.fields.ID),
        netVotes: rating.getValue(lit.fields.NETVOTES),
        type: lit.tables.RATING,
        voted: hasVoted
    };
}

/** Checks to see if a user has already rated a class
 *
 * @param user: the user's DBRow
 * @param classID: the id of the class that the user is trying to add a review to
 *
 * resolves true if the user has already made a rating, resolves false if they haven't
 */
function hasAlreadyRatedItem(user, classID) {
    return new Promise(function(resolve, reject) {
        var rating = new DBRow(lit.fields.RATING);
        rating.addQuery(lit.fields.AUTHOR, user.getValue(lit.fields.USERNAME));
        rating.addQuery(lit.fields.PARENT, classID);
        rating.query().then(function() {
            if (rating.next())
                return resolve(true);

            resolve(false);
        }, function(err) {
            reject(err);
        });
    });
}

/** Averages the ratings on a class and sets the class's average rating to that value after a new review is inserted
 *
 * @param classID: the id of the class that the user is trying to add a review to
 * TODO: make this so you do't have to pull all ratings for a class in the database out to do the average
 */
exports.setAverageRating = function(classID) {
    return new Promise(function(resolve) {
        var ratings = new DBRow(lit.tables.RATING);
        ratings.addQuery(lit.fields.PARENT, classID);
        ratings.query().then(function() {
            var count = ratings.count();
            var aggregate = 0;
            if (count < 1)
                return resolve(false);

            while (ratings.next())
                aggregate += ratings.getValue(lit.fields.RATING);

            var avgRating = Math.round(aggregate / count);
            var cl = new DBRow(lit.tables.CLASS);
            cl.getRow(classID).then(function() {
                cl.setValue(lit.fields.AVERAGE_RATING, avgRating);
                cl.setValue(lit.fields.RATINGS, count);
                cl.update().then(function() {
                    resolve(true);
                }).catch(function() {
                    resolve(false);
                })
            }).catch(function() {
                resolve(false);
            })
        }).catch(function() {
            resolve(false);
        })
    });
};