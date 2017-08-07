/*
 * Generator.js
 * Written by Michael Albinson 11/19/16
 *
 * Functional interface for generating random things
 */

"use strict";

/** Generates a system unique 32 char string
 *
 * @returns {*} A 32 char alphanumberic string (a UUID)
 */
exports.generate = function() {
    return generateUUID0(32);
};

/** Generates a random 6 char string
 *
 * @returns {*} A 6 char alphanumberic string
 */
exports.generateShort = function() {
    return generateUUID0(6);
};

/** Generates a random 2 char string
 *
 * @returns {*} A 2 char alphanumberic string
 */
exports.generateXShort = function() {
    return generateUUID0(2);
};

/** For when the built-ins just don't do the trick... Use them first, there's no sense hardcoding numbers throughout code
 *
 * @param length the desired length of the alphanumberic string
 * @returns {string} the string of length @length
 */
exports.generateIdentifierOfLength = function(length) {
    return generateUUID0(length);
};

exports.generateUsername = function() {
    const adj = ['Abominable', 'Astonishing', 'Acrimonious', 'Fantastic', 'Wonderful', 'Adventurous', 'Bitter', 'Frustrated',
        'Criminal', 'Stirling', 'Beautiful', 'Crushing', 'Satisfied', 'Monstrous', 'Curious', 'Terse', 'Interested',
        'ProcedurallyGenerated', 'Anonymous', 'Functional', 'Appreciative', 'Horrified', 'Lustrous', 'Viscous', 'Thermodynamic',
        'Presidential', 'Opaque', 'StructurallySound', 'Unstable', 'Free', 'Floundering', 'Helpful', 'Unusual', 'Bubbly',
        'Programmatic', 'Auxiliary', 'Enraged', 'Robotic', 'Mechatronic', 'Chemical', 'Mechanical', 'Civil', 'Electrical',
        'Explosive', 'Enigmatic', 'Misanthropic', 'Human', 'Robotic', 'Environmental', 'Thoughtful', 'Eager', 'Neat',
        'Destructive'];
    const noun = ['Antelope', 'Anteater', 'ArtSci', 'Computer', 'Virus', 'Program', 'Circuit', 'Gear', 'Chemical',
        'Molecule', 'Element', 'Plant', 'Particle', 'Cell', 'Mystery', 'Math', 'Problem', 'Proof', 'Theory', 'Method',
        'Diode', 'Geode', 'Pickax', 'Pixel', 'Rock', 'Mineral', 'Force', 'Metal', 'Ceramic', 'Crystal', 'FreeBodyDiagram',
        'Transistor', 'Function', 'Puppy', 'Kitten', 'Dragonfly', 'Equations', 'Snippet', 'Atom', 'Molecule', 'Solution',
        'Structure', 'Cross-Beam', 'Truss', 'Dynamite', 'Proof', 'Theory', 'Theorem', 'Equation', 'Enigma', 'Robot',
        'Trajectory', 'Map', 'Mystery', 'Problem', 'FREChawk', 'Fusion'];

    return adj[Math.floor(Math.random() * adj.length)] + noun[Math.floor(Math.random() * noun.length)];
};

/**
 * Generic alphanumberic string generator. Note that the longer the identifier is the more likely it is to be unique.
 *
 * @param length length of the identifier to create
 * @returns {string} the random identifier
 */
function generateUUID0(length) {
    var identifier = "";
    const allowedChars = "abcdefghijklmnopqrstuvwxyz0123456789";

    for(var i = 0; i < length; i++)
        identifier += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));

    return identifier
}