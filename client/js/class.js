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

// hold the class ID and the user rating for the page as global variables
var classID;
var starRating = 0;
var loaded = false;

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

    AJAXCall(href, content, true, onSuccess);
}

function onSuccess(data) {
    classID = data.class.id;
    fillInClassHeader(data.class);
    addReviews(data.ratingList);
    CKEDITOR.replace('editor1');
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
    }, function(){}); // this empty function on hover-off is required to make the stars render correctly

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
    if (reviews.length === 0) {
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

        if(reviews[review].voted)
            updateItemsWithPolarity.push({id: reviews[review].id, polarity: reviews[review].voted});

        template = fillReviewLevel1Template(reviews[review]);

        if (reviews[review].children) {
            for (var child in reviews[review].children) {
                if (!reviews[review].children.hasOwnProperty(child))
                    continue;

                if (reviews[review].children[child].voted)
                    updateItemsWithPolarity.push({id: reviews[review].children[child].id,
                        polarity: reviews[review].children[child].voted});

                template += fillCommentLevel2Template(comments[comment].children[child]);
            }
        }

        $('#reviews').append(template);
    }
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
    if(!withComment) {
        return {
            rating: starRating,
            parent: classID,
            voted: 'positive',
            votes: 1
        }
    }
    else {
        return {
            rating: starRating,
            parent: classID,
            summary: CKEDITOR.instances['message-text'].getData(),
            content: CKEDITOR.instances['message-text'].getData(),
            voted: 'positive',
            votes: 1
        }
    }
}

// render the page
$(document).ready(whenLoaded);