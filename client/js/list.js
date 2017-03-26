"use strict";

/*
* List.js
* Created by Michael Albinson 2/15/17
 */

var starTemplate = '<span class="star rating">\
                        <img src="../assets/{0}.svg" class="svg" />\
                    </span>';

var postTemplate = '<div class="col-sm-12" id="{10}" data-hasvoted="{11}" data-hastype="post">\
                        <div class="ratings">\
                            <span class="thumbs-up pointer" onclick="vote(this)" onkeypress="vote(this)" tabindex="0">\
                                <img src="../assets/thumbsUp.svg" class="svg" />\
                            </span>\
                            <span id="votes" class="{2}">{3}</span>\
                            <span class="thumbs-down pointer" onclick="vote(this)" onkeypress="vote(this)" tabindex="0">\
                                <img src="../assets/thumbsDown.svg" class="svg" />\
                            </span>\
                        </div>\
                        <h2 class="title"><a href="/question?id={0}">{1}</a></h2>\
                        {9}\
                        <p class="date-and-user">\
                            <span class="positive date">[post]</span>\
                            <span class="date">{4} by <a href="/profile?username={5}">{6}</a></span>\
                        </p>\
                        <p class="description">{7}</p>\
                        <div class="action-links">\
                            <a href="/question?id={8}">View</a>\
                            <a href="javascript: void 0;" onclick="subscribe(this)">Subscribe</a>\
                            <a href="javascript: void 0;" onclick="save(this)">Save</a>\
                            <a href="javascript: void 0;" onclick="report(this)">Report</a>\
                        </div>\
                        <hr>\
                     </div>';

var linkTemplate = '<div class="col-sm-12" id="{10}" data-hasvoted="{11}" data-hastype="link">\
                        <div class="ratings">\
                        <span class="thumbs-up pointer" onclick="vote(this)" onkeypress="vote(this)" tabindex="0">\
                            <img src="../assets/thumbsUp.svg" class="svg" />\
                        </span>\
                        <span id="votes" class="{2}">{3}</span>\
                        <span class="thumbs-down pointer" onclick="vote(this)" onkeypress="vote(this)" tabindex="0">\
                            <img src="../assets/thumbsDown.svg" class="svg" />\
                        </span>\
                        </div>\
                        <h2 class="title"><a href="{0}" target="_blank">{1}</a></h2>\
                        {9}\
                        <p class="date-and-user">\
                            <span class="negative date">[link]</span>\
                            <span class="date">{4} by <a href="/profile?username={5}">{6}</a></span>\
                        </p>\
                        <p class="description">{7}</p>\
                        <div class="action-links">\
                            <a href="/link?id={8}">View</a>\
                            <a href="javascript: void 0;" onclick="subscribe(this)">Subscribe</a>\
                            <a href="javascript: void 0;" onclick="save(this)">Save</a>\
                            <a href="javascript: void 0;" onclick="report(this)">Report</a>\
                        </div>\
                        <hr>\
                     </div>';

var classTemplate = '<div class="col-sm-12" id="{10}" data-hastype="class">\
                        <div class="class-rating">\
                          {3}\
                        </div>\
                        <h2 class="title"><a href="/class?id={0}">{1}: {2}</a></h2>\
                        {9}\
                        <p class="date-and-user">\
                            <span class="date" style="color: blue">[class]</span>\
                            <span class="date">Added by <a href="/profile?username={5}">{6}</a></span>\
                        </p>\
                        <p class="description">{7}</p>\
                        <div class="action-links">\
                            <a href="/class?id={8}">View</a>\
                            <a href="javascript: void 0;" onclick="subscribe(this)">Subscribe</a>\
                            <a href="javascript: void 0;" onclick="save(this)">Save</a>\
                            <a href="javascript: void 0;" onclick="report(this)">Report</a>\
                        </div>\
                        <hr>\
                      </div>';

function whenLoaded() {
    var href;
    var content = {
        requested: "list"
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
            buildList(data[0]);
            svgConverter();
        }
        else {
            // at some point show "something went wrong" modal
            $('#aProblemOccurred').modal('toggle');
        }
    }).fail(function(err) {
        // at some point show "something went wrong" modal
        console.log(err);
    });
}

function buildList(items) {
    var filledTemplate;
    var askAQuestion = "<h6 class='info-block show-links'>Didn't find what you were looking for? Ask it <a href='/new'>here!</a></h6>"

    if (items.length == 0) {
        $('#getMore').hide();
        $('#foot').append(askAQuestion);
        return;
    }
    else if (items.length < 10) {
        $('#getMore').hide();
        $('#foot').append(askAQuestion);
    }

    for (var item in items) {
        if (!items.hasOwnProperty(item))
            continue;

        var it = items[item];
        if (!it)
            continue;

        if (it.voted)
            updateItemsWithPolarity.push({id: it.id, polarity: it.voted});

        if (it.type == "post")
            filledTemplate = fillPostTemplate(it);
        else if (it.type == "link")
            filledTemplate = fillLinkTemplate(it);
        else if (it.type == "class")
            filledTemplate = fillClassTemplate(it);

        if (filledTemplate)
            $("#listHead").append(filledTemplate);
    }
}

function fillPostTemplate(post) {
    var polarity = positiveOrNegative(post.votes);
    var tags = getTags(post.tags);
    var summary = getSummary(post.summary);
    var date = getDateString(post.date);

    return fillTemplate(postTemplate, post.id, post.title, polarity, post.votes, date, post.author,
            post.author, summary, post.id, tags, post.id, post.voted);
}

function fillLinkTemplate(li) {
    return fillTemplate(linkTemplate, li.url, li.title, positiveOrNegative(li.votes), li.votes, getDateString(li.date),
        li.author, li.author, getSummary(li.summary), li.id, getTags(li.tags), li.id, li.voted);
}

function fillClassTemplate(cl) {
    return fillTemplate(classTemplate, cl.id, cl.courseCode, cl.title, getRating(cl.rating), getDateString(cl.date),
        cl.author, cl.author, getSummary(cl.summary), cl.id, getTags(cl.tags), cl.id);
}

function getSummary(summ) {
    if (summ.length > 120)
        return summ.replace(/<(?:.|\n)*?>/gm, ' ').slice(0, 120) + ' ...'; //TODO: make this more intelligent
    else
        return summ.replace(/<(?:.|\n)*?>/gm, ' ');
}

whenLoaded();
