export class GameOver extends Phaser.Scene {

    constructor ()
    {
        super('GameOver');

        this.finalScore;
        

    }

    preload ()
    {
        //this.load.image('logo', 'assets/phaser.png');
    }

    init(data){

        this.finalScore = data.score;

    }

    create ()
    {
        //Create the score text
            let scoreMessage = "Final Score: "; 
            this.scoreText = this.add.text(this.sys.canvas.width * .5  - 200 , this.sys.canvas.height * .5 - 50, scoreMessage + Math.ceil(this.finalScore), {
            fontFamily: 'Arial Black', fontSize: 42, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })

        //Replay Button
            this.replayButton = this.add.text(this.sys.canvas.width * .5  - 200 , this.sys.canvas.height * .5 + 50, "Play Again", {
            fontFamily: 'Arial Black', fontSize: 42, color: '#ff0000',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
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