"use strict";

var log = require('./log');
var db = require('./DatabaseManager');
var qb = require('./QueryBuilder');
var compare = require('./Compare');

var dbm = new db.DatabaseManager();


/** DBRow
 ** This object is capable of querying the database to retrieve a row, or multiple rows, from the database
 ** The retrieved row(s) cannot be directly accessed, you must use obj.getValue
 ** If using the query() or getRow() methods you MUST use promises to make sure you have the row(s) before continuing
 ** If using the update() or insert() functionalities, promises do not need to be used
 ** table: The table name of the table the row you want to access is on
**/
exports.DBRow = function(table) {
	var querySort = "";
	var returnLimit = "";
	var currentIndex = -1;
	var rows = [];
	var currentRow = {}; // left as an empty object in case we are creating a new row

	if (!table){
		log.error("No table was specified for the DB row, all queries will fail!! Object instantiation terminated.");
		return;
	}

	/******************* Querying Methods *******************/

	/** getRow(systemId)
	 ** systemID: the id of the row you want returned
	 ** Returns true if the query is sucessful, returns false if the query is unsucessful
	 **
	 ** getRow() gets the single row from the table specified by using the ID of the row
	 ** Promises are necesary to make sure the row object is set before you try to get or set values to it
	 ** Note: if a row does not match this ID, underfined will be returned
	**/
	this.getRow = function(systemId) {
		var qs = qb.get(table, systemId);
		return new Promise(function(resolve, reject) {
			dbm.query(qs).then(function(row){
				rows = row;
				currentIndex = 0;
				currentRow = rows[currentIndex];
				resolve(true);
			}, function(err){
				currentRow = {};
				rows = [];
				reject(false);
			});
		});
	}

	/** query()
	 ** No input parameters
	 ** Returns true if the query is sucessful, returns false if the query is unsucessful
	 **
	 ** Queries the databse are sets the result to the rows variable
	 ** To access the rows, you must use the next() function to iterate
	**/
	this.query = function() { //queries the database, will set this.row to the retrieved row, YOU MUST USE PROMISES for this
		var qs =  qb.query(table, currentRow) + returnLimit + querySort;
		return new Promise(function(resolve, reject) {
			dbm.query(qs).then(function(row) {
				rows = row;
				currentIndex = -1;
				resolve(true);
			}, function(err) {
				currentRow = {};
				rows = [];
				reject(false);
			});
		});
	}

	/** directQuery()
	 ** queryString: the query string to pass to the database
	 ** Returns true if the query is sucessful, returns false if the query is unsucessful
	 **
	 ** Queries the databse are sets the result to the rows variable
	 ** To access the rows, you must use the next() function to iterate
	 ** Returns nothing if the query is sucessful, returns undefined if the query is unsucessful
	 **
	 ** THIS WILL BE DEPRECIATED AFTER SOME TIME: focus on using query() and building queryStrings 
	 ** This is super dangerous to ever expose to user input SO LET'S NEVER DO IT. Right gang? :D
	**/
	this._directQuery = function(_queryString) {
		return new Promise(function(resolve, reject) {
			dbm.query(_queryString).then(function(row) {
				rows = row;
				resolve(true);
			}, function(err) {
				currentRow = {};
				rows = [];
				reject(false);
			});	
		});
	}

	/** update()
	 ** No input parameters
	 ** No return values
	 **
	 ** Any errors during update will be logged
	**/
	this.update = function() { //iterate through property - value pairs, use old id as reference
		var qs = qb.update(table, currentRow);
		return new Promise(function(resolve, reject) {
			dbm.query(qs).then(function(row) {
				resolve(true);
			}, function(err) {
				currentRow = {};
				rows = [];
				reject(false);
			});	
		});
	}

	/** insert()
	 ** No input parameters
	 ** No return values
	 **
	 ** Any errors during insert will be logged
	**/
	this.insert = function() { // iterate through property - value pairs
		var qs = qb.insert(table, currentRow);
		return new Promise(function(resolve, reject) {
			dbm.query(qs).then(function(row) {
				resolve(true);
			}, function(err) {
				currentRow = {};
				rows = [];
				reject(false);
			});	
		});
	}

	/** delete()
	 ** id: the system id of the row you want to delete
	 ** Returns true if the query is sucessful, returns false if the query is unsucessful
	 **
	 ** DELETES the current row
	 ** There is no recovering the row once the delete goes through
	 ** it is STRONGLY discuraged to use this function 
	 ** deleting a row results in issues where other rows refer back to that row... and they need to be deleted too
	 ** thus, if you really want to delete a row you need to go through ALL tables and delete referring back to 
	 ** whatever row you delete (you can use the id of the row deleted here -- but make sure it gets done)
	**/
	this.delete = function(id) {
		var qs = qb.delete(table, id);
		return new Promise(function(resolve, reject) {
			dbm.query(qs).then(function(row) {
				resolve(true);
			}, function(err) {
				currentRow = {};
				rows = [];
				reject(false);
			});	
		});
	}

	/******************* Row Modification Methods *******************/

	/** addQuery(property, value)
	 ** property: the field to which the value pertains
	 ** value: the value of the field
	 ** No return values
	 **
	 ** Adds a field-value pair to filter the rows of the table by
	 ** TODO: Implement three argument addQuery that is more specific (i.e. not queries, >=, <= queries)
	**/
	this.addQuery = function(property, value) { // with three arguments it will be interpreted as operator (OR, AND) property, value
		currentRow[property] = value; 
	}

	/** orderBy(field, ascOrDesc)
	 ** field: the field to order the result from the database by
	 ** ascOrDesc: whether to sort in ascending or descending order, input argument must be "ASC" or "DESC"
	 ** No return values
	**/
	this.orderBy = function(field, ascOrDesc) { 
		if (!(ascOrDesc == "ASC" || ascOrDesc == "asc" || ascOrDesc == "DESC" || ascOrDesc == "desc"))
			return log.error("orderBy() calls require that the ascOrDesc argument contain the string 'ASC' or 'DESC'");

		querySort = qb.escapeOrderBy(field, ascOrDesc);
	}

	/** getValue(property)
	 ** property: the property to get the value in the current row for
	 ** returns the value of the requested field
	**/
	this.getValue = function(property) { //get the value of a column for the row, can be undefined!
		return currentRow[property];
	}

	/** setValue(property, value)
	 ** property: the field you would like to set
	 ** value: the value for the field you'd like to set
	 ** No return values
	 **
	 ** Food for thought: if you set values to fields that don't exist in the table, you will cause errors
	 ** and your row will not get inserted
	**/
	this.setValue = function(property, value, setRows) {
		if (property == "id")
			log.warn("Once a row's ID has been set it SHOULD NOT be reset. Resetting ID for an update can cause query failures"); //will be removed eventually

		currentRow[property] = value;
		if (!setRows)
			setRows = property + "=" + value;
		else
			setRows += "," + property + "='" + value + "'";
	}

	/** count()
	 ** No input parameters
	 ** returns the number of rows returned
	**/
	this.count = function() {
		return rows.length;
	}

	/** count()
	 ** limit: the number of rows you would like returned
	 ** no return values
	 **
	 ** Sets the limit on the number of rows returned from the database
	**/
	this.setLimit = function(limit) {
		returnLimit = qb.escapeLimit(limit);
	}

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
		if (rows[currentIndex] != undefined){
			currentRow = rows[currentIndex];
			return true;
		}
		else 
			return false;
	}

	/** resetIndex()
	 ** No input parameters
	 ** No return values
	 **
	 ** resets the index of the row array to -1, like you just queried this set of rows!
	**/
	this.resetIndex = function() {
		currentIndex = -1;
	}

	/** getRowJSON()
	 ** No input parameters
	 ** Returns the currentRow object
	 **
	 ** This is not the best way to interact with a row, but if you need to pass an entire row to the browser ...
	 ** or somethning to the client. Not sure why you would do it this way but to each their own
	**/
	this.getRowJSON = function() {
		return currentRow;
	}
}