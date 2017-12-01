/*
* Contributor.js
*
* Written by Michael Albinson 3/14/17
*/

"use strict";

var DBRow = require('../DBRow').DBRow;
var lit = require('../Literals');
var log = require('../log');

/** Creates a new contribution for a given item and user. The type of the item must be specified.
 *
 * @param item: the item DBRow that is being inserted
 * @param userID: the id of the user adding the item
 * @param type: the type of the item being inserted
 */
exports.generateContribution = function(item, userID, type) {
    var contr = new DBRow(lit.tables.CONTRIBUTION);
    contr.setValue(lit.fields.TYPE, type);
    contr.setValue(lit.fields.USER_ID, userID);
    contr.setValue(lit.fields.ITEM_ID, item.getValue(lit.fields.ID));
    if (item.getValue(lit.fields.TAGS))
        contr.setValue(lit.fields.TAGS, item.getValue(lit.fields.TAGS));

    contr.insert().then(function() {}, function(err) {
        log.error(err);
    })
};