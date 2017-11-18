/**
 * Created by Carson on 02/02/2017.
 * String literals to be used for other files.
 * Constant object is exported.
 */

"use strict";

const routeLiterals = require('./literals/routeLiterals');
const tableLiterals = require('./literals/tableLiterals');
const fieldLiterals = require('./literals/fieldLiterals');
const sqlLiterals = require('./literals/sqlLiterals');
const configLiterals = require('./literals/configLiterals');

const literals = {
    //web pages routes, with '/'
    routes: routeLiterals,

    //database schema literals: table and field names
    tables: tableLiterals,
    fields: fieldLiterals,

    //sql setup and query data
    sql: sqlLiterals,

    // related to the configuration file and DatabaseManager
    config: configLiterals,

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

    //values in string format: e.g. boolean value true as \'true\'
    ZERO: "0",
    ONE: "1",
    TRUE: "true",
    FALSE: "false",

    //session information
    ADMIN: "admin",
    USER_COOKIE: "usercookie",
    NEED_LOGIN: "needLogin",

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