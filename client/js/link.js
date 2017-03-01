/* link.js
 ** Created by Michael Albinson 3/1/17
 */

"use strict";

var tagTemplate = '<button class="btn btn-sm question-tag" type="submit" onclick="window.location = \'/list?tag={0}\'">{1}</button>';

var linkTemplate = '<div class="info-block row">\
                            <div class="col-sm-12">\
                                <h2 class="title" id="title"><a href="{0}">{1}</a></h2>\
                                <h6 class="date">Links to: <a href="{2}">{3}</a></h6>\
                                <span class="thumbs-up">\
                                    <img src="../assets/thumbsUp.svg" class="svg" />\
                                </span>\
                                <span id="votes" class="{4}">{5}</span>\
                                <span class="thumbs-down">\
                                    <img src="../assets/thumbsDown.svg" class="svg" />\
                                </span>\
                                <span class="date">Posted on {6} by <a href="/profile?username={7}">{8}</a></span>\
                                <p class="description">{9}</p>\
                                <div class="clearfix">\
                                    <button type="button" class="btn btn-sm button" data-toggle="modal" data-target="#myModal">Comment</button>\
                                    {10}\
                                </div>\
                            </div>\
                        </div>';

var level1CommentTemplate = '<div class="col-sm-12">\
                                <span class="thumbs-up">\
                                    <img src="../assets/thumbsUp.svg" class="svg" />\
                                </span>\
                                <span class="{0}">{1}</span>\
                                <span class="thumbs-down">\
                                    <img src="../assets/thumbsDown.svg" class="svg" />\
                                </span>\
                                <span class="date">{2} by <a href="/profile?username={3}">{4}</a></span>\
                                <p class="description">{5}</p>\
                                <a class="btn btn-sm button" href="/question/id=tobecreated">Reply</a>\
                                <a class="btn btn-sm button" href="/question/id=tobecreated">Save</a>\
                                <a class="btn btn-sm button" href="/question/id=tobecreated">Subscribe</a>\
                                <a class="btn btn-sm button" href="/question/id=tobecreated">Report</a>\
                                <hr/>\
                             </div>';

var level2CommentTemplate = '<div class="info-block comment-block media">\
                                <span class="thumbs-up">\
                                    <img src="../assets/thumbsUp.svg" class="svg" />\
                                </span>\
                                <span class="{0}">{1}</span>\
                                <span class="thumbs-down">\
                                    <img src="../assets/thumbsDown.svg" class="svg" />\
                                </span>\
                                <span class="date">{2} by <a href="/profile?username={3}">{4}</a></span>\
                                <p class="description">{5}</p>\
                                <a class="btn btn-sm button" href="/question/id=tobecreated">Save</a>\
                                <a class="btn btn-sm button" href="/question/id=tobecreated">Subscribe</a>\
                                <a class="btn btn-sm button" href="/question/id=tobecreated">Report</a>\
                                <hr />\
                            </div>';

function whenLoaded() {
    var href;
    var content = {
        requested: "link"
    };

    if (window.location.href.includes("?"))
        href = '/info' + window.location.href.slice(window.location.href.indexOf('?'));
    else
        href = '/info';

    $.ajax({
        url: href,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content)
    }).done(function(data) {
        if (data) {
            fillInLinkHeader(data.link);
            addComments(data.comments);
            svgConverter();
        }
        else {
            // at some point show "something went wrong" modal
            console.error("Server Responded in an Unexpected Fashion");
        }
    }).fail(function(err) {
        // at some point show "something went wrong" modal
        console.log(err);
    });
}

function fillInLinkHeader(details) {
    var temp = fillTemplate(linkTemplate, details.url, details.title, details.url, details.url,
        positiveOrNegative(details.votes), details.votes, getDateString(details.date), details.author, details.author,
        details.summary, getTags(details.tags));
    $('#linkHead').append(temp);
}

function addComments(comments) {
    var template;
    for (var comment in comments) {
        if (!comments.hasOwnProperty(comment))
            continue;

        template = fillCommentLevel1Template(comments[comment]);

        if (comments[comment].children) {
            for (var child in comments[comment].children) {
                if (!comments[comment].children.hasOwnProperty(child))
                    continue;

                template += fillCommentLevel2Template(comments[comment].children[child]);
            }
        }

        $('#comments').append(template);
    }
}

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

function positiveOrNegative(num) {
    if (num >= 0)
        return "positive";
    else
        return "negative";
}

function getDateString(date) {
    if (!date)
        return undefined;

    return date.slice(0, date.indexOf('T'));
}

function fillCommentLevel1Template(comment) {
    return fillTemplate(level1CommentTemplate, positiveOrNegative(comment.votes), comment.votes,
        getDateString(comment.date), comment.author, comment.author, comment.summary);
}

function fillCommentLevel2Template(comment) {
    return fillTemplate(level2CommentTemplate, positiveOrNegative(comment.votes), comment.votes,
        getDateString(comment.date), comment.author, comment.author, comment.summary);
}

whenLoaded();