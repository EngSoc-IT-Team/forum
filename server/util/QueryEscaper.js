/**
 * Created by Carson on 09/01/2017.
 */

"use strict";

var defaultTables = require('../config/defaultTables.json');
var lit = require('./StringLiterals.js');

var validTables = getTables();

/**
 * Checks if the queried table name is actually a table in the database.
 * @param tableName Table being queried.
 * @returns {boolean} True if the table is in the database, else false.
 */
exports.isValidTableName = function (tableName) {
    return (tableName in validTables);
};

/**
 * Checks if the queried field is actually a field in the table being queried.
 * @param tableName Table being queried.
 * @param fieldName Field in tableName being queried.
 * @returns {*} Boolean: true if field is valid in a valid table, else false.
 */
exports.isValidField = function (tableName, fieldName) {
    //if table doesn't exist, field doesn't exist by default
    if (!exports.isValidTableName(tableName)) {
        return false;
    }
    return (validTables[tableName].includes(fieldName));
};

/**
 * Puts tables and their fields found in defaultTables.json into a dictionary.
 * @returns {{}} Dictionary holding all valid tables and fields in the form {table: [every, valid, field]}
 */
function getTables() {
    var tables = {};
    for (var index in defaultTables) {
        var tableName = defaultTables[index][lit.TABLE_NAME];
        tables[tableName] = getFieldNames(index);
    }
    return tables;
}

/**
 * Takes field names in the given table and puts into array.
 * @param tableIndex Index of the given table in defaultTables.json.
 * @returns {Array} Array of the fields in the table.
 */
function getFieldNames(tableIndex) {
    var fields = []; //holds all of the fields in the given table
    for (var index in defaultTables[tableIndex]['fields']) { //iterates through the given table to find fields
        fields.push(index);
    }
    return fields;
}