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
        var tag = new DBRow(lit.TAG_TABLE);
        tag.getRow(id).then(function () {
            info = {
                name: tag.getValue(lit.FIELD_NAME),
                summary: tag.getValue(lit.FIELD_SUMMARY),
                relatedTags: tag.getValue(lit.FIELD_RELATED_TAGS)
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
        var tag = new DBRow(lit.TAG_TABLE);
        tag.setValue(lit.FIELD_NAME, tagName);
        tag.insert().then(function () {
            resolve();
            exports.updateTagArray(); // TODO: May want the janitor to auto update instead of updating every time a tag is added
        }, function(){reject()});
    });
};

/**
 * Updates the stored tag array
 */
exports.updateTagArray = function() {
    return new Promise(function(resolve, reject) {
        log.info("Updating tag array");
        var tags = new DBRow(lit.TAG_TABLE);
        tags.query().then(function() {
            while(tags.next()) {
                if (!tagArray.includes(tags.getValue(lit.FIELD_NAME)))
                    tagArray.push(tags.getValue(lit.FIELD_NAME));
            }
            resolve();
        }, function() {reject()});
    });
};

// update the tag array as soon as the module is required
exports.updateTagArray();