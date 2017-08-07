/*
 * PropertyManager.js
 * Written by Michael Albinson
 * 04/08/17
 *
 * Functional interface with the system properties. Only allows for the GETTING of system properties, although eventually
 * setting system properties could be permitted
 * TODO: maybe load system properties into the database to keep things in sync across instances
 */

"use strict";

var QEFError = require('./QEFError');

function PropertyManager() {
    var options = require('../config/config.json');

    /**
     * get and return a configuration property
     * @param optionName
     * @returns {*}
     */
    this.getConfigProperty = function(optionName) {
        if (options.hasOwnProperty(optionName) && options[optionName].readable === true)
            return options[optionName];
    };

    /**
     * Set and return the new value of a system property
     * @param optionName
     * @param value
     * @returns {*}
     */
    this.setConfigProperty = function(optionName, value) {
        if (options.hasOwnProperty(optionName) && optionName && value && options[optionName].writable === true)
            return options[optionName] = value;

        return false
    };
}

//Export a single PM instance so that things stay in sync TODO: if multiple instances of the forum exist on different servers pointing at the same database the properties will NOT stay in sync, keep this in mind
module.exports =  new PropertyManager();