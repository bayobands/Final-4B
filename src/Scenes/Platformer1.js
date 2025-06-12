class Platformer1 extends Phaser.Scene {
    constructor() {
        super("platformer1Scene");
    }

    init() {
        // --- GAME SETTINGS ---
        this.ACCELERATION = 600;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1000; // Gravity for the player
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 100;
        this.SCALE = 2.0;
    }

    create() {
        // --- TILEMAP & LAYERS ---
        this.map = this.add.tilemap("platformer-level-2", 18, 18, 13000, 25);
        this.tileset = this.map.addTilesetImage("tilemap2", "tilemap_tile");
        this.tilesetBackground = this.map.addTilesetImage("Sky", "tilemap-backgrounds1");

        // Background and ground layers
        this.backgroundLayer = this.map.createLayer("Background", [this.tilesetBackground], 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.physics.world.setBounds(0, 0, this.map.widthInPixels);

        // --- PLAYER SETUP ---
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // --- DOOR SETUP ---
        // Main door
        this.door = this.map.createFromObjects("Objects", {
            name: "Door",
            key: "tilemap_sheets",
            frame: 12
        });
        this.door.forEach(door => {
            this.physics.world.enable(door, Phaser.Physics.Arcade.STATIC_BODY);
        });
        this.doorGroup = this.add.group(this.door);

        // Second door (Door1)
        this.door1 = this.map.createFromObjects("Objects", {
            name: "Door1",
            key: "tilemap_sheets",
            frame: 28
        });
        this.door1.forEach(door1 => {
            this.physics.world.enable(door1, Phaser.Physics.Arcade.STATIC_BODY);
        });
        this.door1Group = this.add.group(this.door1);

        // --- DOOR COLLISION HANDLING ---
        this.physics.add.overlap(my.sprite.player, this.doorGroup, () => {
            this.scene.stop("platformerScene");
            this.scene.start("platformer2Scene");
        });
        this.physics.add.overlap(my.sprite.player, this.door1Group, () => {
            this.scene.stop("platformerScene");
            this.scene.start("platformer2Scene");
        });

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

        // --- ENEMY SETUP ---
        // Multiple walking enemies with positions
        this.walkEnemies = [];
        const enemyPositions = [
            { x: 572, y: 210 }, { x: 735, y: 210 }, { x: 1050, y: 210 },
            { x: 1200, y: 150 }, { x: 1550, y: 90 }, { x: 1550, y: 110 },
            { x: 1550, y: 130 }, { x: 1550, y: 150 }, { x: 1550, y: 170 },
            { x: 1550, y: 190 }, { x: 1550, y: 210 }, { x: 1750, y: 90 },
            { x: 1750, y: 110 }, { x: 1750, y: 130 }
        ];
        enemyPositions.forEach(pos => {
            let enemy = this.physics.add.sprite(pos.x, pos.y, 'enemy_walk');
            enemy.setCollideWorldBounds(true);
            enemy.setBounce(1, 0);
            enemy.body.setAllowGravity(false);
            this.physics.add.collider(enemy, this.groundLayer);
            // Collision with player restarts scene and plays hurt sound
            this.physics.add.overlap(my.sprite.player, enemy, () => {
                this.hurtSound.play();
                this.scene.restart();
            }, null, this);
            this.walkEnemies.push(enemy);
        });

        // --- SOUNDS ---
        this.runSound = this.sound.add('run');
        this.jumpSound = this.sound.add('jump');
        this.hurtSound = this.sound.add('hurt');
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
            // Set acceleration to 0 and have DRAG take over
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