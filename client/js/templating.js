/*
* Templating.js
* Written by Michael Albinson 3/14/17
*
* A file that contains functions universally required for creating templates and templates used by more than one page
 */

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
                                <a class="btn btn-sm button" href="/question/id=tobecreated">Reply</a>\
                                <a class="btn btn-sm button" href="/question/id=tobecreated">Save</a>\
                                <a class="btn btn-sm button" href="/question/id=tobecreated">Subscribe</a>\
                                <a class="btn btn-sm button" href="/question/id=tobecreated">Report</a>\
                                <hr/>\
                             </div>';

var level2CommentTemplate = '<div class="info-block comment-block media" id="{6}" data-hasvoted="{7}" data-hastype="comment">\
                                <div style="display:inline-block">\
                                    <span class="thumbs-up" onclick="vote(this)">\
                                        <img src="../assets/thumbsUp.svg" class="svg" />\
                                    </span>\
                                    <span id="votes" class="{0}">{1}</span>\
                                    <span class="thumbs-down" onclick="vote(this)">\
                                        <img src="../assets/thumbsDown.svg" class="svg" />\
                                    </span>\
                                </div>\
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

    return fillTemplate(level1CommentTemplate, positiveOrNegative(comment.votes), comment.votes,
        getDateString(comment.date), comment.author, comment.author, comment.summary, comment.id, comment.voted);
}

function fillCommentLevel2Template(comment) {
    if(comment.voted)
        updateItemsWithPolarity.push({id: comment.id, polarity: comment.voted});

    return fillTemplate(level2CommentTemplate, positiveOrNegative(comment.votes), comment.votes,
        getDateString(comment.date), comment.author, comment.author, comment.summary, comment.id, comment.voted);
}