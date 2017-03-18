/* question.js
** Created by Michael Albinson 2/15/17
*/

"use strict";

var questionTemplate = '<div class="info-block row">\
                            <div class="col-sm-12">\
                                <h2 class="title" id="title"><a href="/question?id={0}">{1}</a></h2>\
                                <span class="thumbs-up">\
                                    <img src="../assets/thumbsUp.svg" class="svg" />\
                                </span>\
                                <span id="votes" class="{2}">{3}</span>\
                                <span class="thumbs-down">\
                                    <img src="../assets/thumbsDown.svg" class="svg" />\
                                </span>\
                                <span class="date">Posted on {4} by <a href="/profile?username={5}">{6}</a></span>\
                                <p class="description">{7}</p>\
                                <div class="clearfix">\
                                    <button type="button" class="btn btn-sm button" data-toggle="collapse" data-target="#demo">Comment</button>\
                                    {8}\
                                </div>\
                            </div>\
                        </div>';

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
                                getTags(details.tags));
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

function fillCommentLevel1Template(comment) {
    return fillTemplate(level1CommentTemplate, positiveOrNegative(comment.votes), comment.votes,
        getDateString(comment.date), comment.author, comment.author, comment.summary);
}

function fillCommentLevel2Template(comment) {
    return fillTemplate(level2CommentTemplate, positiveOrNegative(comment.votes), comment.votes,
        getDateString(comment.date), comment.author, comment.author, comment.summary);
}

whenLoaded();