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
            
            this.titleText = this.add.rexBBCodeText(this.sys.canvas.width * .5, this.sys.canvas.height * .3 ,"Snake & Apple", {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center',
            
            })
            this.titleText.setOrigin(.5);
        

        //Replay Button
            this.beginButton = this.add.rexBBCodeText(this.sys.canvas.width * .5 , this.sys.canvas.height * .6, "Begin", {
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
            this.beginButton.setInteractive();
            this.beginButton.setOrigin(.5);

        //When replay button is clicked
        this.beginButton.on('pointerdown', () => { 


            this.scene.start('Game');


        });

        //When replay button is hovered
        this.beginButton.on('pointerover', () => { 
            

            this.beginButton.setColor("#00ff00");


        }); 
        //When replay button is no longer hovered over
        this.beginButton.on('pointerout', () => { 
            

            this.beginButton.setColor("#ff0000");


        }); 

    }

}