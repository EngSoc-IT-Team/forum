/* question.js
** Created by Michael Albinson 2/15/17
*/

"use strict";

var questionTemplate = '<div class="info-block row" id="{9}" data-hasvoted="{10}" data-hastype="post">\
                            <div class="col-sm-12">\
                                <h2 class="title" id="title"><a href="/question?id={0}">{1}</a></h2>\
                                <span class="thumbs-up pointer" onclick="vote(this)">\
                                    <img src="../assets/thumbsUp.svg" class="svg" />\
                                </span>\
                                <span id="votes" class="{2}">{3}</span>\
                                <span class="thumbs-down pointer" onclick="vote(this)">\
                                    <img src="../assets/thumbsDown.svg" class="svg" />\
                                </span>\
                                <span class="date">Posted on {4} by <a href="/profile?username={5}">{6}</a></span>\
                                <p class="description">{7}</p>\
                                <div class="clearfix">\
                                    <button type="button" class="btn btn-sm button" data-toggle="collapse" data-target="#editor">Comment</button>\
                                    {8}\
                                </div>\
                                <br>\
                                <div id="editor" class="collapse">\
                                    <textarea name="editor1" id="editor2" rows="10" cols="80"></textarea>\
                                    <button id="test" type="button" class="btn btn-sm button" data-target="#editor" data-toggle="collapse" onclick="reply(this)">Submit</button>\
                                </div>\
                            </div>\
                        </div>';

var itemID;
var loaded = false;

function whenLoaded() {
    var href;
    var content = {
        requested: "question"
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
            fillInQuestionHeader(data.question);
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

function fillInQuestionHeader(details) {
    var temp = fillTemplate(questionTemplate, details.id, details.title, positiveOrNegative(details.votes), details.votes,
                                getDateString(details.date), details.author, details.author, details.summary,
                                getTags(details.tags), details.id, details.voted);

    itemID = details.id;

    if (details.voted)
        updateItemsWithPolarity.push({id: details.id, polarity: details.voted});

    $('#questionHead').append(temp);
}

function addComments(comments) {
    var template;

    if (comments.length == 0) {
        $('#getMore').hide();
        $('#foot').append("<h6 class='info-block'>Nothing here yet!</h6>");
        return;
    }

    for (var comment in comments) {
        if (!comments.hasOwnProperty(comment))
            continue;

        if (comments[comment].voted)
            updateItemsWithPolarity.push({id: comments[comment].id, polarity: comments[comment].voted});

        template = fillCommentLevel1Template(comments[comment]);

        if (comments[comment].children) {
            for (var child in comments[comment].children) {
                if (!comments[comment].children.hasOwnProperty(child))
                    continue;

                if (comments[comment].children[child].voted)
                    updateItemsWithPolarity.push({id: comments[comment].children[child].id,
                        polarity: comments[comment].children[child].voted});

                template += fillCommentLevel2Template(comments[comment].children[child]);
            }
        }

        $('#comments').append(template);
    }
}

// start the page
whenLoaded();