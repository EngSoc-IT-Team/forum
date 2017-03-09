/**
 * Created by Carson on 15/01/2017.
 * File to handle logic of users subscribing to posts/comments.
 * Inserts information when a user subscribes,
 * queries when content added/edited to see if email notification
 * should be sent to users that are subscribed.
 */
var nodeMailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var log = require('./../log.js');
var dbr = require('./../DBRow.js');
var lit = require('./../Literals.js');

//object that holds the mailing information - who sends it (and their authentication) and connection details
var transport = nodeMailer.createTransport(smtpTransport({
    HOST: 'outlook.office.com',
    secureConnection: false, //use SSL as this is not a secure connection
    port: 587,
    auth: {
        user: "do-not-reply-forum@engsoc.queensu.ca",
        pass: "Forum1617" //TODO don't store here
    }
}));

//object that holds the actual email's information - subject, receiver, text etc.
var mailOptions = {
    from: 'do-not-reply-forum@engsoc.queensu.ca',
    to: '', //will be changed to userNetID@queensu.ca in emailUser()
    subject: 'Forum Subscription',
    text: 'There was a change to content you are subscribed to! Click here to see: ' //will add url here
};

/**
 * Function to be called when a user clicks a subscribe button.
 * Adds their information to the subscriptions table.
 * @param contentID The ID of the post/comment the user subscribed to.
 * @param userID The ID of the user who subscribed.
 * @param type The type of content being subscribed to
 */
exports.onSubscribed = function (contentID, userID, type) {
    return new Promise(function (resolve, reject) {
        exports.isSubscribed(contentID, userID).then(function (subscribed) {
            if (!subscribed) {
                var newRow = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
                newRow.setValue(lit.FIELD_USER_ID, userID);
                newRow.setValue(lit.FIELD_ITEM_ID, contentID);
                newRow.setValue(lit.FIELD_TIMESTAMP, new Date().toISOString());
                newRow.setValue(lit.FIELD_TYPE, type);
                //get user net ID
                var userRow = new dbr.DBRow(lit.USER_TABLE);
                userRow.addQuery(lit.FIELD_USER_ID, userID);
                userRow.query().then(function () {
                    newRow.setValue(lit.FIELD_NETID, userRow.getValue(lit.FIELD_NETID));
                    newRow.insert().then(function () {
                        resolve(true);
                    }, function (err) {
                        log.error("onSubscribed error: " + err);
                        reject();
                    }).catch(function (err) {
                        log.error("onSubscribed error: " + err);
                        reject();
                    });
                });
            }
            else
                reject("Already subscribed");
        });
    });
};

/**
 * Function to be called when a user clicks a unsubscribe button.
 * Removes their information to the subscriptions table.
 * @param contentID The ID of the post/comment the user subscribed to.
 * @param userID The ID of the user who subscribed.
 */
exports.cancelSubscription = function (contentID, userID) {
    return new Promise(function (resolve, reject) {
        var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
        row.addQuery(lit.FIELD_USER_ID, userID);
        row.addQuery(lit.FIELD_ITEM_ID, contentID);
        row.query().then(function () { // find the row that needs to be deleted by userId and contentId
            if (!row.next())
                reject();
            else {
                row.delete(row.getValue(lit.FIELD_ID)).then(function () { // delete it
                    resolve();
                }, function () {
                    reject();
                }).catch(function (err) {
                    log.error("cancelSubscription error: " + err);
                    reject(err);
                })
            }
        });
    });
};

/**
 * Check to see if a user is already subscribed to a specific id
 *
 * @param contentID ID of content.
 * @param userID The ID of the user who is (hopefully) already subscribed.
 */
exports.isSubscribed = function (contentID, userID) {
    return new Promise(function (resolve) {
        var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
        row.addQuery(lit.FIELD_USER_ID, userID);
        row.addQuery(lit.FIELD_ITEM_ID, contentID);
        row.query().then(function () { // find the row that needs to be deleted by userId and contentId
            if (row.count())
                resolve(true);
            else
                resolve(false);
        }, function () {
            resolve(false);
        }).catch(function () {
            resolve(false);
        });
    });
};

/**
 * Function to be called when content edited or
 * a child comment is added.
 * @param contentID ID of content added/edited.
 */
function onContentAddedOrChanged(contentID) {
    //get ID of content user actually subscribed to
    getSubscribedContentID(contentID).then(function (contentID) {
        //add to number of notifications missed
        return addToNotificationsMissed(contentID);
    }).then(function (contentID) {
        //go through email logic
        return emailUsers(contentID);
    }).catch(function (error) {
        log.log("onContentAddedOrChanged error: " + error);
    });
}

/**
 * Function that emails users.
 * Computes logic to see if an individual should be emailed as well.
 * @param contentID ID of the content the user is to be emailed about.
 * @returns {Promise} Asynch tasks called/done from this function, so
 * use promise to make it synchronous. Chained from  caller method.
 */
function emailUsers(contentID) {
    var usersEmailed = [];
    return new Promise(function (resolve, reject) {
            findUsersToEmail(contentID).then(function (infoIDs) {
                usersEmailed = infoIDs[0]; //save the user IDs for those who are being emailed
                return infoIDs[1]; //pass on netIDs
            }).then(function (netIDs) {
                //email users
                for (var i in netIDs) {
                    //TODO add url to give info
                    mailOptions[lit.TO] = netIDs[i] + lit.QUEENS_EMAIL;
                    log.log("Mail sent for content: " + contentID);
                    transport.sendMail(mailOptions);
                }
            }).then(function () {
                return getSubscriptionIDs(usersEmailed, contentID);
            }).then(function (subIDs) {
                return setNotificationsMissedToZero(subIDs);
            }).then(function (subIDs) {
                //update last notified to current time
                return setLastNotifiedToNow(subIDs);
            }).catch(function (err) {
                reject(err);
            });
        }
    );
}

/**
 * Function that increments the number of edits/child content that have gone without
 * an email to subscribed users.
 * @param contentID ID of the content to increase numMissedNotifications for
 * @returns {Promise} Asynch tasks called/done from this function, so
 * use promise to make it synchronous. Chained from  caller method.
 */
function addToNotificationsMissed(contentID) {
    var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
    row.addQuery(lit.FIELD_ITEM_ID, contentID);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) { //increment notifications missed for all users that subscribed to that content
                row.setValue(lit.FIELD_NUM_NOTIFICATIONS_MISSED, row.getValue(lit.FIELD_NUM_NOTIFICATIONS_MISSED) + 1);
                row.update().then(function (err) {
                    reject(err);
                });
            }
            resolve(contentID);
        }, function (err) {
            reject(err);
        });
    });
}

/**
 * Sets numNotificationsMissed to 0 for all pieces of content that had an email sent out.
 * @param subIDs IDs of the subscriptions rows that were emailed for.
 * @returns {*} Asynch tasks called/done from this function, so
 * use promise to make it synchronous. Chained from caller method. Unless there is no
 * work to be done with the parameter, in which case the function is just ended and the
 * parameter is passed along the promise chain.
 */
function setNotificationsMissedToZero(subIDs) {
    //check that subIDs can actually be used to find users emailed
    //if not (empty), stop this function and continue to next then chain
    if (subIDs.length == 0) {
        return subIDs;
    }
    var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
    for (var i in subIDs) {
        row.addQuery(lit.FIELD_ID, subIDs[i]);
    }
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) { //set notifications missed to zero for all users that subscribed to that content
                updateNotificationsMissed(row).then(function () {
                    //delay execution until row has been updated
                });
            }
            resolve(subIDs);
        }, function (err) {
            reject(err);
        });
    });
}

/**
 * Helper function for setNotificationsMissedToZero. Actually sets the notifications missed
 * to be 0. Forces the resolve() in setNotificationsMissedToZero to wait until updates are done,
 * so that they actually get executed.
 * @param row The row to set missed notifications missed to 0 for.
 * @returns {Promise} Asynch tasks called/done from this function, so
 * use promise to make it synchronous. Chained from  caller method.
 */
function updateNotificationsMissed(row) {
    return new Promise(function (resolve, reject) {
            row.setValue(lit.FIELD_NUM_NOTIFICATIONS_MISSED, 0);
            row.update().then(function () {
                resolve();
            }, function (err) {
                reject(err);
            })
        }
    );
}

/**
 * Function that sets the lastNotified field for content that users have been emailed about.
 * Field is set to the current date/time.
 * @param subIDs IDs of the subscriptions rows that were emailed for.
 * No return because this is the last function called from the promise chain.
 */
function setLastNotifiedToNow(subIDs) {
    //check that subIDs can actually be used to find users emailed
    //if not (empty), stop this function and continue to next then chain
    if (subIDs.length == 0) {
        return;
    }
    var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
    for (var i in subIDs) {
        row.addQuery(lit.FIELD_ID, subIDs[i]);
    }
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) {
                row.setValue(lit.FIELD_LAST_NOTIFIED, new Date().toISOString());
                row.update();
            }
            resolve();
        }, function (err) {
            reject(err);
        });
    });
}

/**
 * Function that gets the subscriptions table row IDs for users that are going to be emailed.
 * Because users can subscribe to multiple content IDs, need to filter through the userIDs for
 * the ones that are subscribed to the specific content.
 * @param userIDs User IDs for those that will be emailed.
 * @param contentID Content ID for the content that will be emailed for.
 * @returns {*} Asynch tasks called/done from this function, so
 * use promise to make it synchronous. Chained from  caller method. Unless there is no
 * work to be done with the parameter, in which case the function is just ended and the
 * parameter is passed along the promise chain.
 */
function getSubscriptionIDs(userIDs, contentID) {
    //check that userIDs can actually be used to find users
    //if not (empty), stop this function and continue to next then chain
    if (userIDs.length == 0) {
        return userIDs;
    }
    var subIDs = [];
    var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
    for (var i in userIDs) {
        row.addQuery(lit.FIELD_USER_ID, userIDs[i]);
    }
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) {
                if (row.getValue(lit.FIELD_ITEM_ID) == contentID) { //ID of row that was emailed for
                    subIDs.push(row.getValue(lit.FIELD_ID));
                }
            }
            resolve(subIDs);
        }, function (err) {
            reject(err);
        });
    });
}

/**
 * Function to get the ID of the content the user has subscribed to.
 * If a post is edited, the content ID is the subscribed one. If a post/comment has
 * children added/changed, then the parent content ID is needed.
 * If no row is received back, that means the contentID references
 * a table, and the parent ID (the one the user is subscribed to) is the
 * table.
 * @param contentID The ID of the content for which the parent is to be found.
 * @returns {Promise} Asynch tasks called/done from this function, so
 * use promise to make it synchronous. Chained from caller method. Unless there is no
 * work to be done with the parameter, in which case the function is just ended and the
 * parameter is passed along the promise chain.
 */
function getSubscribedContentID(contentID) {
    var row = new dbr.DBRow(lit.COMMENT_TABLE);
    row.addQuery(lit.FIELD_ID, contentID);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            if (!row.next()) {
                resolve(contentID); //
            }
            //if parent of the content is a post, send back that post's ID
            //else it is a comment, so send back that comment's ID
            (row.getValue(lit.FIELD_PARENT_POST) != lit.UNDEFINED) ? resolve(row.getValue(lit.FIELD_PARENT_POST)) :
                resolve(row.getValue(lit.FIELD_PARENT_COMMENT));
        }, function () {
            reject("No parent");
        });
    });
}

/**
 * Function to find the users to email for a given contentID. The contentID is for content that has been edited or had
 * children added. Function finds all users subscribed to that content and then checks to see if that user should be notified.
 * They should be notified if they have more than the minimum number of missed notifications AND haven't been notified
 * in a set amount of time. Finds userIDs and netIDs for those that should be emailed.
 * @param contentID The ID of the content being checked for if a user subscribed to it should be emailed.
 * @returns {Promise} Asynch tasks called/done from this function, so use promise to make it synchronous.
 * Chained from caller method. Resolves with an array of userIDs and netIDs for those that should be emailed.
 */
function findUsersToEmail(contentID) {
    var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
    //make matrix to resolve with - first row is userIDs, second is netIDs
    var infoIDs = [];
    infoIDs[0] = [];
    infoIDs[1] = [];
    return new Promise(function (resolve, reject) {
        row.addQuery(lit.FIELD_ITEM_ID, contentID);
        row.query().then(function () {
            while (row.next()) {
                //compare number of missed notifications to preset minimum number needed to email user
                //also check and make sure that it has been long enough since user was last emailed
                //both need to pass the compare to email the user
                var numNotificationsMissed = row.getValue(lit.FIELD_NUM_NOTIFICATIONS_MISSED);
                var lastNotified = row.getValue(lit.FIELD_LAST_NOTIFIED);
                if (numNotificationsMissed > lit.MIN_NUM_MISSED_NOTIFICATIONS && longEnoughAgo(lastNotified)) {
                    infoIDs[0].push(row.getValue(lit.FIELD_USER_ID));
                    infoIDs[1].push(row.getValue(lit.FIELD_NETID));
                }
            }
            resolve(infoIDs);
        }, function (err) {
            reject(err);
        });
    });
}

/**
 * Function to determine if it has been long enough since last email to user to send another one.
 * Currently the minimum time between emails is a day.
 * Note that this is just for one piece of content.
 * A user could be emailed multiple times in a day for different content.
 * @param lastNotified Day/time the user was last emailed at.
 * @returns {boolean} True if it has been long enough (one day), false if not.
 */
function longEnoughAgo(lastNotified) {
    lastNotified = Date.parse(lastNotified); //get lastNotified in MS form
    var curMS = Date.parse(new Date().toISOString()); //get current time in MS form
    return (curMS - Date.parse(lastNotified)) >= lit.MIN_MS_TO_NOTIFY_AGAIN; //at least a day since last email
}

