class MainScreen extends Phaser.Scene {
    constructor() {
        super("MainScreen");
        this.my = { sprite: {} };
        this.bulletActive = false;
        this.keySpace = null;
        this.keyC = null;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("TitleBackground", "TitleBackground.png");
        this.load.image("starfield", "starfield.png");

        // Fonts or bitmap fonts can be loaded here if needed
    }

    create() {
        // Background setup
        this.tileSprite = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'TitleBackground')
            .setOrigin(0, 0)
            .setAlpha(0.8);

        // Fancy text configuration
        let titleText = this.add.text(game.config.width / 2, game.config.height / 2 - 100, '◎ Coin Rush ◎', {
            fontFamily: 'Courier',
            fontSize: '64px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        let promptText = this.add.text(game.config.width / 2, game.config.height / 2 + 60, 'Press SPACE to Start\nPress C for Credits', {
            fontFamily: 'Courier',
            fontSize: '28px',
            color: '#FFD700',
            align: 'center',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Blinking animation for prompt
        this.time.addEvent({
            delay: 500,
            callback: () => {
                promptText.visible = !promptText.visible;
            },
            loop: true
        });

        // Set up input
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    }

    update() {
        // Background scroll effect
        this.tileSprite.tilePositionY += 2;

        // Input check
        if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            this.scene.start('platformerScene'); // Start the platformer scene
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyC)) {
            this.scene.start('Credits');
        }
    }
}
