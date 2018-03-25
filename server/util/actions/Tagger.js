/*
 * Tagger.js
 *
 * Written By Michael Albinson 3/7/17
 *
 * Functions related to getting tags from the database and ensuring that the list of tags is up-to-date
 */

"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals');
var log = require('./../log');

var tagArray = [];

/**
 * Gets the stores array of all the known tag names in the database
 */
exports.getArray = function() {
    return new Promise(function(resolve) {
        resolve(tagArray);
    });
};

/** Gets a specific tag by id
 *
 * @param id: the id of the tag to get
 */
exports.getTag = function(id) {
    var info = {};
    return new Promise(function (resolve, reject) {
        var tag = new DBRow(lit.tables.TAG);
        tag.getRow(id).then(function () {
            info = {
                name: tag.getValue(lit.fields.NAME),
                summary: tag.getValue(lit.fields.SUMMARY),
                relatedTags: tag.getValue(lit.fields.RELATED_TAGS)
            };
            resolve(info);
        }, function () {
            reject();
        });
    });
};

/** Adds a tag to the database
 *
 * @param tagName: the name of the new tag to be entered into the database
 */
exports.add = function(tagName) { //TODO: add related tags
    return new Promise(function(resolve, reject) {
        var tag = new DBRow(lit.tables.TAG);
        tag.setValue(lit.fields.NAME, tagName);
        tag.insert().then(function () {
            return exports.updateTagArray(); // TODO: May want the janitor to auto update instead of updating every time a tag is added
        }).then(function() {
            resolve();
        }).catch(function() {
           log.error('Error adding tag');
           reject();
        });
    });
};

/**
 * Updates the stored tag array
 */
exports.updateTagArray = function() {
    return new Promise(function(resolve, reject) {
        log.info("Updating tag array");
        var tags = new DBRow(lit.tables.TAG);
        tags.query().then(function() {
            while(tags.next()) {
                if (!tagArray.includes(tags.getValue(lit.fields.NAME)))
                    tagArray.push(tags.getValue(lit.fields.NAME));
            }
            resolve('Successfully updated the tag array');
        }, function() {
            reject('Failed to update the tag array')
        });
    });
};

// update the tag array as soon as the module is required
function getTagsOnStartup() {
    exports.updateTagArray().catch(function() {log.error('Failed to update the tag array on startup')})
}
setTimeout(getTagsOnStartup, 2000);