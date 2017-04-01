"use strict";

// Templates only used on the class page
var classTemplate = '<div class="info-block clearfix">\
                            <div class="col-sm-12">\
                                <div class="clearfix">\
                                    <h2 class="title"><a href="/class?id={0}">{1}: {2}</a></h2>\
                                </div>\
                            </div>\
                            <div class="row">\
                                <div class="col-sm-4">\
                                    <div class="course-rating">\
                                        {4}\
                                    </div>\
                                    <div class="star-ratings">\
                      					<span class="star">\
                                            <img src="../assets/star.svg" class="svg" />\
                                        </span>\
                      			        <span class="star">\
                                            <img src="../assets/star.svg" class="svg" />\
                                        </span>\
                      			        <span class="star">\
                                            <img src="../assets/star.svg" class="svg" />\
                                        </span>\
                      			        <span class="star">\
                                            <img src="../assets/star.svg" class="svg" />\
                                        </span>\
                      			        <span class="star">\
                                            <img src="../assets/star.svg" class="svg" />\
                                        </span>\
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
                            <div class="action-links">\
                                <a href="javascript: void 0;" onclick="subscribe(this)">Subscribe</a>\
                                <a href="javascript: void 0;" onclick="save(this)">Save</a>\
                                <a href="javascript: void 0;" onclick="report(this)">Report</a>\
                            </div>\
                            {3}\
                            </div>\
                            <div class="col-sm-12 review-container">\
                                <button class="btn btn-md button" data-toggle="modal" data-target="#submitReview">Submit Review</button>\
                            </div>\
                        </div>';

var level1ReviewTemplate = '<div class="col-sm-12" id="{0}">\
                                {1}\
                                <span class="date">{2} by <a href="profile/username={3}">{4}</a></span>\
                                <div class="description show-links">{5}</div>\
                                <button class="btn btn-sm button" onclick="save(this)">Save</button>\
                                <button class="btn btn-sm button" onclick="report(this)">Report</button>\
                                <hr />\
                            </div>';

// hold the class ID and the user rating for the page as global variables
var classID;
var starRating = 0;

/**
 * Once the page is loaded, gets the class item from the server as well as all of its corresponding reviews,
 * and renders them on the page.
 */
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

// Class Rating Stars (Homage to @TranBrian10 on Github for his help on this)
/**
 * When the document is ready, adds the hover and onclick events to all of the stars where a user can submit a rating
 */
jQuery(document).ready(function() {
    var stars = $(".star-ratings .star"); //Get the star elements
    stars.hover(function() {
        //Add yellow colour to current and previous stars
        var hoveredStars = $(this).prevAll().add(this);
        hoveredStars.addClass("hovered");

        //Remove yellow caused by rated stars so that the hovering shows the new potential rating
        var allStars = $(this).siblings().add(this);
        allStars.removeClass("rated-star");
    },
    function() {
        //Remove all yellow caused by hovering
        var allStars = $(this).siblings().add(this);
        allStars.removeClass("hovered unhovered");

        //Add back yellow caused by rated stars to the correct number of rated stars
        allStars.slice(0, starRating).addClass("rated-star");
    });

    stars.on("click", function() {
        //Removes the rated-star class from all stars in case a rating was provided earlier
        var allStars = $(this).siblings().add(this);
        allStars.removeClass("rated-star");

        //Adds the the rated-star class to the stars corresponding with the clicked rating
        var hoveredStars = $(this).prevAll().add(this);
        hoveredStars.addClass("rated-star");

        //Update the starRating variable with the new rating
        starRating = hoveredStars.length;
    });

    var headerStars = $("#classHead .star-ratings");

    // Allows for rating by hovering over the course rating in the classHead
    $(".course-rating").hover(function() {
        $(this).toggle();
        headerStars.toggle();
    }, function(){});

    // Shows the average class rating if the user has not rated the course
    headerStars.mouseleave(function() {
        if (!($(".star").hasClass('rated-star'))) {
            $(this).toggle();
            $(".course-rating").toggle();
        }
    });
});

/** Creates the star HTML elements included with both the class and review elements
 *
 * @param rating: The number, out of 5, of stars associated with an item
 * @param mainColor: The color of the stars that are filled in for the rating
 * @returns {*} The HTML string containing 5 stars of the indicated colors
 */
function getRating(rating, mainColor) {
    return fillTemplate(starTemplate, mainColor).repeat(rating) + fillTemplate(starTemplate, 'grey-star').repeat(5 - rating);
}

/** Fills in the class Template and appends it to the page at the #classHead
 *
 * @param cl: The class JSON object received from the server
 */
function fillInClassHeader(cl) {
    var tmp = fillTemplate(classTemplate, cl.id, cl.courseCode, cl.title, getTags(cl.tags), getRating(cl.rating, 'red-star'),
        cl.instructor, cl.credit, cl.prereqs, cl.summary);
    $('#classHead').append(tmp);
}

/** Creates all the reviews for the class and then appends them to the #review element
 *
 * @param reviews: The review array for the class that need to be rendered
 */
function addReviews(reviews) {
    var template;
    if (reviews.length == 0) {
        $('#getMore').hide();
        $('#foot').append("<h6 class='info-block'>Nothing here yet! Add a comment to get the discussion going!</h6>");
        return;
    }
    else if (reviews.length < 10) {
        $('#foot').hide();
    }

    for (var review in reviews) {
        if (!reviews.hasOwnProperty(review))
            continue;

        template = fillReviewLevel1Template(reviews[review]);
        $('#reviews').append(template);
    }
}

/** Function used to create a HTML string for the review JSON object that is passed in
 *
 * @param review: The review item json to be displayed
 * @returns {*} The filled review template's HTML string
 */
function fillReviewLevel1Template(review) {
    return fillTemplate(level1ReviewTemplate, review.id, getRating(review.rating, 'yellow-star'),
        getDateString(review.date), review.author, review.author, review.content);
}

/** Rates the class by either submitting a review and rating or just a rating
 *
 * @param element: The element containing the rating information
 */
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

/** Gets the rating information that a user is trying to make with or without a comment
 *
 * @param element: The element associated with the rating
 * @param withComment: A flag indicating whether or not a rating has a comment associated with it
 * @returns {*} A JSON object containing the rating and comment, if there is one
 */
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

// render the page
whenLoaded();