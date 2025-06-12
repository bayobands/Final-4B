class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information Level 1
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");

        // Load tilemap information Level 2
        this.load.image("tilemap_tile", "tilemap_packed1.png");
        this.load.tilemapTiledJSON("platformer-level-2", "Level2.tmj");

        // Load tilemap information Level 3
        this.load.image("tilemap_tile3", "tilemap_packed_food.png");
        this.load.tilemapTiledJSON("platformer-level-3", "Level3.tmj");
        
        // Tilemap in JSON

        // Load the tilemap as a spritesheet for Level 1
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        // Load the tilemap as a spritesheet for Level 2
        this.load.spritesheet("tilemap_sheets", "tilemap_packed1.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        // Load the tilemap as a spritesheet for Level 3
        this.load.spritesheet("tilemap_sheets3", "tilemap_packed_food.png", {
            frameWidth: 18,          
            frameHeight: 18
        });


       

        this.load.audio('run', 'running.mp3');

        this.load.audio('jump', 'retro-jump-3-236683.mp3');

        this.load.audio('hurt', 'roblox-death-sound_1.mp3');

        this.load.audio('coincollect', 'coin.mp3');

    // Load the Kenny particles
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

    // Load the tilemap backgrounds
        this.load.image("tilemap-backgrounds", "tilemap-backgrounds.png");
        this.load.image("tilemap-backgrounds_packed", "tilemap-backgrounds_packed.png");
        this.load.image("tilemap-backgrounds1", "tilesetOpenGameBackground.png");
        this.load.image("tilemap-backgrounds2", "1055.png");
        this.load.image("starfieldE", "starfield3.0.png");
        this.load.image("TitleBackgrounds", "TitleBackgrounds.png");
        this.load.image("starfieldC", "starfieldC.png");     
        
        
    // Load enemy sprites
        this.load.image('enemy_walk', 'enemy_walk.png');  // For ground enemy
        this.load.image('Boss', 'Cakes.png');    // For flying enemy

    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         this.scene.start("MainScreen"); // Start the platformer scene after loading
         
         this.anims.create({
    key: 'coinAnim',
    frames: [
        { key: 'tilemap_sheet', frame: 151 },
        { key: 'tilemap_sheet', frame: 152 }
    ],
    frameRate: 4,
    repeat: -1

    
});

    }


    update() {
    }
}