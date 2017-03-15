/*
* Templating.js
* Written by Michael Albinson 3/14/17
*
* A file that contains functions universally required for creating templates and templates used by more than one page
 */

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

var tagTemplate = '<button class="btn btn-sm question-tag" type="submit" onclick="window.location = \'/list?tags={0}\'">{1}</button>';

var starTemplate = '<span class="star rating">\
                      <img src="../assets/{0}.svg" class="svg" />\
                    </span>';

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