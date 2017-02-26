/*
 * Generator.js
 * Written by Michael Albinson 11/19/16
 *
 * Functional interface for generating random things
 * TODO: add username generation
 */

"use strict";

exports.generate = function() {
	var identifier = "";
    var allowedChars = "abcdefghijklmnopqrstuvwxyz0123456789";
    
    for(var i=0; i < 32; i++)
        identifier += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));

    return identifier;
};