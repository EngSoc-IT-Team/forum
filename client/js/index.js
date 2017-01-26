"use strict";
var currentButton = "#all";
function toggleSelection(button) {
    $('#toggle').addClass('hidden');
    $(currentButton).removeClass('active');
    currentButton = "#" + button;
    $(currentButton).addClass('active');
}

function showOptions() {
    $('#toggle').addClass('hidden');
    $('#options').fadeIn();
}