/* index.js
** Created by Michael Albinson 1/26/17
*/

"use strict";
// current button of the
var currentButton = "#all";
function toggleSelection(button) {
    $('#toggle').addClass('hidden');
    $(currentButton).removeClass('active');
    currentButton = "#" + button;
    $(currentButton).addClass('active');
}

/**
 * Shows the different options for a more specific search
 */
function showOptions() {
    $('#toggle').addClass('hidden');
    $('#options').fadeIn();
}

/** TODO: REMOVE THIS BEFORE THE DEMO
 * Shows the how to use the forum information modal
 */
$(window).ready(function() {
    triggerModal('quickHelp');
});
