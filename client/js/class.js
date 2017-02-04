"use strict";

jQuery(document).ready(function() {

$('.modal #star-1').hover(
  function() {
    $('.modal .star').removeClass('yellow');
    $('#star-1').addClass('yellow');
  },
  function() {
    $('#star-1').removeClass('yellow');
  }
);

$('.modal #star-2').hover(
  function() {
    $('.modal .star').removeClass('yellow');
    $('#star-1').addClass('yellow');
    $('#star-2').addClass('yellow');
  },
  function() {
    $('#star-1').removeClass('yellow');
    $('#star-2').removeClass('yellow');
  }
);

$('.modal #star-3').hover(
  function() {
    $('.modal .star').removeClass('yellow');
    $('#star-1').addClass('yellow');
    $('#star-2').addClass('yellow');
    $('#star-3').addClass('yellow');
  },
  function() {
    $('#star-1').removeClass('yellow');
    $('#star-2').removeClass('yellow');
    $('#star-3').removeClass('yellow');
  }
);

$('.modal #star-4').hover(
  function() {
    $('.modal .star').removeClass('yellow');
    $('#star-1').addClass('yellow');
    $('#star-2').addClass('yellow');
    $('#star-3').addClass('yellow');
    $('#star-4').addClass('yellow');
  },
  function() {
    $('#star-1').removeClass('yellow');
    $('#star-2').removeClass('yellow');
    $('#star-3').removeClass('yellow');
    $('#star-4').removeClass('yellow');
  }
);

$('.modal #star-5').hover(
  function() {
    $('.modal .star').removeClass('yellow');
    $('#star-1').addClass('yellow');
    $('#star-2').addClass('yellow');
    $('#star-3').addClass('yellow');
    $('#star-4').addClass('yellow');
    $('#star-5').addClass('yellow');
  },
  function() {
    $('#star-1').removeClass('yellow');
    $('#star-2').removeClass('yellow');
    $('#star-3').removeClass('yellow');
    $('#star-4').removeClass('yellow');
    $('#star-5').removeClass('yellow');
  }
);

});
