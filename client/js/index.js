/* index.js
** Created by Michael Albinson 1/26/17
*/

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

$(window).ready(function(){
    $('#myModal').modal('show');
});
