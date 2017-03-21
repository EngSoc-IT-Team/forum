"use strict";

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

var level1ReviewTemplate = '<div class="col-sm-12" id="{0}">\
                                {1}\
                                <span class="date">{2} by <a href="profile/username={3}">{4}</a></span>\
                                <p class="description">{5}</p>\
                                <button class="btn btn-sm button" onclick="save(this)">Save</button>\
                                <button class="btn btn-sm button" onclick="report(this)">Report</button>\
                                <hr />\
                            </div>';


// TODO: delete if not used
// var level2ReviewTemplate = '<div class="info-block comment-block media" id="{0}">\
//                                 {1}\
//                                 <span class="date">{2} by <a href="profile/username={3}">{4}</a></span>\
//                                 <p class="description">{summ}</p>\
//                                 <button class="btn btn-sm button" onclick="save(this)">Save</button>\
//                                 <button class="btn btn-sm button" onclick="report(this)">Report</button>\
//                                 <hr />\
//                             </div>';

var classID;
var starRating = 0;

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
            classID = data.class.id;
            fillInClassHeader(data.class);
            addReviews(data.reviews);
            CKEDITOR.replace('editor1');
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

// Class Rating Stars (Homage to @TranBrian10 on Github for his help on this)

{
  //Retains the current star rating
  var stars = $(".star-ratings .star");
    stars.hover(
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

    stars.on("click", function(e) {

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

function addReviews(reviews) {
    var template;
    if (reviews.length == 0) {
        $('#getMore').hide();
        $('#foot').append("<h6 class='info-block'>Nothing here yet!</h6>");
        return;
    }

    for (var review in reviews) {
        if (!reviews.hasOwnProperty(review))
            continue;

        template = fillReviewLevel1Template(reviews[review]);
        $('#reviews').append(template);
    }
}

function fillReviewLevel1Template(review) {
    return fillTemplate(level1ReviewTemplate, review.id, getRating(review.rating, 'yellow-star'),
        getDateString(review.date), review.author, review.author, review.content);
}

// function fillReviewLevel2Template(review) {
//     return fillTemplate(level2ReviewTemplate, positiveOrNegative(review.votes), review.votes,
//         getDateString(review.date), review.author, review.author, review.summary);
// }

function rate(element) {
    var ratingInfo = getRatingInfo(element, true);
    $.ajax({
        url: '/action',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({info: ratingInfo, action: "rate", sub: "add"})
    }).done(function(data) {
        if (data) {
            ratingInfo.id = data.id;
            ratingInfo.author = data.author;
            ratingInfo.date = 'Just Now';
            $('#reviews').append(fillReviewLevel1Template(ratingInfo));
            console.log("Successful rating");
        }
        else {
            // TODO: display some error message
            console.error('An error occurred, or the user has already rated this class');
        }
    }).fail(function(err) {
        console.error(err);
    });
}

function getRatingInfo(element, withComment) {
    var rating = $(element);
    if(!withComment) {
        return {
            rating: starRating,
            parent: classID
        }
    }
    else {
        return {
            rating: starRating,
            parent: classID,
            content: CKEDITOR.instances['message-text'].getData()
        }
    }
}

whenLoaded();
