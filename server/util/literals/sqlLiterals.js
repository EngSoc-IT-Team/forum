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

        //words for string manipulations, sql strings
        IN: "in",
        BETWEEN: "between",
        LIKE: "like",
        TO: "to"
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