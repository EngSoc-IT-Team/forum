/**
 * Created by Carson on 02/02/2017.
 */

"use strict";
module.exports = { //TODO make it a constant object and then export that
    //TODO re-organize and comment it out

    TABLE_NAME: "tablename",
    FIELDS: "fields",
    TABLE: "table",
    TYPE: "type",
    DEFAULT: "default",
    PRIMARY_KEY: "primaryKey",
    OPERATOR: "operator",
    VALUE: "value",
    TRUE: "true",
    FALSE: "false",
    UNDEFINED: "undefined",
    SYMBOL: "symbol",
    OBJECT: "object",
    FUNCTION: "function",
    NUMBER: "number",
    BOOLEAN: "boolean",
    STRING: "string",
    PROFILE: "profile",
    TO: "to",
    QUEENS_EMAIL: "@queensu.ca",
    NEED_LOGIN: "needLogin",

    LOGIN_PAGE: "/login",
    ABOUT_PAGE: "/about",
    NEW_PAGE: "/new",
    LIST_PAGE: "/list",
    PROFILE_PAGE: "/profile",
    GUIDELINES_PAGE: "/guidelines",
    DEV_PAGE: "/dev",
    EVAL_PAGE: "/eval",
    HELP_PAGE: "/help",
    CLASS_PAGE: "/class",
    SEARCH_PAGE: "/search",
    LOGOUT_PAGE: "/logout",
    VOTE_PAGE: "/vote",
    SUBSCRIBE_PAGE: "/subscribe",
    INFO_PAGE: "/info",
    LANDING_PAGE: "/",

    ZERO: "0",
    ONE: "1",

    //NOTE: These literals do not follow the same
    //format because there are uppercase and lowercase instances
    DESC: "DESC",
    desc: "desc",
    ASC: "ASC",
    asc: "asc",

    IN: "in",
    BETWEEN: "between",
    LIKE: "like",

    HOST: "host",
    USER: "user",
    SECRET: "secret",
    SIMPLE_SECRET: "simplesecret",
    DATABASE: "database",
    MAX_CONNECTIONS: "maxConnections",
    PRODUCTION: "production",
    DATABASE_SETUP_NEEDED: "databaseSetupNeeded",
    LOAD_MOCK_DATA: "loadMockData",
    UTF8: "utf8",
    ADMIN: "admin",
    USER_COOKIE: "usercookie",

    FIELD_UPVOTES: "upvotes",
    FIELD_DOWNVOTES: "downvotes",
    FIELD_NETVOTES: "netVotes",
    FIELD_AUTHOR: "author",
    FIELD_ID: "id",
    FIELD_CONTENT: "content",
    FIELD_TIMESTAMP: "timestamp",
    FIELD_USER_ID: "userID",
    FIELD_TITLE: "title",
    FIELD_TAGS: "tags",
    FIELD_SUMMARY: "summary",
    FIELD_ITEM_ID: "itemID",
    FIELD_TYPE: "type",

    POST_TABLE: "post",
    FIELD_ANSWERED: "answered",

    COMMENT_TABLE: "comment",
    FIELD_IS_SOLUTION: "isSolution",
    FIELD_COMMENT_LEVEL: "commentLevel",
    FIELD_PARENT_POST: "parentPost",
    FIELD_PARENT_COMMENT: "parentComment",

    USER_TABLE: "user",
    FIELD_NETID: "netid",
    FIELD_USERNAME: "username",
    FIELD_TOTAL_UPVOTES: "totalUpvotes",
    FIELD_TOTAL_DOWNVOTES: "totalDownvotes",
    FIELD_TOTAL_SOLVED: "totalSolved",
    FIELD_REPORT_COUNT: "reportCount",
    FIELD_DATE_JOINED: "dateJoined",
    FIELD_ACCEPTED_TERMS: "acceptedTerms",
    FIELD_PRIVILEGE: "privilege",

    REPORT_TABLE: "report",
    FIELD_REPORT_REASON: "reportReason",
    FIELD_REPORT: "report",
    FIELD_REPORTING_USER: "reportingUser",
    FIELD_REPORTED_USER: "reportedUser",
    FIELD_RELATED_COMMENT_OR_POST_ID: "relatedCommentOrPostID",

    TAG_TABLE: "tag",
    FIELD_NAME: "name",
    FIELD_RELATED_TAGS: "relatedTags",

    VOTE_TABLE: "vote",
    FIELD_COMMENT_OR_POST_ID: "commentOrPostID",
    FIELD_VOTE_VALUE: "voteValue",

    SESSION_TABLE: "session",
    FIELD_SESSION_START: "sessionStart",

    CLASS_TABLE: "class",
    FIELD_COURSE_CODE: "courseCode",
    FIELD_LONG_SUMMARY: "longSummary",

    LINK: "link",
    FIELD_TRUSTED: "trusted",
    FIELD_DATE_ADDED: "dateAdded",
    FIELD_ADDED_BY: "addedBy",

    SUBSCRIPTIONS_TABLE: "subscriptions",
    FIELD_LAST_NOTIFIED: "lastNotified",
    FIELD_NUM_NOTIFICATIONS_MISSED: "numNotificationsMissed",
    FIELD_NUM_TIME_NOTIFIED: "numTimesNotified",
    FIELD_DATE_SUBSCRIBED: "dateSubscribed",

    SAVED_TABLE: "saved",
    FIELD_DATE_SAVED: "dateSaved",

    CONTRIBUTION_TABLE: "contribution",
    FIELD_DATE: "date",

    SWEEPER_CANCEL_JOB: "cancelJob",
    SWEEP: "sweep"
};