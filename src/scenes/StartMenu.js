export class StartMenu extends Phaser.Scene {

    constructor ()
    {
        super('StartMenu');

    }

    preload ()
    {
        
    }

    init(){

       

    }

    create ()
    {
        //Create the score text
            
            this.scoreText = this.add.rexBBCodeText(this.sys.canvas.width * .28, this.sys.canvas.height * .3 ,"Snake & Apple", {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center',
            
        })

        //Replay Button
            this.replayButton = this.add.rexBBCodeText(this.sys.canvas.width * .4 , this.sys.canvas.height * .6, "Begin", {
            fontFamily: 'Arial Black', fontSize: 42, color: '#ff0000',
            stroke: '#000000', strokeThickness: 8,
            align: 'center',
            backgroundColor: "#ffffff",
            backgroundCornerRadius: 10,
            padding: {
                left: 10,
                right: 10,
                top: 5,
                bottom: 5,
            },
           
        })
        this.replayButton.setInteractive();

        //When replay button is clicked
        this.replayButton.on('pointerdown', () => { 


            this.scene.start('Game');


        });

        //When replay button is hovered
        this.replayButton.on('pointerover', () => { 
            

            this.replayButton.setColor("#00ff00");


        }); 
        //When replay button is no longer hovered over
        this.replayButton.on('pointerout', () => { 
            

            this.replayButton.setColor("#ff0000");


        }); 

    }

}