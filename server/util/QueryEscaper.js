/**
 * Created by Carson on 09/01/2017.
 */

"use strict";

var defaultTables = require('../config/defaultTables.json');

var validTables = getTables();

exports.isValidTableName = isValidTableName; //need to use isValidTableName as an export AND in this file

/**
 * Checks if the queried field is actually a field in the table being queried.
 * @param tableName Table being queried.
 * @param fieldName Field in tableName being queried.
 * @returns {*} Boolean: true if field is valid in a valid table, else false.
 */
exports.isValidField = function (tableName, fieldName) {
    //if table doesn't exist, field doesn't exist by default
    if (!isValidTableName(tableName)) {
        return false;
    }
    return (validTables[tableName].includes(fieldName));
}

/**
 * Checks if the queried table name is actually a table in the database.
 * @param tableName Table being queried.
 * @returns {boolean} True if the table is in the database, else false.
 */
function isValidTableName(tableName) {
    return (tableName in validTables);
}

/**
 * Puts tables and their fields found in defaultTables.json into a dictionary.
 * @returns {{}} Dictionary holding all valid tables and fields in the form {table: [every, valid, field]}
 */
function getTables() {
    var tables = {};
    for (var index in defaultTables) {
        var tableName = defaultTables[index]['tablename'];
        tables[tableName] = getFieldNames(tableName);
    }
    return tables;
}

/**
 * Takes field names in the given table and puts into array.
 * @param tableName Table being queried.
 * @returns {*} Array of fields in the table, if table invalid, returns null.
 */
function getFieldNames(tableName) {
    var fields = []; //holds all of the fields in the given table
    var tableIndex = findTable(tableName); //index of table that holds the fields being checked
    if (tableIndex < 0) { //tableName doesn't exist in defaultTables.json. This should never happen if
        return null;     //this function is called from getTables()
    }
    for (var index in defaultTables[tableIndex]['fields']) { //iterates through the given table to find fields
        fields.push(index);
    }
    return fields;
}

/**
 * Finds the index of a tablename in defaultTables.json.
 * @param tableName tablename to look up in defaultTables.json.
 * @returns {*} Index of table with tablename in defaultTables.json.
 * If tablename doesn't appear in json file, returns -1.
 */
function findTable(tableName) {
    for (var index in defaultTables) {
        if (defaultTables[index]['tablename'] == tableName) {
            return index;
        }
    }
    return -1;
}