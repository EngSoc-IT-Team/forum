/**
 * Created by Carson on 04/01/2017.
 */

"use strict";

var defaultTables = require('../config/defaultTables.json');
var tableQueryEscaper = require('./TableQueryEscaper.js');

/**
 * Checks if queried field is a good field for the table being queried.
 * @param fieldName Field querying.
 * @param tableName Table in which the field is queried.
 * @returns {boolean} true if field exists in given table, else false
 */
exports.isGoodField = function (fieldName, tableName) {
    //if table doesn't exist, field doesn't exist by default
    if (!tableQueryEscaper.isGoodTableName(tableName)) {
        return false;
    }
    //else depends on fieldName being in the table specified
    var goodFieldName = getFieldNames(tableName);
    return goodFieldName == null ? false : goodFieldName.includes(fieldName); //if no fields return false
}

/**
 * Takes field names in the given table and puts into array. If the table is invalid returns null.
 * @param tableName Table being queried.
 * @returns {*} Array of fields in the table, if table invalid, returns null.
 */
function getFieldNames(tableName) {
    var fields = []; //holds all of the fields in the given table
    var tableIndex = findTable(tableName); //index of table that holds the fields being checked
    if (tableIndex < 0) { //tableName doesn't exist in defaultTables.json. This should never happen if
        //this function is called from isGoodField()
        return null;
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