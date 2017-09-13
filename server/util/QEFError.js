/**
 * Written by Michael Albinson
 * 04/08/17
 */

"use strict";

/**
 * A class designed to create user understandable error messaging that does not expose stack traces to the client on
 * error. If the error is internal, we allow the stack to be applied to the object, if it is external, we suppress the
 * stack and just pass the error message.
 *
 * @constructor
 */

var log = require('./log.js');

module.exports = function(err) {
    this.name = "QEFError";
    this.message = "An internal server error occurred"; // Default error message
    this.stack = undefined;

    var isInternal = false;

    if (!err.message && !err.stack) { // if the error has no stack or message property, it is created by our code
        this.message = err;
        isInternal = true;
    }

    if (!isInternal) {
        if (err.message) //if we get a message, sterilize it
            this.message = _sterilize(err.message);

        if (err.stack && isInProduction) //if we get a stack, check if we're in production and safely pass the stack if we are, otherwise keep it to ourselves
            return this;
    }

    function _sterilize(msg) {
        return msg;
    }

    function _stack(isInProduction) {
        var err = new Error();
        return err.stack;
    }

    log.error("** SYSTEM SEVERE ** " + this.message);
};