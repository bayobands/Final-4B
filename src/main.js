// Bayo Bandele
// Created: 6/11/2025
// Phaser: 3.70.0
// Sugar Coin Rush Game
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 1440,
    height: 900,
    scene: [Load, MainScreen, Platformer, Platformer1, Platformer2, GameEnd, Credits],
}

let game = new Phaser.Game(config);
let borderUISize = game.config.height / 15
let borderPadding = borderUISize / 3

var cursors;
const SCALE = 2.0;
var my = {sprite: {}, text: {}, vfx: {}};
