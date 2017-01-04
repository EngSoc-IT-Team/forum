/**
 * Created by Carson on 27/11/2016.
 */

"use strict";

var defaultTables = require("../config/defaultTables.json");

/**
 * Checks if the queried table name is an actual table in database.
 * @param tableName the table query
 * @returns {boolean} true if tableName is an actual table, false if not
 */
exports.isGoodTableName = function (tableName) {
    return getTableNames().includes(tableName);
}

/**
 * Takes the names of the tables used in database (defined in defaultTables.json)
 * and puts them in an array.
 * @returns {Array} names of tables in defaultTables.json
 */
function getTableNames() {
    var tables = []; //will hold name of each table
    for (var index in defaultTables) {
        tables.push(defaultTables[index]['tablename']);
    }
    return tables;
}

/**
 * Finds the index of a tablename in defaultTables.json.
 * @param tableName tablename to look up in defaultTables.json.
 * @returns {*} Index of table with tablename in defaultTables.json.
 * If tablename doesn't appear in json file, returns -1.
 */
exports.findTable = function (tableName) {
    for (var index in defaultTables) {
        if (defaultTables[index]['tablename'] == tableName) {
            return index;
        }
    }
    return -1;
}