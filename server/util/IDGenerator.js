"use strict"

exports.generate = function() {
	var identifier = "";
    var allowedChars = "abcdefghijklmnopqrstuvwxyz0123456789";
    
    for(var i=0; i < 32; i++)
        identifier += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));

    return identifier;
};