"use strict";

var log = require('../log');

/**
 * Handles unhandled promise rejections, as if they remain unhandled they will crash the server
 */
process.on('unhandledRejection', function(e) {
    log.severe(e);
});