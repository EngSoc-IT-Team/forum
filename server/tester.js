"use strict"

/**
 ** This is a snadboxing file I use for testing stuff, don't worry about it ;)
 ** unless of course you want to know what I'm up to
**/
var dbr = require('./util/DBRow');
var lit = require('./util/StringLiterals.js');

var r = new dbr.DBRow(lit.VOTE_TABLE);
r.delete('26352735fehr').then(function(res){
	console.log(res);
});