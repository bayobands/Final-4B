class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
        this.coinsCollected = 0;
    }

    init() {
        // --- GAME SETTINGS ---
        this.ACCELERATION = 600;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1000;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.coinsCollected = 0; // Reset coin count on scene start
    }

    create() {
        const REQUIRED_COINS = 50;

        // --- TILEMAP & LAYERS ---
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 13000, 25);
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.tilesetBackground = this.map.addTilesetImage("tilemap-backgrounds", "tilemap-backgrounds");
        this.tilesetBackgroundPacked = this.map.addTilesetImage("tilemap-backgrounds_packed", "tilemap-backgrounds_packed");

        // Background layer
        this.backgroundLayer = this.map.createLayer(
            "Background",
            [this.tilesetBackground, this.tilesetBackgroundPacked],
            0, 0
        );

        // Ground/platforms layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

        // --- COIN SETUP ---
        // Find and animate coins from the Objects layer
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        this.coins.forEach(coin => {
            this.physics.world.enable(coin, Phaser.Physics.Arcade.STATIC_BODY);
            coin.anims.play('coinAnim');
        });
        this.coinGroup = this.add.group(this.coins);

        // --- PLAYER SETUP ---
        this.physics.world.setBounds(0, 0, this.map.widthInPixels);
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // --- COIN COLLECTION HANDLING ---
        this.coinCollectSound = this.sound.add('coincollect');
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy();
            this.coinsCollected++;
            this.coinText.setText('Coins: ' + this.coinsCollected);
            this.coinCollectSound.play({
                volume: 2.0,
                rate: 1.5
            });
        });

        // --- DOOR SETUP ---
        // Main door
        this.door = this.map.createFromObjects("Objects", {
            name: "Door",
            key: "tilemap_sheet",
            frame: 130
        });
        this.door.forEach(door => {
            this.physics.world.enable(door, Phaser.Physics.Arcade.STATIC_BODY);
        });
        this.doorGroup = this.add.group(this.door);

        // Second door (Door1)
        this.door1 = this.map.createFromObjects("Objects", {
            name: "Door1",
            key: "tilemap_sheet",
            frame: 110
        });
        this.door1.forEach(door1 => {
            this.physics.world.enable(door1, Phaser.Physics.Arcade.STATIC_BODY);
        });
        this.door1Group = this.add.group(this.door1);

        // --- DOOR COLLISION HANDLING ---
        // Only allow door overlap if enough coins are collected
        this.physics.add.overlap(my.sprite.player, this.doorGroup, (player, door) => {
            if (this.coinsCollected >= REQUIRED_COINS) {
                this.scene.stop("platformerScene");
                this.scene.start("platformer1Scene");
            } else {
                this.coinText.setText('Need ' + (REQUIRED_COINS - this.coinsCollected) + ' more coins!');
                this.coinText.setColor('#ff0000');
                this.time.delayedCall(1000, () => {
                    this.coinText.setText('Coins: ' + this.coinsCollected);
                    this.coinText.setColor('#fff');
                });
            }
        });

        // --- COIN TEXT UI ---
        // Place coin text near the main door
        const doorObj = this.door[0];
        this.coinText = this.add.text(
            doorObj.x - 100,
            doorObj.y - 50,
            'Coins: 0',
            { fontSize: '40px', fill: '#fff' }
        ).setOrigin(0.5);

        // --- INPUT SETUP ---
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        // --- DEBUG KEYS ---
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        }, this);

        // --- MOVEMENT VFX ---
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: [
                'spark_01.png','spark_02.png','spark_03.png','spark_04.png',
                'spark_05.png','spark_06.png','spark_07.png','spark_08.png','spark_09.png'
            ],
            random: true,
            scale: { start: 0.05, end: 0.1 },
            lifespan: 350,
            alpha: { start: 1, end: 0.1 },
        });
        my.vfx.walking.stop();

        // --- CAMERA SETUP ---
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        // --- SOUNDS ---
        this.runSound = this.sound.add('run');
        this.jumpSound = this.sound.add('jump');
    }

    update() {
        // --- PLAYER MOVEMENT ---
        if (cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) my.vfx.walking.start();
            if (!this.runSound.isPlaying && my.sprite.player.body.blocked.down) {
                this.runSound.play({ loop: false });
            }
        } else if (cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) my.vfx.walking.start();
            if (!this.runSound.isPlaying && my.sprite.player.body.blocked.down) {
                this.runSound.play({ loop: false });
            }
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
            if (this.runSound && this.runSound.isPlaying) {
                this.runSound.stop();
            }
        }

        // --- PLAYER JUMP ---
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if (my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            if (!this.jumpSound.isPlaying && my.sprite.player.body.blocked.down) {
                this.jumpSound.play({ loop: false });
            }
        }

        // --- RESTART SCENE WITH R KEY ---
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        // --- DEATH BARRIER ---
        if (my.sprite.player.y > this.map.heightInPixels + 100) {
            this.scene.restart();
        }
    }
}