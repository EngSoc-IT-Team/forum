/*
* Templating.js
* Written by Michael Albinson 3/14/17
*
* A file that contains functions universally required for creating templates and templates used by more than one page
 */

"use strict";

var level1CommentTemplate = '<div class="col-sm-12" id="{6}" data-hasvoted="{7}" data-hastype="comment">\
                                <div style="display:inline-block">\
                                    <span class="thumbs-up pointer" onclick="vote(this)">\
                                        <img src="../assets/thumbsUp.svg" class="svg" />\
                                    </span>\
                                    <span id="votes" class="{0}">{1}</span>\
                                    <span class="thumbs-down pointer" onclick="vote(this)">\
                                        <img src="../assets/thumbsDown.svg" class="svg" />\
                                    </span>\
                                </div>\
                                <span class="date">{2} by <a href="/profile?username={3}">{4}</a></span>\
                                <p class="description">{5}</p>\
                                {8}\
                                <button role="button" class="btn btn-sm button">Save</button>\
                                <button role="button" class="btn btn-sm button">Subscribe</button>\
                                <button role="button" class="btn btn-sm button">Report</button>\
                                {9}\
                                <hr/>\
                             </div>';

var level2CommentTemplate = '<div class="info-block comment-block media" id="{6}" data-hasvoted="{7}" data-hastype="comment">\
                                <div style="display:inline-block">\
                                    <span class="thumbs-up pointer" onclick="vote(this)">\
                                        <img src="../assets/thumbsUp.svg" class="svg" />\
                                    </span>\
                                    <span id="votes" class="{0}">{1}</span>\
                                    <span class="thumbs-down pointer" onclick="vote(this)">\
                                        <img src="../assets/thumbsDown.svg" class="svg" />\
                                    </span>\
                                </div>\
                                <span class="date">{2} by <a href="/profile?username={3}">{4}</a></span>\
                                <p class="description">{5}</p>\
                                <button role="button" class="btn btn-sm button">Save</button>\
                                <button role="button" class="btn btn-sm button">Subscribe</button>\
                                <button role="button" class="btn btn-sm button">Report</button>\
                                <hr />\
                            </div>';

var tagTemplate = '<button class="btn btn-sm question-tag" type="submit" onclick="window.location = \'/list?tags={0}\'">{1}</button>';

var starTemplate = '<span class="star rating">\
                      <img src="../assets/{0}.svg" class="svg" />\
                    </span>';

var replyTemplate = '<button role="button" class="btn btn-sm button" data-toggle="collapse" data-target="#{0}">Reply</button>';

var editorTemplate = '<div id="{0}" class="collapse">\
                        <br>\
                        <textarea name="{1}" id="{2}" rows="10" cols="80"></textarea><br>\
                        <button type="button" class="btn btn-sm button" data-toggle="collapse" data-target="#{3}" onclick="reply(this)">Submit</button>\
                     </div>';

var updateItemsWithPolarity = []; // go and update votes on elements that need updates

function getTags(tagArray) {
    var tags = '';
    tagArray = tagArray.split(', ');
    for (var tag in tagArray) {
        if(!tagArray.hasOwnProperty(tag))
            continue;

        tags += fillTemplate(tagTemplate, tagArray[tag], tagArray[tag]) + '\n';
    }

    return tags;
}

function getDateString(date) {
    if (!date)
        return undefined;
    else if (date == "Just Now")
        return date;

    return date.slice(0, date.indexOf('T'));
}

function positiveOrNegative(num) {
    if (num >= 0)
        return "positive";
    else
        return "negative";
}

function getRating(rating) {
    return fillTemplate(starTemplate, 'yellow-star').repeat(rating) + fillTemplate(starTemplate, 'star').repeat(5-rating);
}

function fillCommentLevel1Template(comment) {
    if(comment.voted)
        updateItemsWithPolarity.push({id: comment.id, polarity: comment.voted});

    var replyThings = getReplyItems();
    if (!loaded)
        return fillTemplate(level1CommentTemplate, positiveOrNegative(comment.votes), comment.votes,
        getDateString(comment.date), comment.author, comment.author, comment.summary, comment.id, comment.voted,
        replyThings[0], replyThings[1]);
    else
        return [fillTemplate(level1CommentTemplate, positiveOrNegative(comment.votes), comment.votes,
            getDateString(comment.date), comment.author, comment.author, comment.summary, comment.id, comment.voted,
            replyThings[0], replyThings[1]), replyThings[2]];
}

function fillCommentLevel2Template(comment) {
    if(comment.voted)
        updateItemsWithPolarity.push({id: comment.id, polarity: comment.voted});

    return fillTemplate(level2CommentTemplate, positiveOrNegative(comment.votes), comment.votes,
        getDateString(comment.date), comment.author, comment.author, comment.summary, comment.id, comment.voted);
}

var numEditors = 0;
var editorNames = [];
function getReplyItems() {
    var items = [];
    var editorName = 'e' + numEditors;
    var editorId = 'edID' + numEditors;
    items.push(fillTemplate(replyTemplate, editorId));
    items.push(fillTemplate(editorTemplate, editorId, editorName, editorName, editorId));
    editorNames.push(editorName);
    if (loaded)
        items.push(editorName);

    numEditors++;
    return items;
}

function activateEditors(id) {
    if (!id) {
        for (var i = 0; i < numEditors; i++)
            CKEDITOR.replace('e' + i);
    }
    else
        CKEDITOR.replace(id);
}