/* link.js
 ** Created by Michael Albinson 3/1/17
 */

"use strict";

// link page specific template
var linkTemplate = '<div class="info-block row" id="{11}" data-hasvoted="{12}" data-hastype="link">\
                            <div class="col-sm-12">\
                                <h2 class="title" id="title"><a href="{0}">{1}</a></h2>\
                                <h6 class="date">Links to: <a href="{2}">{3}</a></h6>\
                                <span class="thumbs-up pointer" onclick="vote(this)" onkeypress="vote(this)">\
                                    <img src="../assets/thumbsUp.svg" class="svg" />\
                                </span>\
                                <span id="votes" class="{4}">{5}</span>\
                                <span class="thumbs-down pointer" onclick="vote(this)" onkeypress="vote(this)">\
                                    <img src="../assets/thumbsDown.svg" class="svg" />\
                                </span>\
                                <span class="date">Posted on {6} by <a href="/profile?username={7}">{8}</a></span>\
                                <div class="description show-links">{9}</div>\
                                {10}\
                                <div class="action-links">\
                                    <a href="javascript: void 0;" onclick="subscribe(this)">Subscribe</a>\
                                    <a href="javascript: void 0;" onclick="save(this)">Save</a>\
                                    <a href="javascript: void 0;" onclick="report(this)">Report</a>\
                                </div>\
                                <div class="comment-button-wrap">\
                                    <button type="button" class="btn btn-sm button" data-toggle="collapse" data-target="#editor">Comment</button>\
                                </div>\
                                <div id="editor" class="collapse">\
                                    <br>\
                                    <textarea name="editor1" id="editor2" rows="10" cols="80"></textarea>\
                                    <button type="button" class="btn btn-sm button" data-toggle="collapse" data-target="#editor" onclick="reply(this)">Submit</button>\
                                </div>\
                            </div>\
                        </div>';

// keep the link's id stored in memory
var itemID;
var loaded = false;

/**
 * Run once the page is loaded. Gets the link and its comments out of the database and renders them. Additionally,
 * this function sets up the editors appended to each of the comments and the link header.
 */
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
            CKEDITOR.replace( 'editor1' );
            activateEditors();
            loaded = true;
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

/** Sets up and renders the link information as an HTML string, and then appends it to the page at the #linkHead element
 *
 * @param details: The link JSON object received from the server
 */
function fillInLinkHeader(details) {
    var temp = fillTemplate(linkTemplate, details.url, details.title, details.url, details.url,
        positiveOrNegative(details.votes), details.votes, getDateString(details.date), details.author, details.author,
        details.summary, getTags(details.tags), details.id, details.voted);

    itemID = details.id;

    if(details.voted)
        updateItemsWithPolarity.push({id: details.id, polarity: details.voted});

    $('#linkHead').append(temp);
}

/** Adds the comments and subcomments to the page at the #comments. Additionally, changes the page footer depending on
 * if there are more comments that can be retrieved from the server or not.
 *
 * @param comments: The comment array retrieved from the server. Each comment is represented as a JSON object.
 */
function addComments(comments) {
    var template;

    if (comments.length === 0) {
        $('#getMore').hide();
        $('#foot').append("<h6 class='info-block'>Nothing here yet! Add a comment to get the discussion going!</h6>");
        return;
    }
    else if (comments.length < 10) {
        $('#foot').hide();
    }

    for (var comment in comments) {
        if (!comments.hasOwnProperty(comment))
            continue;

        if (comments[comment])
            updateItemsWithPolarity.push({id: comments[comment].id, polarity: comments[comment].voted});

        template = fillCommentLevel1Template(comments[comment]);

        if (comments[comment].children) {
            for (var child in comments[comment].children) {
                if (!comments[comment].children.hasOwnProperty(child))
                    continue;

                if (comments[comment].children[child])
                    updateItemsWithPolarity.push({id: comments[comment].children[child].id,
                        polarity: comments[comment].children[child].voted});

                template += fillCommentLevel2Template(comments[comment].children[child]);
            }
        }

        $('#comments').append(template);
    }
}

// render the page
$(document).ready(whenLoaded);
