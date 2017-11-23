"use strict";

var log = require('./util/log');

process.on('unhandledRejection', function(err) {
    log.error('There was an unhandled promise rejection!');
    log.error('This means that programmatically, something involving a promise rejection is not working!');
    log.error(err);
});