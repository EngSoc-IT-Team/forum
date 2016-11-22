"use strict"

/**
 ** This is a snadboxing file I use for testing stuff, don't worry about it ;)
 ** unless of course you want to know what I'm up to
**/
var dbr = require('./util/DBRow');

var r = new dbr.DBRow('vote');
r.delete('26352735fehr').then(function(res){
	console.log(res);
})