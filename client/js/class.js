"use strict";

var tagTemplate = '<button class="btn btn-sm question-tag" type="submit" onclick="window.location = \'/list?tag={0}\'">{1}</button>';

var classTemplate = '<div class="info-block clearfix">\
                            <div class="col-sm-12">\
                                <div class="clearfix">\
                                    <h2 class="title"><a href="/class?id={0}">{1}: {2}</a></h2>\
                                    {3}\
                                </div>\
                            </div>\
                            <div class="row">\
                                <div class="col-sm-4">\
                                    <div class="course-rating">\
                                        {4}\
                                    </div>\
                                    <p class="instructor"><b>Instructor: </b>{5}</p>\
                                    <p><b>Credits: </b>{6}</p>\
                                </div>\
                                <div class="col-sm-8">\
                                    <p class="prerequisites"><b>Prerequisites:</b></p>\
                                    <p>{7}</p>\
                                </div>\
                            </div>\
                            <div class="col-sm-12">\
                                <p class="course-description-title"><b>Course Description</b></p>\
                                <p class="description">{8}</p>\
                            </div>\
                            <div class="col-sm-12 review-container">\
                                <button class="btn btn-md button" data-toggle="modal" data-target="#submitReview">Submit Review</button>\
                            </div>\
                        </div>';

var level1ReviewTemplate = '<div class="col-sm-12">\
                                {0}\
                                <span class="date">{1} by <a href="profile/id={2}">{3}</a></span>\
                                <p class="description">{4}</p>\
                                <button class="btn btn-sm button" onclick="save({5}, {6})">Save</button>\
                                <button class="btn btn-sm button" onclick="report({7})">Report</button>\
                                <hr />\
                            </div>';

var level2ReviewTemplate = '<div class="info-block comment-block media">\
                                {stars-yellow}\
                                <span class="date">{date} by <a href="profile/id={author}">{author}</a></span>\
                                <p class="description">{summ}</p>\
                                <button class="btn btn-sm button" href="/question/id=tobecreated">Save</button>\
                                <button class="btn btn-sm button" href="/question/id=tobecreated">Report</button>\
                                <hr />\
                            </div>';

var starTemplate = '<span class="star rating">\
                      <img src="../assets/{0}.svg" class="svg" />\
                    </span>';

function whenLoaded() {
    var href;
    var content = {
        requested: "class"
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
            fillInClassHeader(data.class);
            addReviews(data.reviews);
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

jQuery(document).ready(function() {

// Class Rating Stars



{
  //Retains the current star rating
  var starRating = 0;

  $(".star-ratings .star").hover(
    function(e) {
      //Add yellow colour to current and previous stars
      var hoveredStars = $(this).prevAll().add(this);
      hoveredStars.addClass("hovered");

      //Remove yellow caused by rated stars so that the hovering shows the new potential rating
      var allStars = $(this).siblings().add(this);
      allStars.removeClass("rated-star");
    },
    function(e) {
      //Remove all yellow caused by hovering
      var allStars = $(this).siblings().add(this);
      allStars.removeClass("hovered unhovered");

      //Add back yellow caused by rated stars to the correct number of rated stars
      allStars.slice(0, starRating).addClass("rated-star");
    }
  );

  $(".star-ratings .star").on("click", function(e) {

    //Removes the rated-star class from all stars in case a rating was provided earlier
    var allStars = $(this).siblings().add(this);
    allStars.removeClass("rated-star");

    //Adds the the rated-star class to the stars corresponding with the clicked rating
    var hoveredStars = $(this).prevAll().add(this);
    hoveredStars.addClass("rated-star");

    //Update the starRating variable with the new rating
    starRating = hoveredStars.length;
  });
}


});

function getRating(rating, mainColor) {
    return fillTemplate(starTemplate, mainColor).repeat(rating) + fillTemplate(starTemplate, 'star').repeat(5 - rating);
}

function fillInClassHeader(cl) {
    var tmp = fillTemplate(classTemplate, cl.id, cl.courseCode, cl.title, getTags(cl.tags), getRating(cl.rating, 'red-star'),
        cl.instructor, cl.credit, cl.prereqs, cl.summary);
    $('#classHead').append(tmp);
}

function addReviews(comments) {
    var template;
    if (comments.length == 0) {
        $('#getMore').hide();
        $('#foot').append("<h6 class='info-block'>Nothing here yet!</h6>");
        return;
    }

    for (var comment in comments) {
        if (!comments.hasOwnProperty(comment))
            continue;

        template = fillReviewLevel1Template(comments[comment]);

        if (comments[comment].children) {
            for (var child in comments[comment].children) {
                if (!comments[comment].children.hasOwnProperty(child))
                    continue;

                template += fillReviewLevel2Template(comments[comment].children[child]);
            }
        }

        $('#reviews').append(template);
    }
}

function fillReviewLevel1Template(comment) {
    return fillTemplate(level1ReviewTemplate, positiveOrNegative(comment.votes), comment.votes,
        getDateString(comment.date), comment.author, comment.author, comment.summary);
}

function fillReviewLevel2Template(comment) {
    return fillTemplate(level2ReviewTemplate, positiveOrNegative(comment.votes), comment.votes,
        getDateString(comment.date), comment.author, comment.author, comment.summary);
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

whenLoaded();
