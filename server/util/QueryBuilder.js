"use strict";

exports.update = function(table, dbObject) {
	var base = "UPDATE " + table + " SET ";// + keyValPairsToChange + " WHERE id='" +  + "'"
	// ignore limit and order queries
}

exports.insert = function(table, dbObject) {
	var base = "INSERT INTO " + table + " VALUES ";
	var fields;
	var values;

	//ignore limit and order queries
}

exports.get = function(table, rowId) {
	var dbObject = 
	{
		"id": rowId,
		"limit": '1'
	};

	return exports.query(table, dbObject);
}

exports.query = function(table, dbObject) {
	var fields;
	var values;
	var base =  "SELECT * FROM " + table + " WHERE ";

	// allow limit and order queries
}

exports.delete = function(table, id) {
	return "DELETE FROM " + table + " WHERE id='" + id + "'";
	//
}

function breakdownDBObject(obj) {
	var fields = [];
	var values = [];

	for (var prop in obj) {
		fields.push(prop);
		values.push(obj[prop]);
	}

	return [fields, values];
}
