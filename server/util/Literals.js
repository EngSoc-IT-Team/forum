/**
 * Created by Carson on 02/02/2017.
 * String literals to be used for other files.
 * Constant object is exported.
 */

"use strict";

const routeLiterals = require('./literals/routeLiterals');
const tableLiterals = require('./literals/tableLiterals');
const fieldLiterals = require('./literals/fieldLiterals');

const literals = {

    //miscellaneous database table information
    TABLE_NAME: "tablename",
    FIELDS: "fields",
    TABLE: "table",
    TYPE: "type",
    DEFAULT: "default",
    PRIMARY_KEY: "primaryKey",

    //miscellaneous user information
    PROFILE: "profile",
    QUEENS_EMAIL: "@queensu.ca",

    //variable information, such as types, operations tec.
    OPERATOR: "operator",
    VALUE: "value",
    UNDEFINED: "undefined",
    SYMBOL: "symbol",
    OBJECT: "object",
    FUNCTION: "function",
    NUMBER: "number",
    BOOLEAN: "boolean",
    STRING: "string",

    //web pages routes, with '/'
    routes: routeLiterals,

    //values in string format: e.g. boolean value true as \'true\'
    ZERO: "0",
    ONE: "1",
    TRUE: "true",
    FALSE: "false",

    //NOTE: These literals do not follow the same
    //format because there are uppercase and lowercase instances
    //sql sort commands
    DESC: "DESC",
    desc: "desc",
    ASC: "ASC",
    asc: "asc",

    //words for string manipulations, sql strings
    IN: "in",
    BETWEEN: "between",
    LIKE: "like",
    TO: "to",

    //database configurations
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
    PORT: "port",

    //session information
    ADMIN: "admin",
    USER_COOKIE: "usercookie",
    NEED_LOGIN: "needLogin",

    //fields common to more than one table
    tables: tableLiterals,
    fields: fieldLiterals,

    //fields for sweeper class
    SWEEPER_CANCEL_JOB: "cancelJob",
    SWEEP: "sweep",

    //integer values
    MIN_NUM_MISSED_NOTIFICATIONS: 0, //at least one missed notification needed
    MIN_MS_TO_NOTIFY_AGAIN: 24*60*60*1000, //one day in milliseconds
    MIN_RELATION_MEASURE: 1,

    //keys for objects
    KEY_MEASURE: "measure",
    KEY_WORD_RELATER: "wordRelater",
    KEY_DOC_INFO: "documentInfo",

    //API keys/information
    AUTO_TAG_API_KEY: "sim/u46ka7/UoVlIZFYomudRRxO1",
    AUTO_TAG_ALGORITHM: "algo://nlp/AutoTag/1.0.1"
};

module.exports = literals;