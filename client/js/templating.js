/*
* Templating.js
* Written by Michael Albinson 3/14/17
*
* A file that contains functions universally required for creating templates and templates used by more than one page
 */

"use strict";


/**
 * Comment templates
 */
var level1CommentTemplate = '<div class="col-sm-12" id="{6}" data-hasvoted="{7}" data-hastype="comment">\
                                <div style="display:inline-block">\
                                    <span class="thumbs-up pointer" onclick="vote(this)" tabindex="0">\
                                        <img src="../assets/thumbsUp.svg" class="svg" />\
                                    </span>\
                                    <span id="votes" class="{0}">{1}</span>\
                                    <span class="thumbs-down pointer" onclick="vote(this)" tabindex="0">\
                                        <img src="../assets/thumbsDown.svg" class="svg" />\
                                    </span>\
                                </div>\
                                <span class="date">{2} by <a href="/profile?username={3}">{4}</a></span>\
                                <p class="description">{5}</p>\
                                <div class="action-links">\
                                {8}\
                                <a href="javascript: void 0;" onclick="subscribe(this)">Subscribe</a>\
                                <a href="javascript: void 0;" onclick="save(this)">Save</a>\
                                <a href="javascript: void 0;" onclick="report(this)">Report</a>\
                                </div>\
                                {9}\
                                <hr/>\
                             </div>';

var level2CommentTemplate = '<div class="info-block comment-block media" id="{6}" data-hasvoted="{7}" data-hastype="comment">\
                                <div style="display:inline-block">\
                                    <span class="thumbs-up pointer" onclick="vote(this)" tabindex="0">\
                                        <img src="../assets/thumbsUp.svg" class="svg" />\
                                    </span>\
                                    <span id="votes" class="{0}">{1}</span>\
                                    <span class="thumbs-down pointer" onclick="vote(this)" tabindex="0">\
                                        <img src="../assets/thumbsDown.svg" class="svg" />\
                                    </span>\
                                </div>\
                                <span class="date">{2} by <a href="/profile?username={3}">{4}</a></span>\
                                <p class="description">{5}</p>\
                                <div class="action-links">\
                                <a href="javascript: void 0;" onclick="subscribe(this)">Subscribe</a>\
                                <a href="javascript: void 0;" onclick="save(this)">Save</a>\
                                <a href="javascript: void 0;" onclick="report(this)">Report</a>\
                                </div>\
                                <hr />\
                            </div>';

/**
 * Item templates
 *
 * Used on the profile and list pages
 */
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
                        {9}\
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
                        {9}\
                        <hr>\
                     </div>';

var classTemplate = '<div class="col-sm-12" id="{10}" data-hastype="class">\
                        <div class="class-rating">\
                          {3}\
                        </div>\
                        <h2 class="title"><a href="/class?id={0}">{1}: {2}</a></h2>\
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
                        {9}\
                        <hr>\
                      </div>';



var level1ReviewTemplate = '<div class="col-sm-12" id="{0}" data-hasvoted="{8}" data-hastype="rating">\
                                {1}\
                                <span class="date">{2} by <a href="profile/username={3}">{4}</a></span>\
                                <div class="description show-links">{5}</div>\
                                <div class="action-links">\
                                {9}\
                                    <a onclick="vote(this)" tabindex="0">Helpful</a>\
                                    <span class="thumbs-up pointer" onclick="vote(this)" tabindex="0">\
                                        <img src="../assets/thumbsUp.svg" class="svg" />\
                                    </span>\
                                    <a onclick="vote(this)" tabindex="0">Not Helpful</a>\
                                    <a href="javascript: void 0;" onclick="save(this)">Save</a>\
                                    <a href="javascript: void 0;" onclick="report(this)">Report</a>\
                                </div>\
                                {10}\
                                <h6><small>_  people of __ found this review helpful</small></h6>\
                                <span id="votes" class="{6}">{7}</span>\
                                <hr />\
                            </div>';



/**
 * Miscellaneous
 *
 */
var tagTemplate = '<button class="btn btn-sm question-tag" type="submit" onclick="window.location = \'/list?tags={0}\'">{1}</button>';

var starTemplate = '<span class="star rating">\
                      <img src="../assets/{0}.svg" class="svg" />\
                    </span>';

var replyTemplate = '<a role="button" data-toggle="collapse" data-target="#{0}" href="javascript: void 0;">Reply</a>';

var editorTemplate = '<div id="{0}" class="collapse">\
                        <br>\
                        <textarea name="{1}" id="{2}" rows="10" cols="80"></textarea><br>\
                        <button type="button" class="btn btn-sm button" data-toggle="collapse" data-target="#{3}" onclick="reply(this)">Submit</button>\
                     </div>';

var updateItemsWithPolarity = []; // go and update votes on elements that need updates

/** Gets HTML string of tags that relate to a particular item
 *
 * @param tagArray: The tag array for an item that was received from the database
 * @returns {string}: The HTML string containing the tags, generally added into a larger HTML template
 */
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

/** Gets the properly formatted date string for the item
 *
 * @param date: the date string for the item retrieved from the server
 * @returns {*}: the formatted date string if there is a date string, undefined if the date string does not exist
 */
function getDateString(date) {
    if (!date)
        return undefined;
    else if (date == "Just Now")
        return date;

    return date.slice(0, date.indexOf('T'));
}

/** Determines if a number should be indicated as positive or negative and returns the corresponding string
 *
 * @param num: The number to check
 * @returns {*}: The string corresponding to the numbers value, positive if greater than or equal to zero, negative otherwise
 */
function positiveOrNegative(num) {
    if (num >= 0)
        return "positive";
    else
        return "negative";
}

/** Gets the stars necessary to render a rating and returns the HTML string containing all 5 star svg elements
 *
 * @param rating: A number between 0 and 5 corresponding to the rating of the item
 * @returns {*} the HTML string containing 5 stars that match the rating passed in
 */
function getRating(rating) {
    return fillTemplate(starTemplate, 'yellow-star').repeat(rating) + fillTemplate(starTemplate, 'star').repeat(5-rating);
}

/** Fills in a "parent" comment template
 *
 * @param comment: the JSON object containing the comment info to fill the template with
 * @returns {*} the filled template HTML string if the page is loaded not yet loaded, else it returns an array containing
 * the filled HTML template string and the name of the new CKEditor that is a part of the comment template
 */
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

/** Fills in a "child" comment template
 *
 * @param comment: the JSON object containing the comment info to fill the template with
 * @returns {*} the filled template HTML string
 */
function fillCommentLevel2Template(comment) {
    if(comment.voted)
        updateItemsWithPolarity.push({id: comment.id, polarity: comment.voted});

    return fillTemplate(level2CommentTemplate, positiveOrNegative(comment.votes), comment.votes,
        getDateString(comment.date), comment.author, comment.author, comment.summary, comment.id, comment.voted);
}

// the number of editors on the page and the names of additional editors added to the page
var numEditors = 0;
var editorNames = [];

/** Gets the new editor name and id that will be appended with the new comment template and adds them to the list of
 * editor names as well as incrementing the number of editors on the page.
 *
 * @returns {Array}: An array containing the filled editor template, the filled editor template and the editor name
 * (only if the page is loaded)
 */
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

/** Activates the CKEditors on the page
 *
 * @param id: the id of the CKEditor to activate
 */
function activateEditors(id) {
    if (!id) {
        for (var i = 0; i < numEditors; i++)
            CKEDITOR.replace('e' + i);
    }
    else
        CKEDITOR.replace(id);
}

/** Fills the post template for the list and profile pages
 *
 * @param post
 * @returns {*}
 */
function fillPostTemplate(post) {
    var polarity = positiveOrNegative(post.votes);
    var tags = getTags(post.tags);
    var summary = getSummary(post.summary);
    var date = getDateString(post.date);

    return fillTemplate(postTemplate, post.id, post.title, polarity, post.votes, date, post.author,
        post.author, summary, post.id, tags, post.id, post.voted);
}


function fillReviewLevel1Template(review){
    if(review.voted)
        updateItemsWithPolarity.push({id: review.id, polarity: review.voted});

    if(!loaded){
        return fillTemplate(level1ReviewTemplate, review.id, getRating(review.rating, 'yellow-star'),
            getDateString(review.date), review.author, review.author, review.content, positiveOrNegative(review.votes),
            review.votes, review.voted);}
    else{
        return fillTemplate(level1ReviewTemplate, review.id, getRating(review.rating, 'yellow-star'),
            getDateString(review.date), review.author, review.author, review.content, positiveOrNegative(review.votes),
            review.votes, review.voted);}
}

/** Fills the link template for the list and profile pages
 *
 * @param li
 * @returns {*}
 */
function fillLinkTemplate(li) {
    return fillTemplate(linkTemplate, li.url, li.title, positiveOrNegative(li.votes), li.votes, getDateString(li.date),
        li.author, li.author, getSummary(li.summary), li.id, getTags(li.tags), li.id, li.voted);
}

/** Fills the class template for the list and profile pages
 *
 * @param cl
 * @returns {*}
 */
function fillClassTemplate(cl) {
    return fillTemplate(classTemplate, cl.id, cl.courseCode, cl.title, getRating(cl.rating), getDateString(cl.date),
        cl.author, cl.author, getSummary(cl.summary), cl.id, getTags(cl.tags), cl.id);
}

/** Gets the abbreviated summary for an item
 *
 * @param summ: the full summary provided for the item
 * @returns {*}: the abbreviated summary if the full summary is more than 120 characters
 */
function getSummary(summ) {
    if (summ.length > 120)
        return summ.replace(/<(?:.|\n)*?>/gm, ' ').slice(0, 120) + ' ...'; //TODO: make this more intelligent
    else
        return summ.replace(/<(?:.|\n)*?>/gm, ' ');
}

/** Builds a list of items on the profile and list pages based upon the list of items passed in and appends it to the
 * target element
 *
 * @param items the items to populate the html list with
 * @param target the target html element where the
 */
function buildList(items, target) {
    var filledTemplate;

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
        else if (it.type == "comment")
            filledTemplate = fillCommentTemplate(it);
        else if (it.type == "rating")
            filledTemplate = fillReviewTemplate(it);

        if (filledTemplate)
            $(target).append(filledTemplate);
    }
}