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
	var dboBrokenDown = breakdownDBObject(dbObject, false, false, false, true, false, table);
	return base + dboBrokenDown + " WHERE id=" + exports.escapeID(dbObject[lit.fields.ID]) + ";";
};

/** Creates an escaped "insert" query provided the table and database object JSON
 *
 * @param table: The table that the row that's being updated is on
 * @param dbObject: The database object JSON to be broken down and escaped
 * @returns {*}: The escaped query string
 */
exports.insert = function(table, dbObject) {
	if (!dbObject[lit.fields.ID])
		return log.warn("The field 'id' must be set in order to insert a row");

	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to INSERT");

	var base = "INSERT INTO " + table + " ";
	var dboBrokenDown = breakdownDBObject(dbObject, true, true, true, false, false, table);

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
 * @param dbObject: the database object JSON to be broken down and escaped
 * @returns {string}: The escaped query string
 */
exports.query = function(table, dbObject) {
	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to QUERY");

	var base =  "SELECT * FROM " + table;

	if (!compare.isEmpty(dbObject))
		return base + " WHERE " + breakdownDBObject(dbObject, false, true, true, false, true, table);
	else
		return base;
	
};

/** Creates an escaped "delete" query provided the table and database object JSON
 *
 * @param table: The table that the row that's being updated is on
 * @param id: the if of a database row to delete
 * @returns {string}: The escaped query string
 */
exports.delete = function(table, id) {
	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to DELETE");

	return "DELETE FROM " + table + " WHERE id=" + resolveObjectType(id) + ";";
};

/** Escapes the limit clause for queries
 *
 * @param limitNum: The limit number that needs to be escaped
 * @returns {string}: The complete sanitized escape clause
 */
exports.escapeLimit = function(limitNum) {
	return "LIMIT " + resolveObjectType(limitNum);
};

/** Escapes the order by clause for queries
 *
 * @param table: the table the field to order by should be on
 * @param field: the field to order the query by
 * @param ascOrDesc: indicates whether the field should be ordered by ascending or descending order. Must be the string 'asc' or 'desc' or their upper case versions
 * @returns {*}: the escaped order by clause or undefined if the field or operator passed in is invalid
 */
exports.escapeOrderBy = function(table, field, ascOrDesc) {
    var asc = "asc";
    var desc = "desc";
    if (!escaper.isValidField(table, field))
		return undefined;

    if (ascOrDesc !== asc && ascOrDesc !== asc.toUpperCase() && ascOrDesc !== desc && ascOrDesc !== desc.toUpperCase())
    	return undefined;

	return "ORDER BY " + field + " " + ascOrDesc;
};

/** Escapes the id passed in
 *
 * @param idToEscape: the ID that needs to be escaped
 * @returns {*}: the escaped id
 */
exports.escapeID = function(idToEscape) {
	return mysql.escape(idToEscape);
};

/** Breaks down the passed in DBObject and escapes it to form the base of a query string based on the arguments passed in
 *
 * @param obj: the database object to break down
 * @param returnAsTwoStrings: Boolean, whether or not to pass the string
 * @param allowSettingId: Boolean, whether to allow IDs to be *set* while building the query string or not, generally set to false
 * @param parenthesis: Boolean, whether or not to wrap the returned string in parentheses or not
 * @param isUpdate: Boolean, whether the string is for an update query string or not
 * @param addOne: Boolean, whether or not to skip over the first key in the object keys (i.e. to prevent setting the row)
 * @param table: The table to query on
 * @returns {*}: The database object broken down into a string, as an array of two strings if the returnAsTwoStrings boolean is set to true
 */
function breakdownDBObject(obj, returnAsTwoStrings, allowSettingId, parenthesis, isUpdate, addOne, table) {
	var fields = "";
	var values = "";
	var dbObjectString = "";

	if (parenthesis){
		fields = '(';
		values = '(';
		dbObjectString = "(";
	}

	var numOfFields = Object.keys(obj).length;
	var itrs = 0;

	if (!allowSettingId || addOne)
		itrs = 1;

    var prop;
	if (returnAsTwoStrings){
		for (prop in obj) {
            if (!obj.hasOwnProperty(prop))
                continue;

			if (!escaper.isValidField(table, prop))
				return log.warn('An invalid field "' + prop + '" for the table "' + table + '" was entered');

			if (!allowSettingId && prop === 'id') // skip field if setting the ID is not allowed
				continue;

			fields += prop;
			values += resolveObjectType(obj[prop]);
			if (itrs < numOfFields-1) { // skip field if setting the ID is not allowed
				fields += ' , ';
				values += ' , '; 
			}
			else {
				if (parenthesis) {
					fields += ')';
					values += ')'; 
				}
			}
			itrs++;
		}
		return [fields, values];
	}
	else {
		for (prop in obj) {
			if (!obj.hasOwnProperty(prop))
				continue;

			if (!escaper.isValidField(table, prop))
				return log.warn('An invalid field "' + prop + '" for the table "' + table + '" was entered');

			if (!allowSettingId && prop === 'id')
				continue;
			
			if (typeof obj[prop] === 'object' && obj[prop] !== null && obj[prop][lit.OPERATOR])
				dbObjectString += prop + " " + checkOperator(obj[prop][lit.OPERATOR]) + " " + resolveObjectType(obj[prop][lit.VALUE]);
			else
				dbObjectString += prop + "=" + resolveObjectType(obj[prop]);

			if (itrs < numOfFields) //until the second to last element do this
				if (isUpdate) {
					if (itrs < numOfFields - 1) // ugly but needs to be done
						dbObjectString += ",";
				}
				else
					dbObjectString += " AND ";
			else
				if (parenthesis)
					dbObjectString += ")";

			itrs++;
		}
		return dbObjectString;
	}
}

/** Resolves the object type of the object that is passed in. This is, perhaps, the core of the security of the website,
 * ensuring objects of unsecured types are rejected, causing queries to fail, and escaping queries to prevent SQL injection.
 *
 * @param resolveThis: the object that needs to be resolved
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

	if (objectType === lit.BOOLEAN || resolveThis === lit.TRUE || resolveThis === lit.FALSE) {
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

/** Checks to ensure that the operator being used is a valid one. Replaces invalid operators with the equals operator
 * if the operator passed in is invalid.
 *
 * @param op: The operator trying to be used
 * @returns {*}: The operator if it is valid, returns = if it is invalid
 */
function checkOperator(op) {
	if (allowedOperators.includes(op.toLowerCase()))
		return op.toUpperCase();
	else {
		if (op.toLowerCase() === lit.IN || op.toLowerCase() === lit.BETWEEN)
			log.warn('The operator "' + op + '" has not yet been implemented... \n Using "=" instead.');
		else
			log.warn('An unacceptable operator was passed into the query, replacing with the equals operator');
		return '=';
	}
}