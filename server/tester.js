/**
 ** This is a sandbox file I use for testing stuff, don't worry about it ;)
 ** unless of course you want to know what I'm up to
 **/

"use strict";

var dbr = require('./util/DBRow');
var lit = require('./util/Literals.js');

var r = new dbr.DBRow(lit.VOTE_TABLE);
r.delete('26352735fehr').then(function(res){
	console.log(res);
});