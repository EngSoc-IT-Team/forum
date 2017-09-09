"use strict";

/*
* Profile.js
* Created by Michael Albinson 2/15/17
 */

var commentTemplate ='<div class ="col-sm-12" id="{4}" data-hasvoted="{5}" data-hastype="comment">\
                           <div style="display:inline-block">\
                                <span class="thumbs-up pointer" tabindex="0">\
                                    <img src="../assets/thumbsUp.svg" class="svg">\
                                </span>\
                                <span id="votes" class="{0}">{1}</span>\
                                <span class="thumbs-down pointer" tabindex="0">\
                                    <img src="../assets/thumbsDown.svg" class="svg">\
                                </span>\
                           </div>\
                           <span class="date"> You commented on {2} </span>\
                           <p class="description">{3}</p>\
                           <div class="action-links">\
                               <a href="/link?id={6}">View</a>\
                               <a href="javascript: void 0;" onclick="subscribe(this)">Subscribe</a>\
                               <a href="javascript: void 0;" onclick="save(this)">Save</a>\
                               <a href="javascript: void 0;" onclick="report(this)">Report</a>\
                           </div>\
                           <hr/>\
                       </div>';


var reviewTemplate = '<div class="col-sm-12" id="{3}" data-hasvoted="{4}" data-hastype="review">\
                        <div style="display:inline-block">\
                            <div class="class-rating">\
                                {0}\
                            </div>\
                        </div>\
                        <span class="date">on {1}</span>\
                        <p class="description">{2}</p>\
                        <div class="action-links">\
                            <a href="/link?id={5}">View</a>\
                            <a href="javascript: void 0;" onclick="subscribe(this)">Subscribe</a>\
                            <a href="javascript: void 0;" onclick="save(this)">Save</a>\
                            <a href="javascript: void 0;" onclick="report(this)">Report</a>\
                        </div>\
                        <hr/>\
                      </div>';

//the userID of the user
var uid;

/**
 * Gets the profile information, saves, contributions, and contributions of the user form the server and adds them to the
 * page
 */
function whenLoaded() {
	var href;
    var content = {
		requested: "profile"
	};

    if (window.location.href.includes("?")) { // hide the personal section if
        $(personal).hide();
        content.self = false;
        href = '/info' + window.location.href.slice(window.location.href.indexOf('?'));
    }
    else {
        content.self = true;
        $(knowledge)[0].innerHTML = "I know about:";
        href = '/info';
    }

    AJAXCall(href, content, true, onSuccess);
}

function onSuccess(data) {
    if (!data.profile){
        $('#aProblemOccurred').modal('toggle');
        return;
    }

    animateVotingBar(data.profile.upvotes, data.profile.downvotes);
    fillInUserInfo(data.profile);
    fillInPostInfo(data.items);
    addTags(data.tags);
    svgConverter();
}

/** Animates the voting bar on load of the page to show the relative number of upvotes and downvotes of a user
 *
 * @param upvotes: The number of upvotes the user has
 * @param downvotes: The number of downvotes a user has
 */
function animateVotingBar(upvotes, downvotes) {
	var ups = $(positive)[0];
	var down = $(negative)[0];
	var upinc = (upvotes / (upvotes + downvotes));
	var downinc = (downvotes / (upvotes + downvotes));
	var inc = 0;

    if (upinc > 0.99)
        $(positive).css('border-radius', '10px');
    else if (downinc > 0.99)
        $(negative).css('border-radius', '10px');

    var id = setInterval(frame, 7);
    function frame() {
        if (inc > 400) {
            clearInterval(id);
        }
        else {
            ups.style.width = (upinc / 4) * inc + "%";
            down.style.width = (downinc / 4) * inc + "%";
            inc++;
        }
    }
}

/** Fills in the header of the profile page with all of the information retrieved from the server
 *
 * @param profile: the JSON object containing information specific to the user
 */
function fillInUserInfo(profile) {
    uid = profile.id;
	$(posts)[0].innerHTML = "Posts: " + profile.posts;
	$(comments)[0].innerHTML = "Comments: " + profile.comments;
	$(links)[0].innerHTML = "Links: " + profile.links;
	$(other)[0].innerHTML = "Other Contributions: " + profile.other;
	$(up)[0].innerHTML = "++" + profile.upvotes;
	$(down)[0].innerHTML = "--" + profile.downvotes;
	$(username)[0].innerHTML = profile.username;
	$(joined)[0].innerHTML = "Date Joined: " + profile.dateJoined.slice(0, profile.dateJoined.indexOf('T'));
}

/** Fills in the saved, subscribed and contribution components of the page for the given information provided. Note that
 * saves and subscriptions are only provided if the user if viewing their own profile, otherwise only contributions
 * are shown.
 *
 * @param items: the items that the user has saved, subscribed and contributed
 */
function fillInPostInfo(items) {
    var sub = $('#subscribed');
    var save = $('#saved');
    var contr = $('#contributions');


    if (items.subscribed.length != 0) {
        sub[0].innerHTML = "";
        buildList(items.subscribed, '#subscribed');
        sub.append('<a class="centered" href="javascript:void(0)" onclick="getMore(\'profile\', \'subscribed\')">v Load More v</a>')
    }

    if (items.saved.length != 0) {
        save[0].innerHTML = "";

        buildList(items.saved, '#saved');
        save.append('<a class="centered" href="javascript:void(0)" onclick="getMore(\'profile\', \'saved\')">v Load More v</a>')
    }

    if (items.contributions.length != 0) {
        contr[0].innerHTML = "";
        buildList(items.contributions, '#contributions');
        contr.append('<a class="centered" href="javascript:void(0)" onclick="getMore(\'profile\', \'contributions\')">v Load More v</a>')
    }
}

/** Adds the tags the user knows about to the profile header
 *
 * @param tags: The tags the user "knows about"
 */
function addTags(tags) {
    var html = '';
    for (var i=0; i< tags.length; i++){
        html = $.parseHTML(fillTemplate(tag, tags[i], tags[i]))[0];
        if (html)
            $('#knowledge')[0].append(html);
    }
}

/**
 *
 * @param it object with form {
        id: item.getValue(lit.FIELD_ID),
        author: item.getValue(lit.FIELD_AUTHOR),
        content: item.getValue(lit.FIELD_CONTENT),
        netVotes: item.getValue(lit.FIELD_NETVOTES),
        parent: item.getValue(lit.FIELD_PARENT_POST),
        parentComment: item.getValue(lit.FIELD_PARENT_COMMENT),
        type: lit.COMMENT_TABLE,
        date: item.getValue(lit.FIELD_TIMESTAMP),
        voted: hasVoted
    };
 * @returns {*} the filled template for the comment, to be appended to the document
 */
function fillCommentTemplate(comment) {

        return fillTemplate(commentTemplate, positiveOrNegative(comment.netVotes), comment.netVotes,
        getDateString(comment.date), comment.content, comment.id, comment.voted, comment.parentName);

}

/**
 *
 * @param it object with form {
        parent: item.getValue(lit.FIELD_PARENT),
        id: item.getValue(lit.FIELD_ID),
        rating: item.getValue(lit.FIELD_AVERAGE_RATING),
        author: item.getValue(lit.FIELD_AUTHOR),
        content: item.getValue(lit.FIELD_CONTENT),
        date: item.getValue('datetime'),
        type: lit.RATING_TABLE,
        voted: hasVoted
    }
 * @returns {*} the filled template for the review, to be appended to the document
 */
function fillReviewTemplate(review) {

    return fillTemplate(reviewTemplate, review.rating,
    getDateString(review.date), review.content, review.id, review.voted, review.parent);

}

// Render document
$(document).ready(whenLoaded);