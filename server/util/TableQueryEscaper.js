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
exports.escapeTable = function (tableName) {
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