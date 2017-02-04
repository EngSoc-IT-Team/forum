"use strict";

var mysql = require('mysql');
var log = require('./log');
var escaper = require('./QueryEscaper');
var lit = require('./StringLiterals.js');

const allowedOperators = ["like", "<=", ">=", ">", "<", "=", "!=", "<>"] //TODO: implement 'in' and 'between' operators

exports.update = function(table, dbObject) {
	if (!dbObject[lit.FIELD_ID])
		return log.warn("The field 'id' must be set in order to update a row");

	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to UPDATE");

	var base = "UPDATE " + table + " SET ";
	var dboBrokenDown = breakdownDBObject(dbObject, false, false, false, true, false, table);
	return base + dboBrokenDown + " WHERE id=" + exports.escapeID(dbObject[lit.FIELD_ID]) + ";";
};

exports.insert = function(table, dbObject) {
	if (!dbObject[lit.FIELD_ID])
		return log.warn("The field 'id' must be set in order to insert a row");

	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to INSERT");

	var base = "INSERT INTO " + table + " ";
	var dboBrokenDown = breakdownDBObject(dbObject, true, true, true, false, false, table);

	if (!dboBrokenDown)
		return undefined;

	return base + dboBrokenDown[0] + " VALUES " + dboBrokenDown[1] + ";";
};

exports.get = function(table, rowId) {
	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to GET");

	return "SELECT * FROM " + table + " WHERE id=" + mysql.escape(rowId) + ";";
};

exports.query = function(table, dbObject) {
	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to QUERY");

	var base =  "SELECT * FROM " + table + " WHERE ";
	var dboBrokenDown = breakdownDBObject(dbObject, false, true, true, false, true, table);
	return base + dboBrokenDown;
	
};

// This is the only way we will allow a record to be deleted (by id)
exports.delete = function(table, id) {
	if (!escaper.isValidTableName(table))
		return log.warn("Invalid table name used for call to DELETE");

	return "DELETE FROM " + table + " WHERE id=" + resolveObjectType(id) + ";";
};

exports.escapeLimit = function(limitNum) {
	return "LIMIT " + resolveObjectType(limitNum);
};

exports.escapeOrderBy = function(field, ascOrDesc) {
	return "ORDER BY " + field + " " + ascOrDesc;
}

exports.escapeID = function(idToEscape) {
	return mysql.escape(idToEscape);
};

// if string, return a string of format "(field1='value1', field2='value2' ...)"
// if true, return string of column ids and values where the indices are the same for each list
// i.e. ["field1, field2, field3", "'value1', 'value2, 'value3'"]
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

	if (returnAsTwoStrings){
		for (var prop in obj) {
			if (!escaper.isValidField(table, prop))
				return log.warn('An invalid field "' + prop + '" for the table "' + table + '" was entered');

			if (!allowSettingId && prop == 'id') // skip field if setting the ID is not allowed
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
		for (var prop in obj) {
			if (!escaper.isValidField(table, prop))
				return log.warn('An invalid field "' + prop + '" for the table "' + table + '" was entered');

			if (!allowSettingId && prop == 'id') 
				continue;

			if (typeof obj[prop] == 'object' && obj[prop][lit.OPERATOR])
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

function resolveObjectType(resolveThis) {
	var objectType = typeof resolveThis;
	if (objectType == lit.UNDEFINED || objectType == lit.SYMBOL || objectType == lit.FUNCTION || objectType == lit.OBJECT)
		return log.warn("Objects with type '" + objectType + "' are not currently implemented, please pass a number, boolean or string");

	if (objectType == lit.NUMBER)
		return resolveThis.toString();

	if (!isNaN(resolveThis))
		return resolveThis;

	if (objectType == lit.BOOLEAN || resolveThis === lit.TRUE || resolveThis === lit.FALSE) {
		if (resolveThis === true || resolveThis == lit.TRUE)
			return lit.ONE;
		else
			return lit.ZERO;
	}

	if (objectType == lit.STRING){
		return mysql.escape(resolveThis);
	}
}

function checkOperator(op) {
	if (allowedOperators.includes(op.toLowerCase()))
		return op.toUpperCase();
	else {
		if (op.toLowerCase() == lit.IN || op.toLowerCase() == lit.BETWEEN)
			log.warn('The operator "' + op + '" has not yet been implemented... \n Using "=" instead.');
		else
			log.warn('An unacceptable operator was passed into the query, replacing with the equals operator');
		return '=';
	}
}