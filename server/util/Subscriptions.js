/**
 * Created by Carson on 15/01/2017.
 */
//TODO document it
var nodeMailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var log = require('./log.js');
var dbr = require('./DBRow.js');
var generator = require('./IDGenerator.js');
var lit = require('./StringLiterals.js'); //TODO: Change literals to lit

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

function onSubscribed(contentID, userID) {
    //set in database all the information
    var newRow = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
    newRow.setValue(lit.FIELD_USER_ID, userID);
    newRow.setValue(lit.FIELD_ITEM_ID, contentID);
    newRow.setValue(lit.FIELD_ID, generator.generate());
    newRow.setValue(lit.TYPE, "type"); //TODO get proper type
    //TODO add date joined field

    newRow.insert().then(function () {
    }, function (err) {
        log.log('error:' + err);
    })
}

function onContentAddedOrChanged(childID) {
    //get ID of content user actually subscribed to
    getParentContentID(childID).then(function (contentID) {
        //add to number of notifications missed
        return addToNotificationsMissed(contentID);
    }).then(function (contentID) {
        //go through email logic
        return emailUsers(contentID);
    }).catch(function (error) {
        log.log("ERROR: " + error);
    });
}

function onContentEdited(contentID) {
    addToNotificationsMissed(contentID).then(function (contentID) {
        emailUsers(contentID);
    }).catch(function (error) {
        log.log("ERROR: " + error);
    });
}

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
                log.log("here");
                //email users
                for (var i in netIDs) {
                    //TODO add url to give info
                    mailOptions[lit.TO] = netIDs[i] + lit.QUEENS_EMAIL;
                    log.log("MAIL SENT");
                    // transport.sendMail(mailOptions);
                }
                return netIDs;
            }).then(function (netIDs) {
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

function addToNotificationsMissed(contentID) {
    var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
    row.addQuery(lit.FIELD_ITEM_ID, contentID);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) {
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

function setNotificationsMissedToZero(userIDs) {
    var row = new dbr.DBRow(lit.SUBSCRIPTIONS_TABLE);
    for (var i in userIDs) {
        row.addQuery(lit.FIELD_USER_ID, userIDs[i]);
    }
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) {
                row.setValue(lit.FIELD_NUM_NOTIFICATIONS_MISSED, 0);
                row.update();
            }
            resolve(userIDs);
        }, function (err) {
            reject(err);
        });
    });
}

function getParentContentID(contentID) {
    var row = new dbr.DBRow(lit.COMMENT_TABLE);
    row.addQuery(lit.FIELD_ID, contentID);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            if (!row.next()) {
                reject("got nothing back");
            }
            (row.getValue(lit.TYPE) == lit.POST_TABLE) ? resolve(row.getValue(lit.FIELD_PARENT_POST)) :
                resolve(row.getValue(lit.FIELD_PARENT_COMMENT));
        }, function () {
            reject("No parent");
        });
    });
}

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
                numNotificationsMissed = row.getValue(lit.FIELD_NUM_NOTIFICATIONS_MISSED);
                lastNotified = row.getValue(lit.FIELD_LAST_NOTIFIED);
                if (numNotificationsMissed > 0 && longEnoughAgo(lastNotified)) {
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

