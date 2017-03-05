"use strict";

/*
* List.js
* Created by Michael Albinson 2/15/17
 */

var starTemplate = '<span class="star rating">\
                        <img src="../assets/{0}.svg" class="svg" />\
                    </span>';

var postTemplate = '<div class="col-sm-12" style="padding-bottom: 10px;">\
                        <h2 class="title"><a href="/question?id={0}">{1}</a></h2>\
                        <span class="thumbs-up pointer">\
                            <img src="../assets/thumbsUp.svg" class="svg" />\
                        </span>\
                        <span class="{2}">{3}</span>\
                        <span class="thumbs-down pointer">\
                            <img src="../assets/thumbsDown.svg" class="svg" />\
                        </span>\
                        <span class="date">{4} by <a href="/profile?username={5}">{6}</a></span>\
                        <p class="description">{7}</p>\
                        <a class="btn btn-sm button" href="/question?id={8}">Read More</a>\
                        {9}\
                        <hr>\
                     </div>';

var linkTemplate = '<div class="col-sm-12" style="padding-bottom: 10px;">\
                        <h2 class="title"><a href="{0}" target="_blank">{1}</a></h2>\
                        <span class="thumbs-up pointer">\
                            <img src="../assets/thumbsUp.svg" class="svg" />\
                        </span>\
                        <span class="{2}">{3}</span>\
                        <span class="thumbs-down pointer">\
                            <img src="../assets/thumbsDown.svg" class="svg" />\
                        </span>\
                        <span class="date">Added on {4} by <a href="/profile?username={5}">{6}</a></span>\
                        <p class="description">{7}</p>\
                        <a class="btn btn-sm button" href="/link?id={8}">Read More</a>\
                        {9}\
                        <hr>\
                     </div>';

var classTemplate = '<div class="col-sm-12" style="padding-bottom: 10px;">\
                        <h2 class="title"><a href="/class?id={0}">{1}: {2}</a></h2>\
                        {3}\
                        <span class="date">{4} by <a href="/profile?username={5}">{6}</a></span>\
                        <p class="description">{7}</p>\
                        <a class="btn btn-sm button" href="/class?id={8}">Read More</a>\
                        {9}\
                        <hr>\
                      </div>';

var tagTemplate = '<button class="btn btn-sm question-tag" type="submit" onclick="window.location = \'/list?tag={0}\'">{1}</button>';

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

    for (var item in items) {
        if (!items.hasOwnProperty(item))
            continue;

        var it = items[item];
        if (!it)
            continue;


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
            post.author, summary, post.id, tags);
}

function fillLinkTemplate(li) {
    return fillTemplate(linkTemplate, li.url, li.title, positiveOrNegative(li.votes), li.votes, getDateString(li.date),
        li.author, li.author, getSummary(li.summary), li.id, getTags(li.tags));
}

function fillClassTemplate(cl) {
    return fillTemplate(classTemplate, cl.id, cl.courseCode, cl.title, getRating(cl.rating), getDateString(cl.date),
        cl.author, cl.author, getSummary(cl.summary), cl.id, getTags(cl.tags));
}

function getTags(tagArray) {
    var tags = '';
    tagArray = tagArray.split(', ');
    for (var tag in tagArray)
        tags += fillTemplate(tagTemplate, tagArray[tag], tagArray[tag]) + '\n';

    return tags;
}

function getSummary(summ) {
    if (summ.length > 120)
        return summ.slice(0, 120) + ' ...'; //TODO: make this more intelligent
    else
        return summ;
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

function getRating(rating) {
    return fillTemplate(starTemplate, 'yellow-star').repeat(rating) + fillTemplate(starTemplate, 'star').repeat(5-rating);
}

whenLoaded();