class Credits extends Phaser.Scene {
    constructor() {
        super("Credits");
        this.my = {sprite: {}};   
        

        this.keyEnter =null;
    }
   

        create() {
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
            }
this.add.image(game.config.width / 2, game.config.height / 2, "starfieldC")            // Initialize key variables
            this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        }
      
        update() {
            if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
                this.scene.start('MainScreen');
            }
        }
    }