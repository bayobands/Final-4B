class Platformer2 extends Phaser.Scene {
    constructor() {
        super("platformer2Scene");
    }

    init() {
        // Game settings
        this.ACCELERATION = 350;
        this.DRAG = 300;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1010;
        this.JUMP_VELOCITY = -400;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }

    create() {
        // --- TILEMAP & LAYERS ---
        this.map = this.add.tilemap("platformer-level-3", 18, 18, 13000, 25);
        this.tileset = this.map.addTilesetImage("Food", "tilemap_tile3");
        this.tilesetBackground = this.map.addTilesetImage("FoodBackground", "tilemap-backgrounds2");

        // Create background and ground layers
        this.backgroundLayer = this.map.createLayer("FoodBackground", this.tilesetBackground, 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

        // Set world bounds to match map size
        this.physics.world.setBounds(0, 0, this.map.widthInPixels);

        // --- PLAYER SETUP ---
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // --- INPUT SETUP ---
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        // Debug key listener (D key toggles physics debug)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        }, this);

        // --- PARTICLE EFFECTS ---
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: [
                'spark_01.png','spark_02.png','spark_03.png','spark_04.png',
                'spark_05.png','spark_06.png','spark_07.png','spark_08.png','spark_09.png'
            ],
            random: true,
            scale: {start: 0.05, end: 0.1},
            lifespan: 350,
            alpha: {start: 1, end: 0.1},
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
        this.hurtSound = this.sound.add('hurt');

        // --- BOSS SETUP ---
        // Spawn boss off the bottom of the screen at x = 300
        this.boss = this.physics.add.sprite(
            300,
            this.sys.game.config.height + 50,
            'Boss'
        ).setOrigin(0.5, 0.5);
        this.boss.body.setAllowGravity(false);
        this.boss.displayWidth = this.sys.game.config.width * 0.06;
        this.boss.displayHeight = this.sys.game.config.height * 0.06;

        // Boss movement control
        this.bossCanMove = false;
        this.time.delayedCall(3000, () => {
            this.bossCanMove = true;
        }, [], this);

        // Boss-player collision: play hurt sound and restart scene
        this.physics.add.overlap(this.boss, my.sprite.player, () => {
            this.hurtSound.play();
            this.scene.restart();
        }, null, this);

        // --- END OBJECT SETUP ---
        // Load END object(s) from tilemap and animate
        this.anims.create({
            key: 'endAnim',
            frames: this.anims.generateFrameNumbers('tilemap_sheets3', { start: 13, end: 15 }),
            frameRate: 6,
            repeat: -1
        });

        this.END = this.map.createFromObjects("Objects", {
            name: "END",
            key: "tilemap_sheets3",
            frame: 14
        });

        this.END.forEach(door => {
            this.physics.world.enable(door, Phaser.Physics.Arcade.STATIC_BODY);
            door.anims.play('endAnim');
        });

        this.ENDGroup = this.add.group(this.END);

        // Player reaches END: go to previous scene
        this.physics.add.overlap(my.sprite.player, this.ENDGroup, (player, END) => {
            this.scene.stop("platformer2Scene");
            this.scene.start("GameEndscene");
        });
    }

    update() {
        // --- PLAYER MOVEMENT ---
        if (cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) my.vfx.walking.start();
            if (!this.runSound.isPlaying && my.sprite.player.body.blocked.down) {
                this.runSound.play({ loop: false });
            }
        } else if (cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
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
            this.hurtSound.play();
            this.scene.restart();
        }

        // --- BOSS MOVEMENT ---
        if (this.boss && this.bossCanMove) {
            this.physics.moveToObject(this.boss, my.sprite.player, 160); // Boss tracks player
        }
    }
}