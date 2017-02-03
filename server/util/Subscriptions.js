/**
 * Created by Carson on 15/01/2017.
 */

var nodeMailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var log = require('./log.js');
var dbr = require('./DBRow.js');
var generator = require('./IDGenerator.js');
var literals = require('./StringLiterals.js');

//object that holds the mailing information - who sends it (and their authentication) and connection details
var transport = nodeMailer.createTransport(smtpTransport({
    host: 'outlook.office.com',
    secureConnection: false, //use SSL as this is not a secure connection
    port: 587,
    auth: {
        user: "do-not-reply-forum@engsoc.queensu.ca",
        pass: "Forum1617" //TODO don't store in database
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
    var newRow = new dbr.DBRow(literals.subscriptionsTable);
    newRow.setValue(literals.fieldUserID, userID);
    newRow.setValue(literals.fieldItemID, contentID);
    newRow.setValue(literals.fieldID, generator.generate());
    //TODO set timestamp
    //insert info into database
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
    addToNotificationsMissed(contentID).then(function(contentID){
        emailUsers(contentID);
    }).catch(function (error) {
        log.log("ERROR: " + error);
    });
}

function emailUsers(contentID) { //TODO use content ID to add info in email, like a URL
    return new Promise(function (resolve, reject) {
        getUserIDs(contentID).then(function (userIDs) {
            return userIDs;
        }).then(function (userIDs) {
            //get userIDs for those who should be emailed
            return findUsersToEmail(userIDs);
        }).then(function (userIDs) {
            return setNotificationsMissedToZero(userIDs);
        }).then(function (userIDs) {
            //get net IDs from user IDs
            return getNetIDs(userIDs);
        }).then(function (netIDs) {
            //email users
            for (var i in netIDs) {
                mailOptions[literals.to] = netIDs[i] + literals.queensEmail;
                log.log("MAIL SENT");
                // transport.sendMail(mailOptions);
            }
        }).catch(function (err) {
            reject(err);
        });
    });
}

function addToNotificationsMissed(contentID) {
    var row = new dbr.DBRow(literals.subscriptionsTable);
    row.addQuery(literals.fieldItemID, contentID);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) {
                row.setValue(literals.fieldNumNotificationsMissed, row.getValue(literals.fieldNumNotificationsMissed) + 1);
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
    var row = new dbr.DBRow(literals.subscriptionsTable);
    for (var i in userIDs) {
        row.addQuery(literals.fieldUserID, userIDs[i]);
    }
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) {
                row.setValue(literals.fieldNumNotificationsMissed, 0);
                row.update();
            }
            resolve(userIDs);
        }, function (err) {
            reject(err);
        });
    });
}

function getParentContentID(contentID) {
    var row = new dbr.DBRow(literals.commentTable);
    row.addQuery(literals.fieldID, contentID);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            if (!row.next()) {
                reject("got nothing back");
            }
            (row.getValue(literals.fieldParentComment) == null) ? resolve(row.getValue(literals.fieldParentPost)) :
                resolve(row.getValue(literals.fieldParentComment));
        }, function () {
            reject("No parent");
        });
    });
}

function getUserIDs(contentID) {
    var userIDs = [];
    var row = new dbr.DBRow(literals.subscriptionsTable);
    row.addQuery(literals.fieldItemID, contentID);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) {
                userIDs.push(row.getValue(literals.fieldUserID));
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
    var row = new dbr.DBRow(literals.userTable);
    return new Promise(function (resolve, reject) {
        for (var i in userIDs) {
            row.addQuery(literals.fieldID, userIDs[i]);
        }
        row.query().then(function () {
            while (row.next()) {
                netIDs.push(row.getValue(literals.fieldNetid));
            }
            resolve(netIDs);
        }, function (err) {
            reject(err);
        });
    });
}

function findUsersToEmail(userIDs) {
    var row = new dbr.DBRow(literals.subscriptionsTable);
    var numNotificationsMissed;
    var lastNotified;
    var goodUserIDs = [];
    return new Promise(function (resolve, reject) {
        for (var i in userIDs) {
            row.addQuery(literals.fieldUserID, userIDs[i]);
        }
        row.query().then(function () {
            while (row.next()) {
                numNotificationsMissed = row.getValue(literals.fieldNumNotificationsMissed);
                lastNotified = row.getValue(literals.fieldLastNotified);
                if (numNotificationsMissed > 0 && longEnoughAgo(lastNotified)) {
                    goodUserIDs.push(row.getValue(literals.fieldUserID));
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

