/**
 * Created by Carson on 15/01/2017.
 * File to handle logic of users subscribing to posts/comments.
 * Inserts information when a user subscribes,
 * queries when content added/edited to see if email notification
 * should be sent to users that are subscribed.
 */
var nodeMailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var log = require('./log.js');
var dbr = require('./DBRow.js');
var generator = require('./IDGenerator.js');
var lit = require('./Literals.js');

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
 */
function onSubscribed(contentID, userID) {
    //query comment table for content ID, if in there, set type to comment
    //if not in there, then type is a post
    var commentTable = new dbr.DBRow(lit.COMMENT_TABLE);
    commentTable.addQuery(lit.FIELD_ID, contentID);
    commentTable.query().then(function () {
        //set in database all the information
        var newRow = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
        if (!commentTable.next()) { //type is table
            newRow.setValue(lit.TYPE, lit.POST_TABLE);
        } else {
            newRow.setValue(lit.TYPE, lit.COMMENT_TABLE);
        }

        newRow.setValue(lit.FIELD_USER_ID, userID);
        newRow.setValue(lit.FIELD_ITEM_ID, contentID);
        newRow.setValue(lit.FIELD_ID, generator.generate());
        newRow.setValue(lit.FIELD_DATE_SUBSCRIBED, new Date().toISOString());

        newRow.insert();
    }).catch(function (err) {
        log.log("onSubscribed error: " + err);
    });
}

/**
 * Function to be called when content edited or
 * a child comment is added.
 * @param contentID ID of content added/edited.
 */
function onContentAddedOrChanged(contentID) {
    //get ID of content user actually subscribed to
    getParentContentID(contentID).then(function (contentID) {
        //add to number of notifications missed
        return addToNotificationsMissed(contentID);
    }).then(function (contentID) {
        //go through email logic
        return emailUsers(contentID);
    }).catch(function (error) {
        log.log("ERROR: " + error);
    });
}

/**
 * Function that emails users.
 * Computes logic to see if an individual *should* be emailed as well.
 * @param contentID ID of the content the user is to be emailed about.
 * @returns {Promise} Asynch tasks called/done from this function, so
 * use promise to make it synchronous. Chained from  caller method.
 */
function emailUsers(contentID) {
    return new Promise(function (resolve, reject) {
            getUserIDs(contentID).then(function (userIDs) {
                return userIDs;
            }).then(function (userIDs) {
                //get userIDs for those who should be emailed
                return findUsersToEmail(userIDs);
            }).then(function (userIDs) {
                log.log("userIDs: "+userIDs);
                return setNotificationsMissedToZero(userIDs);
            }).then(function (userIDs) {
                //get net IDs from user IDs
                return getNetIDs(userIDs);
            }).then(function (netIDs) {
                //email users
                for (var i in netIDs) {
                    //TODO add url to give info
                    mailOptions[lit.TO] = netIDs[i] + lit.QUEENS_EMAIL;
                    log.log("MAIL SENT");
                    // transport.sendMail(mailOptions);
                }
                return netIDs;
            }).then(function (netIDs) {
                //update last notified to current time
                var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
                for (var i in netIDs) {
                    row.addQuery(lit.FIELD_NETID, netIDs[i]);
                }
                row.query().then(function () {
                    while (row.next()) {
                        row.setValue(lit.FIELD_LAST_NOTIFIED, new Date().toISOString());
                        row.update();
                    }
                });
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
                row.update().then(function () {
                    resolve(contentID);
                }, function (err) {
                    reject(err);
                });
            }
        }, function (err) {
            reject(err);
        });
    });
}

//TODO not user IDs, subscription IDs
function setNotificationsMissedToZero(userIDs) {
    var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
    for (var i in userIDs) {
        row.addQuery(lit.FIELD_USER_ID, userIDs[i]);
    }
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) { //set notifications missed to zero for all users that subscribed to that content
                row.setValue(lit.FIELD_NUM_NOTIFICATIONS_MISSED, 0);
                row.update();
            }
            resolve(userIDs);
        }, function (err) {
            reject(err);
        });
    });
}

/**
 * Function to get the parent content of added content.
 * Added content is only ever comments, so an issue of a table
 * not having parent content will never come up. Able to handle
 * a top level comment and a child comment.
 * @param contentID The ID of the content for which the parent is to be found.
 * @returns {Promise} Asynch tasks called/done from this function, so
 * use promise to make it synchronous. Chained from caller method.
 */
function getParentContentID(contentID) {
    var row = new dbr.DBRow(lit.COMMENT_TABLE);
    row.addQuery(lit.FIELD_ID, contentID);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            if (!row.next()) {
                reject("got nothing back");
            }
            //if parent of the content is a post, send back that post's ID
            //else it is a comment, so send back that comment's ID
            (row.getValue(lit.TYPE) == lit.POST_TABLE) ? resolve(row.getValue(lit.FIELD_PARENT_POST)) :
                resolve(row.getValue(lit.FIELD_PARENT_COMMENT));
        }, function () {
            reject("No parent");
        });
    });
}

/**
 * Function that gets user IDs that have subscribed to a
 * specified contentID.
 * @param contentID ID of the content for which users are subscribed to.
 * @returns {Promise} Asynch tasks called/done from this function, so
 * use promise to make it synchronous. Chained from  caller method.
 */
function getUserIDs(contentID) {
    var userIDs = [];
    var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
    row.addQuery(lit.FIELD_ITEM_ID, contentID);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) {
                userIDs.push(row.getValue(lit.FIELD_USER_ID));
            }
            resolve(userIDs);
        }, function () {
            log.log("No rows match query or there was an error");
            reject(null);
        });
    });
}

/**
 * Gets net IDs from user IDs. The user IDs are ones that have been
 * filtered so that these users are the ones to be emailed.
 * @param userIDs Array of user IDs that need their net ID found.
 * @returns {Promise} Asynch tasks called/done from this function, so
 * use promise to make it synchronous. Chained from  caller method.
 */
function getNetIDs(userIDs) {
    var netIDs = [];
    var row = new dbr.DBRow(lit.USER_TABLE);
    return new Promise(function (resolve, reject) {
        for (var i in userIDs) {
            row.addQuery(lit.FIELD_ID, userIDs[i]);
        }
        row.query().then(function () {
            while (row.next()) {
                netIDs.push(row.getValue(lit.FIELD_NETID));
            }
            resolve(netIDs);
        }, function (err) {
            reject(err);
        });
    });
}

/**
 * Function that filters through user IDs to find user IDs
 * for those that should be emailed. They should be emailed
 * if there is at least one missed notification and it has been
 * long enough since the last email was sent.
 * @param userIDs Array of all users that have subscribed to something.
 * @returns {Promise} Asynch tasks called/done from this function, so
 * use promise to make it synchronous. Chained from  caller method.
 */
function findUsersToEmail(userIDs) {
    var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
    var numNotificationsMissed;
    var lastNotified;
    var goodUserIDs = [];
    return new Promise(function (resolve, reject) {
        for (var i in userIDs) {
            row.addQuery(lit.FIELD_USER_ID, userIDs[i]);
        }
        row.query().then(function () {
            while (row.next()) {
                //compare number of missed notifications to preset minimum number needed to email user
                //also check and make sure that it has been long enough since user was last emailed
                //both need to pass the compare to email the user
                numNotificationsMissed = row.getValue(lit.FIELD_NUM_NOTIFICATIONS_MISSED);
                lastNotified = row.getValue(lit.FIELD_LAST_NOTIFIED);
                if (numNotificationsMissed > lit.minNumMissedNotifications && longEnoughAgo(lastNotified)) {
                    goodUserIDs.push(row.getValue(lit.FIELD_USER_ID));
                }
            }
            resolve(goodUserIDs);
        }, function (err) {
            reject(err);
        });
    });
}

function longEnoughAgo(lastNotified) {
    //TODO figure out logic for getting how long ago user was notified
    return true;
}

