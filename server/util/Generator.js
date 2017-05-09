/*
 * Generator.js
 * Written by Michael Albinson 11/19/16
 *
 * Functional interface for generating random things
 * TODO: add username generation
 */

"use strict";

exports.generate = function() {
	var identifier = "";
    var allowedChars = "abcdefghijklmnopqrstuvwxyz0123456789";
    
    for(var i=0; i < 32; i++)
        identifier += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));

    return identifier;
};

exports.generateUsername = function() {
    const adj = ['Abominable', 'Astonishing', 'Acrimonious', 'Fantastic', 'Wonderful', 'Adventurous', 'Bitter', 'Frustrated',
        'Criminal', 'Functional', 'Beautiful', 'Crushing', 'Satisfied', 'Monstrous', 'Curious', 'Terse', 'Interested',
        'ProcedurallyGenerated', 'Anonymous', 'Functional', 'Appreciative', 'Horrified', 'Lustrous', 'Viscous', 'Thermodynamic',
        'Presidential', 'Opaque', 'StructurallySound', 'Unstable', ''];
    const noun = ['Antelope', 'Anteater', 'ArtSci', 'Computer', 'Virus', 'Program', 'Circuit', 'Gear', 'Chemical',
        'Molecule', 'Element', 'FREC', 'Plant', 'Particle', 'Cell', 'Mystery', 'Math', 'Problem', 'Proof', 'Theory', 'Method',
        'Diode', 'Geode', 'Pickax', 'Pixel', 'Rock', 'Mineral', 'Force', 'Metal', 'Ceramic', 'Crystal', 'FreeBodyDiagram',
        'Transistor', 'Function'];

    return adj[Math.floor(Math.random() * adj.length)] + noun[Math.floor(Math.random() * noun.length)];
};