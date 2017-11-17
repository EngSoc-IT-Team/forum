/**
 * itemInfoGetter.js
 * Written by Michael Albinson 3/27/17
 *
 * Used to get information about items, as this is a common task among both the handler and action files
 */

"use strict";

var lit = require('./../Literals');

/**
 * Gets info for a item provided that the vote, item type and list to append the item is provided. Commonly utilized
 * with some form of recursiveGet. The list to push to must be a mutable array that is the first element of another mutable array.
 * i.e. [[this, would, be, your, list]] (this operated based on the premise of recursiveGet, for more information, see recursion.js)
 *
 * @param item: the item to get information about
 * @param vote: the vote the user has that corresponds to the item, undefined if there is no corresponding vote
 * @param type: the type of the item to get information about
 * @param list: the array of item information to push the new information JSON object to
 */
exports.generalInfo = function(item, vote, type, list) {
    var hasVoted = vote ? (vote.getValue(lit.fields.VOTE_VALUE) ? "positive" : "negative") : undefined; // true if there is a vote, false if there is no vote
    var voteValue;
    if (type == 'post' || type == 'link')
        voteValue = vote ? vote.getValue(lit.fields.VOTE_VALUE) : 0;

    var data;
    switch(type) { //TODO: still need isSubscribed and isSaved information about each row
        case('post'):
            data = exports.getQuestionInfo(item, voteValue, hasVoted);
            break;
        case('link'):
            data = exports.getLinkInfo(item, voteValue, hasVoted);
            break;
        case('class'):
            data = exports.getClassInfo(item, voteValue, hasVoted);
            break;
        case('comment'):
            data = exports.getCommentInfo(item, voteValue, hasVoted);
            break;
        case('rating'):
            data = exports.getRatingInfo(item, voteValue, hasVoted);
            break;
        default:
            break;
    }
    list[0].push(data);
};

/**
 * Gets the info for the provided question. The vote information should be provided along with the question DBRow.
 *
 * @param item: the question DBRow
 * @param voteValue: the value of the vote associated with the question
 * @param hasVoted: whether or not the user has voted, which is given as the "polarity" of the vote, either positive or negative
 * @returns {{id, title, votes, author, date, summary, type: string, tags, voted: *, voteValue: *}}
 */
exports.getQuestionInfo = function(item, voteValue, hasVoted) {
    return {
        id: item.getValue(lit.fields.ID),
        title: item.getValue(lit.fields.TITLE),
        votes: item.getValue(lit.fields.NETVOTES),
        author: item.getValue(lit.fields.AUTHOR),
        date: item.getValue(lit.fields.TIMESTAMP),
        summary: item.getValue(lit.fields.CONTENT),
        type: lit.tables.POST,
        tags: item.getValue(lit.fields.TAGS),
        voted: hasVoted,
        voteValue: voteValue
    };
};

/**
 * Gets the row info for the given link
 *
 * @param item: the link DBRow
 * @param voteValue: the value of the vote associated with the link
 * @param hasVoted: whether or not the user has voted, which is given as the "polarity" of the vote, either positive or negative
 * @returns {{id, title, votes, author, date, summary, type: string, tags, url, voted: *, voteValue: *}}
 */
exports.getLinkInfo = function(item, voteValue, hasVoted) {
    return {
        id: item.getValue(lit.fields.ID),
        title: item.getValue(lit.fields.TITLE),
        votes: item.getValue(lit.fields.NETVOTES),
        author: item.getValue(lit.fields.ADDED_BY),
        date: item.getValue('datetime'),
        summary: item.getValue(lit.fields.SUMMARY),
        type: lit.tables.LINK,
        tags: item.getValue(lit.fields.TAGS),
        url: item.getValue(lit.fields.LINK),
        voted: hasVoted,
        voteValue: voteValue
    };
};

/**
 * Gets the row info for the given class
 *
 * @param item: the class DBRow
 * @param voteValue: the value of the vote associated with the class
 * @param hasVoted: whether or not the user has voted, which is given as the "polarity" of the vote, either positive or negative
 * @returns {{id, title, courseCode, rating, author, summary, type: string, tags, voted: *}}
 */
exports.getClassInfo = function(item, voteValue, hasVoted) {
    return {
        id: item.getValue(lit.fields.ID),
        title: item.getValue(lit.fields.TITLE),
        courseCode: item.getValue(lit.fields.COURSE_CODE),
        rating: item.getValue(lit.fields.AVERAGE_RATING),
        author: item.getValue(lit.fields.ADDED_BY),
        summary: item.getValue(lit.fields.SUMMARY),
        type: lit.tables.CLASS,
        tags: item.getValue(lit.fields.TAGS),
        voted: hasVoted
    };
};

/**
 * Gets the row info for the given comment
 *
 * @param item: the comment DBRow
 * @param voteValue: the value of the vote associated with the comment
 * @param hasVoted: whether or not the user has voted, which is given as the "polarity" of the vote, either positive or negative
 * @returns {{id, author, content, netVotes, parent, parentComment, type: string, date, voted: *}}
 */
exports.getCommentInfo = function(item, voteValue, hasVoted) {
    return {
        id: item.getValue(lit.fields.ID),
        author: item.getValue(lit.fields.AUTHOR),
        content: item.getValue(lit.fields.CONTENT),
        netVotes: item.getValue(lit.fields.NETVOTES),
        parent: item.getValue(lit.fields.PARENT),
        parentComment: item.getValue(lit.fields.PARENT_COMMENT),
        type: lit.tables.COMMENT,
        date: item.getValue(lit.fields.TIMESTAMP),
        voted: hasVoted
    };
};

/**
 * Gets the row info for the given rating
 *
 * @param item: the rating DBRow
 * @param voteValue: the value of the vote associated with the rating
 * @param hasVoted: whether or not the user has voted, which is given as the "polarity" of the vote, either positive or negative
 * @returns {{parent, id, rating, author, content, date, type: string, voted: *}}
 */
exports.getRatingInfo = function(item, voteValue, hasVoted) {
    return {
        parent: item.getValue(lit.fields.PARENT),
        id: item.getValue(lit.fields.ID),
        rating: item.getValue(lit.fields.RATING),
        author: item.getValue(lit.fields.AUTHOR),
        content: item.getValue(lit.fields.CONTENT),
        date: item.getValue(lit.fields.TIMESTAMP),
        type: lit.tables.RATING,
        voted: hasVoted
    };
};