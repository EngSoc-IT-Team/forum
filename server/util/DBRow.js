/*
 * DBRow.js
 * Written by Michael Albinson 11/19/16
 *
 * The cornerstone of the forum
 */

"use strict";

var log = require('./log');
var dbm = require('./databaseUtil/DatabaseManager');
var qb = require('./databaseUtil/QueryBuilder');
var Query = require('./databaseUtil/SQLQuery').SQLQuery;
var generator = require('./Generator');
var lit = require('./Literals.js');


/** DBRow
 ** This object is capable of querying the database to retrieve a row, or multiple rows, from the database
 ** The retrieved row(s) cannot be directly accessed, you must use obj.getValue
 ** All querying methods must be used with promises or else the row may not be set when it is accessed.
 **
 ** table: The table name of the table the row you want to access is on
**/
exports.DBRow = function(table) {
	var querySort = "";
	var returnLimit = "";
	var currentIndex = -1;
	var rows = [];
	var currentRow = {}; // left as an empty object in case we are creating a new row
	var queries = [];
	var registeredProperties = [];

	this.setId = true; // allows setting of rows manually

	if (!table) {
		log.error("No table was specified for the DBRow, all queries will fail!! Object instantiation terminated.");
		return;
	}

	/******************* Querying Methods *******************/

	/** getRow(systemId)
	 ** systemID: the id of the row you want returned
	 ** Resolves if the query is successful, rejects with the error if the query has an error
	 **
	 ** getRow() gets the single row from the table specified by using the ID of the row
	 **
	 ** Note: if a row does not match this ID, undefined will be returned and the promise is not rejected.
	**/
	this.getRow = function(systemId) {
		log.log("GET for table '" + table + "' with id: '" + systemId + "'");
		var qs = qb.get(table, systemId);
		return new Promise(function(resolve, reject) {
			dbm.query(qs).then(function(row){
				rows = row;
				currentIndex = 0;
				currentRow = rows[currentIndex];
				resolve();
			}, function(err){
				currentRow = {};
				rows = [];
				reject(err);
			});
		});
	};

	/** query()
	 ** No input parameters
	 ** Resolves if the query is successful, rejects with the error if the query has an error
	 **
	 ** Queries the database are sets the result to the rows variable
	 ** To access the rows, you must use the next() function to iterate
	 **
	 ** Note: if a row does not match this query, undefined will be returned and the promise is not rejected.
	**/
	this.query = function() {
		var qs =  qb.query(table, queries, registeredProperties) + ' ' + querySort + ' ' + returnLimit;
		log.log("QUERY with query string: '" + qs + "'");
		return new Promise(function(resolve, reject) {
			dbm.query(qs).then(function(row) {
				rows = row;
				currentIndex = -1;
				resolve();
			}, function(err) {
				currentRow = {};
				rows = [];
				reject(err);
			});
		});
	};

	/** update()
	 ** No input parameters
	 ** Resolves if the query is successful, rejects with the error if the query has an error
	 **
	 ** Updates the current row. Cannot be used interchangeably with insert().
	 **
	 ** Any errors during update will be logged
	**/
	this.update = function() { //iterate through property - value pairs, use old id as reference
		log.log("UPDATE for table '" + table + "' with id: '" + currentRow.id + "'");
		var qs = qb.update(table, currentRow);
		return new Promise(function(resolve, reject) {
			dbm.query(qs).then(function() {
				resolve();
			}, function(err) {
				currentRow = {};
				rows = [];
				reject(err);
			});	
		});
	};

	/** insert()
	 ** No input parameters
	 ** Resolves if the query is successful, rejects with the error if the query has an error
	 **
	 ** Inserts a new row into the database. The id of the row will be randomly generated before insertion and
	 ** should not be set beforehand
	 **
	 ** Any errors during insert will be logged
	**/
	this.insert = function() {
		if (this.setId)
			currentRow.id = generator.generate();

		log.log("INSERT for table '" + table + "' with id: '" + currentRow.id + "'");
		var qs = qb.insert(table, currentRow);
		return new Promise(function(resolve, reject) {
			dbm.query(qs).then(function() {
				resolve();
			}, function(err) {
				currentRow = {};
				rows = [];
				reject(err);
			});	
		});
	};

	/** delete()
	 ** id: the system id of the row you want to delete
	 ** Resolves if the query is successful, rejects with the error if the query has an error
	 **
	 ** DELETES the current row
	 ** There is no recovering the row once the delete goes through
	 ** it is STRONGLY discouraged to use this function unless completely necessary
	 **
	 ** Deleting a row results in issues where other rows refer back to that row... and they need to be deleted too
	 ** thus, if you really want to delete a row you need to go through ALL tables and delete everything referring back to 
	 ** whatever row you delete (you can use the id of the row deleted here -- but make sure it gets done)
	**/
	this.delete = function(id) {
		log.log("DELETE for table '" + table + "' with id: '" + id + "'");
		var qs = qb.delete(table, id);
		return new Promise(function(resolve, reject) {
			dbm.query(qs).then(function() {
				resolve();
			}, function(err) {
				currentRow = {};
				rows = [];
				reject(err);
			});	
		});
	};

	/******************* Row Modification Methods *******************/

	/** addQuery(property, value)
	 ** property: the field to which the value pertains
	 ** value: the value of the field
	 ** No return values
	 **
	 ** Adds a field-value pair to filter the rows of the table by
	**/
	this.addQuery = function(property, value) { // with three arguments it will be interpreted as operator (OR, AND) property, value
		if (arguments.length === 2)
            addQueryAndRegisterProperty(table, property, lit.sql.query.EQUALS, value, lit.sql.query.AND);
		else if (arguments.length === 3)
            addQueryAndRegisterProperty(table, property, value, arguments[2], lit.sql.query.AND);
		else
			return log.error("No more than three arguments are allowed for the addQuery function");
	};

    /**
	 *
     * @param property
     * @param value
     */
    this.addOrQuery = function(property, value) {
        if (arguments.length === 2)
            addQueryAndRegisterProperty(table, property, lit.sql.query.EQUALS, value, lit.sql.query.OR);
        else if (arguments.length === 3)
            addQueryAndRegisterProperty(table, property, value, arguments[2], lit.sql.query.OR);
        else
            return log.error("No more than three arguments are allowed for the addQuery function");
    };

	/** orderBy(field, ascOrDesc)
	 ** field: the field to order the result from the database by
	 ** ascOrDesc: whether to sort in ascending or descending order, input argument must be "ASC" or "DESC"
	 ** No return values
	**/
	this.orderBy = function(field, ascOrDesc) { 
		if (!(ascOrDesc === lit.sql.query.ASC || ascOrDesc === lit.sql.query.asc || ascOrDesc === lit.sql.query.DESC ||
				ascOrDesc === lit.sql.query.desc || ascOrDesc === undefined))
			return log.error("orderBy() calls require that the ascOrDesc argument contain the string 'ASC' or 'DESC'");

		if (ascOrDesc === undefined)
			ascOrDesc = lit.sql.query.ASC;
		
		querySort = qb.escapeOrderBy(table, field, ascOrDesc);
	};

	/** getValue(property)
	 ** property: the property to get the value in the current row for
	 ** returns the value of the requested field
	**/
	this.getValue = function(property) { //get the value of a column for the row, can be undefined!
		return currentRow[property];
	};

	/** setValue(property, value)
	 ** property: the field you would like to set
	 ** value: the value for the field you'd like to set
	 ** No return values
	 **
	 ** Food for thought: if you set values to fields that don't exist in the table, you will cause errors
	 ** and your row will not get inserted
	**/
	this.setValue = function(property, value) {
		if (property === lit.fields.ID)
			log.warn("Once a row's ID has been set it SHOULD NOT be reset. Resetting ID for an update can cause query failures"); //will be removed eventually

		currentRow[property] = value;
	};

	/** count()
	 ** No input parameters
	 ** returns the number of rows returned
	**/
	this.count = function() {
		return rows.length;
	};

	/** setLimit()
	 ** limit: the number of rows you would like returned
	 ** no return values
	 **
	 ** Sets the limit on the number of rows returned from the database
	**/
	this.setLimit = function(limit) {
		returnLimit = qb.escapeLimit(limit);
	};

	/** next()
	 ** No input parameters
	 ** returns true if there is another row object in the rows array
	 ** returns false if there are no more rows
	 **
	 ** Switches the currentRow to the next row object
	 ** This method is very useful for iterating through all the rows returned from the database
	**/
	this.next = function() { // changes to the next row returned from the database 
		currentIndex++;
		if (rows[currentIndex] !== undefined){
			currentRow = rows[currentIndex];
			return true;
		}
		else 
			return false;
	};

	/** resetIndex()
	 ** No input parameters
	 ** No return values
	 **
	 ** resets the index of the row array to -1, like you just queried this set of rows!
	**/
	this.resetIndex = function() {
		currentIndex = -1;
	};

	/** getRowJSON()
	 ** No input parameters
	 ** Returns the currentRow object
	 **
	 ** This is not the best way to interact with a row, but if you need to pass an entire row to the browser ...
	 ** or something to the client. Not sure why you would do it this way but to each their own
	**/
	this.getRowJSON = function() {
		return currentRow;
	};

    /**
	 * Just in case you forgot what the table is...
	 *
	 * @return the table name string
     */
	this.getTable = function() {
		return table;
	};

	function addQueryAndRegisterProperty(table, property, operator, value, joiner) {
        queries.push(new Query(table, property, operator, value, joiner));
        registeredProperties.push(property);
	}
};