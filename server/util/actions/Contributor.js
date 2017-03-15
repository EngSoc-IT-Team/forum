/*
* Contributor.js
*
* Written by Michael Albinson 3/14/17
*/

"use strict";

var DBRow = require('../DBRow').DBRow;
var lit = require('../Literals');
var log = require('../log');

exports.generateContribution = function(item, userID, type) {
    var contr = new DBRow(lit.CONTRIBUTION_TABLE);
    contr.setValue(lit.FIELD_TYPE, type);
    contr.setValue(lit.FIELD_USER_ID, userID);
    contr.setValue(lit.FIELD_ITEM_ID, item.getValue(lit.FIELD_ID));
    if (item.getValue(lit.FIELD_TAGS))
        contr.setValue(lit.FIELD_TAGS, item.getValue(lit.FIELD_TAGS));

    contr.insert().then(function() {}, function(err) {
        log.error(err);
    })
};