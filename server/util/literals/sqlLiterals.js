/**
 * sqlLiterals.js
 *
 * Written by Michael Albinson 11/17/17
 *
 */

"use strict";

module.exports = {
    // This could be extended to its own file if it gets big enough
    query: {
        //sql sort commands
        //NOTE: These literals do not follow the same
        //format because there are uppercase and lowercase instances
        DESC: "DESC",
        desc: "desc",
        ASC: "ASC",
        asc: "asc",

        //operators
        IN: "IN",
        BETWEEN: "BETWEEN",
        LIKE: "LIKE",
        TO: "TO",
        EQUALS: "=",
        GREATER_THAN: ">",
        GREATER_THAN_OR_EQUAL_TO: ">=",
        LESS_THAN: "<",
        LESS_THAN_OR_EQUAL_TO: "<=",
        NOT_EQUAL: "<>",


        // joining words
        AND: "AND",
        OR: "OR"
    },

    //database configurations
    HOST: "host",
    USER: "user",
    SECRET: "secret",
    SIMPLE_SECRET: "simplesecret",
    DATABASE: "database",
    MAX_CONNECTIONS: "maxConnections",
    UTF8: "utf8",

    //miscellaneous database table information
    TABLE_NAME: "tablename",
    FIELDS: "fields",
    TABLE: "table",
    TYPE: "type",
    DEFAULT: "default",
    PRIMARY_KEY: "primaryKey"
};