"use strict";

var mysql = require('mysql');
var log = require('./log')

const allowedOperators = ["like", "<=", ">=", ">", "<", "=", "!=", "<>"] //TODO: implement 'in' and 'between' operators

exports.update = function(table, dbObject) {
	if (!dbObject["id"])
		return log.warn("The field 'id' must be set in order to update a row");

	var base = "UPDATE " + table + " SET ";
	var dboBrokenDown = breakdownDBObject(dbObject, false, false, false, true, false);
	return base + dboBrokenDown + " WHERE id=" + exports.escapeID(dbObject["id"]) + ";";
}

exports.insert = function(table, dbObject) {
	if (!dbObject['id'])
		return log.warn("The field 'id' must be set in order to insert a row");

	var base = "INSERT INTO " + table + " ";
	var dboBrokenDown = breakdownDBObject(dbObject, true, true, true, false, false);
	return base + dboBrokenDown[0] + " VALUES " + dboBrokenDown[1] + ";";
}

exports.get = function(table, rowId) {
	return "SELECT * FROM " + table + " WHERE id=" + mysql.escape(rowId) + ";";
}

exports.query = function(table, dbObject) {
	var base =  "SELECT * FROM " + table + " WHERE ";
	var dboBrokenDown = breakdownDBObject(dbObject, false, true, true, false, true);
	return base + dboBrokenDown;
	
}

// This is the only way we will allow a record to be deleted (by id)
exports.delete = function(table, id) {
	return "DELETE FROM " + table + " WHERE id=" + resolveObjectType(id) + ";";
}

exports.escapeLimit = function(limitNum) {
	return "LIMIT " + resolveObjectType(limitNum);
}

exports.escapeOrderBy = function(field, ascOrDesc) {
	return "ORDER BY " + field + " " + ascOrDesc;
}

exports.escapeID = function(idToEscape) {
	return mysql.escape(idToEscape);
}

// if string, return a string of format "(field1='value1', field2='value2' ...)"
// if true, return string of column ids and values where the indices are the same for each list
// i.e. ["field1, field2, field3", "'value1', 'value2, 'value3'"]
function breakdownDBObject(obj, returnAsTwoStrings, allowSettingId, parenthesis, isUpdate, addOne) {
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
		itrs = 1

	if (returnAsTwoStrings){
		for (var prop in obj) {
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
			if (!allowSettingId && prop == 'id') 
				continue;

			if (typeof obj[prop] == 'object' && obj[prop]['operator'])
				dbObjectString += prop + " " + checkOperator(obj[prop]['operator']) + " " + resolveObjectType(obj[prop]['value'])
			else
				dbObjectString += prop + "=" + resolveObjectType(obj[prop])

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
	if (objectType == 'undefined' || objectType == 'symbol' || objectType == 'function' || objectType == 'object')
		return log.warn("Objects with type '" + objectType + "' are not currently implemented, please pass a number, boolean or string");

	if (objectType == "number")
		return resolveThis.toString();

	if (!isNaN(resolveThis))
		return resolveThis;

	if (objectType == "boolean" || resolveThis === "true" || resolveThis === "false") {
		if (resolveThis === true || resolveThis == "true")
			return "1";
		else
			return "0";
	}

	if (objectType == "string"){
		return mysql.escape(resolveThis);
	}
}

function checkOperator(op) {
	if (allowedOperators.includes(op.toLowerCase()))
		return op.toUpperCase();
	else {
		if (op.toLowerCase() == 'in' || op.toLowerCase() == 'between')
			log.warn('The operator "' + op + '" has not yet been implemented... \n Using "=" instead.');
		else
			log.warn('An unacceptable operator was passed into the query, replacing with the equals operator');
		return '=';
	}
}