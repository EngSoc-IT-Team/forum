/**
 * Query.js
 * An object representation of a given query.
 *
 * Written by Michael Albinson
 */

"use strict";

var lit = require('../literals');
var log = require('../log');
var escaper = require('./QueryEscaper');

/**
 * A basic object representation of a SQL query. Contains basic verification of the data passed into it. Extensive data
 * verification is done in the QueryBuilder class
 *
 * @param table {string}: The table the query should be placed on
 * @param fld {string}: The field the query should be put to
 * @param op {string}: The operator for the value
 * @param val {string}: The value to query for on the provided field
 * @param join {string}: The joiner to be used to combine multiple queries if they are provided
 * @constructor
 */
exports.SQLQuery = function(table, fld, op, val, join) {
    const validJoiners = [lit.sql.query.AND, lit.sql.query.OR];
    const validOperators = [lit.sql.query.IN, lit.sql.query.BETWEEN, lit.sql.query.LIKE,
                            lit.sql.query.EQUALS, lit.sql.query.LESS_THAN, lit.sql.query.NOT_EQUAL,
                            lit.sql.query.GREATER_THAN, lit.sql.query.GREATER_THAN_OR_EQUAL_TO,
                            lit.sql.query.LESS_THAN_OR_EQUAL_TO];

    var field = escaper.isValidField(table, fld) ? fld : undefined;
    var operator = _checkOperator(op);
    var value = _isValidData(fld, val) ? val : undefined;
    var joiner = validJoiners.includes(join) ? join : undefined;

    var first = true;

    /*** Public methods ***/

    /**
     * Getter methods
     **/
    this.getJoiner = function() {
        return joiner;
    };

    this.getOperator = function() {
        return operator;
    };

    this.getValue = function() {
        return value;
    };

    this.getField = function (){
        return field;
    };

    this.getQueryDataArray = function() {
        return [field, operator, value, joiner];
    };

    /** Override toString method **/
    this.toString = function() {
        return "SQLQuery with body: " + field + " " + operator + " " + value + "-- and joiner: " + joiner;
    };

    /*** Private methods ***/
    /**
     * Determines that valid data has been passed in for both the field and value for every query (SQL doesn't like
     * undefined D: )
     *
     * @param field {string}
     * @param value {string}
     * @return {boolean}
     * @private
     */
    function _isValidData(field, value) {
        if (field !== undefined && value !== undefined)
            return true;

        log.error("Invalid value '" + value +"' provided for the " + fld + 'field!');
        return false;
    }

    /** Checks to ensure that the operator being used is a valid one. Replaces invalid operators with the equals operator.
     *
     * @param op {string}: The operator trying to be used
     * @returns {string}: The operator if it is valid, returns = if it is invalid
     * @private
     */
    function _checkOperator(op) {
        if (validOperators.includes(op))
            return op;
        else {
            log.warn('An unacceptable operator was passed into the query, replacing with the equals operator');
            return '=';
        }
    }
};