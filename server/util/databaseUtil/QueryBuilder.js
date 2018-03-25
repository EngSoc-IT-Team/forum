/*
 * QueryBuilder.js
 * Written by Michael Albinson  11/22/16
 *
 * Functional interface for building queries and ensuring they are escaped and valid before
 * being sent to the database.
 */

"use strict";

var mysql = require('mysql');
var log = require('./../log');
var escaper = require('./QueryEscaper');
var lit = require('./../Literals.js');
var compare = require('./../Compare');

// the operators which are allowed to be used to query the database TODO: implement the 'in' and 'between' operators
const allowedOperators = ["like", "<=", ">=", ">", "<", "=", "!=", "<>"];

/** Creates an escaped "update" query provided the table and database object JSON
 *
 * @param table: The table that the row that's being updated is on
 * @param dbObject: The database object JSON to be broken down and escaped
 * @returns {string}: The escaped query string
 */
exports.update = function(table, dbObject) {
	if (!dbObject[lit.fields.ID])
		return log.warn("The field 'id' must be set in order to update a row");

	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to UPDATE");

	var base = "UPDATE " + table + " SET ";
	var dboBrokenDown = buildUpdateQueryString(dbObject, table);
	return base + dboBrokenDown + " WHERE id=" + exports.escapeID(dbObject[lit.fields.ID]) + ";";
};

/** Creates an escaped "insert" query provided the table and database object JSON
 *
 * @param table: The table that the row that's being updated is on
 * @param dbObject: The database object JSON to be broken down and escaped
 * @returns {string}: The escaped query string
 */
exports.insert = function(table, dbObject) {
	if (!dbObject[lit.fields.ID])
		return log.warn("The field 'id' must be set in order to insert a row");

	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to INSERT");

	var base = "INSERT INTO " + table + " ";
	var dboBrokenDown = buildInsertQueryString(dbObject, table);

	if (!dboBrokenDown)
		return undefined;

	return base + dboBrokenDown[0] + " VALUES " + dboBrokenDown[1] + ";";
};

/** Creates an escaped "select" query provided the table and database row's ID that only returns one row if the row exists,
 * none if it doesn't
 *
 * @param table: The table that the row that's being updated is on
 * @param rowId: The ID of the database row to get
 * @returns {string}: The escaped query string
 */
exports.get = function(table, rowId) {
	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to GET");

	return "SELECT * FROM " + table + " WHERE id=" + mysql.escape(rowId) + ";";
};

/** Creates an escaped "select" query provided the table and database object JSON
 *
 * @param table: The table that the row that's being updated is on
 * @param queryArray: the array of Queries to be escaped
 * @returns {string}: The escaped query string
 */
exports.query = function(table, queryArray) {
	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to QUERY");

	var base =  "SELECT * FROM " + table;

	if (!compare.isEmpty(queryArray))
		return base + " WHERE " + breakdownQueryObjects(queryArray);
	else
		return base;
	
};

/**
 * Breaks an array of query objects into a query string to be passed to the database
 *
 * @param qArr: {Array}[Query] An array of Query objects
 */
function breakdownQueryObjects(qArr) {
	var finalStr = '';
	for (var i in qArr) {
		if (qArr.hasOwnProperty(i)) {
            if (parseInt(i) === 0)
                finalStr += getAsSingleString(qArr[i], true);
            else
                finalStr += getAsSingleString(qArr[i], false);
        }
	}

	return finalStr;
}

/**
 * Deconstructs a single SQLQuery object into a partial query string
 *
 * @param obj {SQLQuery}
 * @param isFirst {boolean}
 * @return {string}
 */
function getAsSingleString(obj, isFirst) {
	var field, operator, value, joiner;
    var returnString = '';

    [field, operator, value, joiner] = obj.getQueryDataArray();
    if (!isFirst)
        returnString += ' ' + joiner + ' '; // the joiner has already been verified in the Query object

	returnString += field + " " + operator + " " + resolveObjectType(value);

    return returnString;
}

/** Creates an escaped "delete" query provided the table and database object JSON
 *
 * @param table {string}: The table that the row that's being updated is on
 * @param id {string}: the if of a database row to delete
 * @returns {string}: The escaped query string
 */
exports.delete = function(table, id) {
	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to DELETE");

	return "DELETE FROM " + table + " WHERE id=" + resolveObjectType(id) + ";";
};

/** Escapes the limit clause for queries
 *
 * @param limitNum {int}: The limit number that needs to be escaped
 * @returns {string}: The complete sanitized escape clause
 */
exports.escapeLimit = function(limitNum) {
	return "LIMIT " + resolveObjectType(limitNum);
};

/** Escapes the order by clause for queries
 *
 * @param table {string}: the table the field to order by should be on
 * @param field {string}: the field to order the query by
 * @param ascOrDesc {string]: indicates whether the field should be ordered by ascending or descending order. Must be the string 'asc' or 'desc' or their upper case versions
 * @returns {string|undefined}: the escaped order by clause or undefined if the field or operator passed in is invalid
 */
exports.escapeOrderBy = function(table, field, ascOrDesc) {
    var asc = "asc";
    var desc = "desc";
    if (!escaper.isValidField(table, field))
		return log.error('QueryBuilder Error: Field \'' + field + '\' is not valid for table \'' + table + '\'');

    if (ascOrDesc !== asc && ascOrDesc !== asc.toUpperCase() && ascOrDesc !== desc && ascOrDesc !== desc.toUpperCase())
    	return log.error('QueryBuilder Error: Order \'' + ascOrDesc + '\' is not one of "asc", "desc", "ASC", "DESC"');

	return "ORDER BY " + field + " " + ascOrDesc;
};

/** Escapes the id passed in
 *
 * @param idToEscape {string}: the ID that needs to be escaped
 * @returns {string}: the escaped id
 */
exports.escapeID = function(idToEscape) {
	return mysql.escape(idToEscape);
};

/**
 *
 * @param obj {DBRow}
 * @param table {string}
 * @return {[string, string]}
 */
function buildInsertQueryString(obj, table) {
    var fields = "(";
    var values = "(";
    var numOfFields = Object.keys(obj).length;
    var itrs = 0;

    for (var prop in obj) {
        if (!obj.hasOwnProperty(prop))
            continue;

        if (!escaper.isValidField(table, prop))
            return log.warn('An invalid field "' + prop + '" for the table "' + table + '" was entered');

        fields += prop;
        values += resolveObjectType(obj[prop]);
        if (itrs < numOfFields-1) { // skip field if setting the ID is not allowed
            fields += ', ';
            values += ', ';
        }
        else {
			fields += ')';
			values += ')';
        }
        itrs++;
    }
    return [fields, values];
}

/**
 *
 * @param obj {DBRow}
 * @param table {string}
 * @return {string}
 */
function buildUpdateQueryString(obj, table) {
    var dbObjectString = "";
    var itrs = 0;
    var numOfFields = Object.keys(obj).length;

    for (var prop in obj) {
        if (!obj.hasOwnProperty(prop) || prop === 'id')
            continue;

        if (!escaper.isValidField(table, prop))
            return log.warn('An invalid field "' + prop + '" for the table "' + table + '" was entered');

        dbObjectString += prop + "=" + resolveObjectType(obj[prop]);

        if (itrs < numOfFields - 2)
            dbObjectString += ", ";

        itrs++;
    }
    return dbObjectString;
}

/** Resolves the object type of the object that is passed in. This is, perhaps, the core of the security of the website,
 * ensuring objects of unsecured types are rejected, causing queries to fail, and escaping queries to prevent SQL injection.
 *
 * @param resolveThis {*}: the object/primitive that needs to be resolved
 * @returns {*}: the escaped object, if it is of valid type. Returns undefined otherwise.
 */
function resolveObjectType(resolveThis) {
	var objectType = typeof resolveThis;

    if (resolveThis instanceof Date)
        return mysql.escape(resolveThis);

	if (objectType === lit.NUMBER)
		return resolveThis.toString();

	if (!isNaN(resolveThis))
		return resolveThis;

	if (objectType === lit.BOOLEAN && (resolveThis === lit.TRUE || resolveThis === lit.FALSE)) {
		if (resolveThis === true || resolveThis === lit.TRUE)
			return lit.ONE;
		else
			return lit.ZERO;
	}

	if (objectType === lit.STRING)
		return mysql.escape(resolveThis);

	if (objectType === lit.UNDEFINED)
		return null;

    if (objectType === lit.SYMBOL || objectType === lit.FUNCTION || objectType === lit.OBJECT)
        return log.warn("Objects with type '" + objectType + "' are not currently implemented, please pass a number, boolean or string");
}