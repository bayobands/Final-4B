class GameEnd extends Phaser.Scene {
    constructor() {
        super("GameEndscene");
    

        this.my = {sprite: {}};   
        

        this.keyEnter =null;
    }
   

        create() {
            // Add background image, centered and covering the whole screen
            this.add.image(game.config.width / 2, game.config.height / 2, "TitleBackgrounds")
                .setOrigin(0.5)
                .setDisplaySize(game.config.width, game.config.height);

            let menuConfig = {
                fontFamily: 'Courier',
                fontSize: '28px',
                backgroundColor: '#F3B141',
                color: '#843605',
                align: 'right',
                padding: {
                    top: 5,
                    bottom: 5,
                },
                fixedWidth: 0
            };

            this.add.text(game.config.width/2, game.config.height/2 - borderUISize - borderPadding, 'You Win', menuConfig).setOrigin(0.5);
            menuConfig.backgroundColor = '#00FF00';
            menuConfig.color = '#000';
            this.add.text(game.config.width/2, game.config.height/2 + borderUISize + borderPadding, 'Press Enter to play again', menuConfig).setOrigin(0.5);

            this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        }
      
        update() {
            if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
                this.scene.start('MainScreen'); // Restart the platformer scene
            }
            
              

        }
    }