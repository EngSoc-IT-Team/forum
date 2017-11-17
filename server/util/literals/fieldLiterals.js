/**
 * sqlLiterals.js
 *
 * Written by Michael Albinson 11/17/17
 *
 * Field names for all database columns
 */

"use strict";

module.exports = {
    //fields common to more than one table
    UPVOTES: "upvotes",
    DOWNVOTES: "downvotes",
    NETVOTES: "netVotes",
    AUTHOR: "author",
    ID: "id",
    CONTENT: "content",
    TIMESTAMP: "timestamp",
    USER_ID: "userID",
    TITLE: "title",
    TAGS: "tags",
    SUMMARY: "summary",
    ITEM_ID: "itemID",
    TYPE: "type",
    DUPLICATE: "duplicate",
    GEN_TAGS: "generatedTags",
    PARENT: "parent",

    //fields for post table only
    ANSWERED: "answered",

    //fields for comment table only
    IS_SOLUTION: "isSolution",
    COMMENT_LEVEL: "commentLevel",
    PARENT_COMMENT: "parentComment",

    //fields for user table only
    NETID: "netid",
    USERNAME: "username",
    TOTAL_UPVOTES: "totalUpvotes",
    TOTAL_DOWNVOTES: "totalDownvotes",
    TOTAL_SOLVED: "totalSolved",
    REPORT_COUNT: "reportCount",
    DATE_JOINED: "dateJoined",
    ACCEPTED_TERMS: "acceptedTerms",
    PRIVILEGE: "privilege",

    //fields for report table only
    REPORT_REASON: "reportReason",
    REPORT: "report",
    REPORTING_USER: "reportingUser",
    REPORTED_USER: "reportedUser",
    RELATED_ITEM_ID: "relatedItemID",

    //fields for tag table only
    NAME: "name",
    RELATED_TAGS: "relatedTags",

    //fields for vote table only
    VOTE_VALUE: "voteValue",

    //fields for session table only
    SESSION_START: "sessionStart",

    //fields for class table only
    COURSE_CODE: "courseCode",
    LONG_SUMMARY: "longSummary",
    PREREQS: "prereqs",
    AVERAGE_RATING: "averageRating",
    INSTRUCTOR: "instructor",
    CREDIT: "credit",
    RATINGS: "ratings",

    //fields for link table only
    TRUSTED: "trusted",
    LINK: "link",
    ADDED_BY: "addedBy",

    //fields for subscriptions table only
    LAST_NOTIFIED: "lastNotified",
    NUM_NOTIFICATIONS_MISSED: "numNotificationsMissed",
    NUM_TIME_NOTIFIED: "numTimesNotified",

    //fields for rating table only
    RATING: "rating"
};