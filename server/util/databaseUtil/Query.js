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
 *
 * @param table {string}
 * @param fld {string}
 * @param op {string}
 * @param val {string}
 * @param join {string}
 * @constructor
 */
exports.SQLQuery = function(table, fld, op, val, join) {
    const validJoiners = [lit.sql.query.AND, lit.sql.query.OR];
    const validOperators = [lit.sql.query.IN, lit.sql.query.BETWEEN, lit.sql.query.LIKE,
                            lit.sql.query.EQUALS, lit.sql.query.LESS_THAN, lit.sql.query.NOT_EQUAL,
                            lit.sql.query.GREATER_THAN, lit.sql.query.GREATER_THAN_OR_EQUAL_TO,
                            lit.sql.query.LESS_THAN_OR_EQUAL_TO];

    var field = escaper.isValidField(table, fld) ? fld : undefined;
    var operator = validOperators.includes(op) ? op : undefined;
    var value = _isValidData(fld, val) ? val : undefined;
    var joiner = validJoiners.includes(join) ? join : undefined;

    var first = true;

    /** Public methods **/
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

    function toString() {
        return "SQLQuery with body: " + field + " " + operator + " " + value + "-- and joiner: " + joiner;
    }

    this.getAsTwoStrings = function() {
        var returnString = property + operator + value;
        if (first) {
            returnString += joiner;
            first = false;
        }

        return returnString;
    };

    /** Private methods **/
    function _isValidData(field, value) {
        if (field !== undefined && value !== undefined)
            return true;

        log.error("Invalid value '" + value +"' provided for the " + fld + 'field!');
        return false;
    }
};