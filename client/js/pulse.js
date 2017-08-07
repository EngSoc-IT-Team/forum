/*
* Copyright (c) 2012, Jarrod Overson All rights reserved.

 Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 The names of its contributors may not be used to endorse or promote products derived from this software without specific prior written permission.
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JARROD OVERSON BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
 OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
(function(t,e){"use strict";var n={pulses:1,interval:0,returnDelay:0,duration:500};t.fn.pulse=function(u,a,r){var i="destroy"===u;return"function"==typeof a&&(r=a,a={}),a=t.extend({},n,a),a.interval>=0||(a.interval=0),a.returnDelay>=0||(a.returnDelay=0),a.duration>=0||(a.duration=500),a.pulses>=-1||(a.pulses=1),"function"!=typeof r&&(r=function(){}),this.each(function(){function n(){return void 0===s.data("pulse")||s.data("pulse").stop?void 0:a.pulses>-1&&++p>a.pulses?r.apply(s):(s.animate(u,f),void 0)}var o,s=t(this),l={},d=s.data("pulse")||{};d.stop=i,s.data("pulse",d);for(o in u)u.hasOwnProperty(o)&&(l[o]=s.css(o));var p=0,c=t.extend({},a);c.duration=a.duration/2,c.complete=function(){e.setTimeout(n,a.interval)};var f=t.extend({},a);f.duration=a.duration/2,f.complete=function(){e.setTimeout(function(){s.animate(l,c)},a.returnDelay)},n()})}})(jQuery,window,document);

/** Pulse.js, borrowed from Jarrod Overson
 * extended by Michael Albinson 6/2/17
 */
"use strict";

function startPulsing() {
    $('.main-content').prepend('<div id="pulsing" class="centered obscure">\
                                    <div class="pulse-logo-container">\
                                        <img class="med-img" src="../assets/qef.png">\
                                        <div>Loading...</div>\
                                    </div>\
                                </div>');
    var properties = {
        opacity: 0.25
    };

    var defaults = {
        pulses: -1,
        duration: 2000
    };

    $(".pulse-logo-container").pulse(properties, defaults);
}

function stopPulsing() {
    $(".pulse-logo-container").pulse('destroy');
    $('#pulsing').remove();
}