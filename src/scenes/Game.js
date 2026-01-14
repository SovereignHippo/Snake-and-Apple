// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

        this.playingField = {width: 40, height: 20};
        this.wallWidth = 30;
        this.fieldStartingPosition = {x: 50, y: 50};
        this.fieldColors = {colorA: 0x303070, colorB: 0x000000, wallColor: 0x808080}
        


        this.appleSize = 30;
        this.isAppleNoMoveBeingPressed = false;
        this.appleMoveDistance = this.appleSize;
        this.appleStartingCords = {x:5, y: 9};
        this.appleCurrentCords;
        this.appleOnMovementCoolDown = false;
        this.appleMovementCoolDown = 60;
        this.appleMovementCoolDownTime = 0;


        this.time;
        
    }

    init() {
        // Initialize scene
    }

    preload() {
        // Load assets
    }

    create() {
        // Create game objects

        //Build the field
            this.field = Array.from({ length: this.playingField.width }, () => new Array(this.playingField.height).fill('0'));

            for(let i = 0; i < this.playingField.width;i++){

                this.add.rectangle(this.fieldStartingPosition.x + (i * this.wallWidth),this.fieldStartingPosition.y,this.wallWidth,this.wallWidth,this.fieldColors.wallColor);
                this.add.rectangle(this.fieldStartingPosition.x + (i * this.wallWidth),this.fieldStartingPosition.y + (this.wallWidth * (this.playingField.height - 1)),this.wallWidth,this.wallWidth,this.fieldColors.wallColor);

                this.field[i][0] = 'w';
                this.field[i][this.playingField.height - 1] = 'w';
                }
            for(let j = 0; j < this.playingField.height; j++){

                this.add.rectangle(this.fieldStartingPosition.x,this.fieldStartingPosition.y  + (j * this.wallWidth),this.wallWidth,this.wallWidth,this.fieldColors.wallColor);
                this.add.rectangle(this.fieldStartingPosition.x + (this.wallWidth * (this.playingField.width - 1)),this.fieldStartingPosition.y + (j * this.wallWidth),this.wallWidth,this.wallWidth,this.fieldColors.wallColor);

                this.field[0][j] = 'w';
                this.field[this.playingField.width - 1][j] = 'w';
                }
            for(let i = 1; i < this.playingField.width - 1; i++){
                for(let j = 1; j < this.playingField.height - 1; j++){
                    let color = this.fieldColors.colorA;
                    if(i%2 == 0){
                        if(j%2 == 0){
                            color = this.fieldColors.colorA;
                        }else{
                            color = this.fieldColors.colorB;
                        }
                    }else{
                        if(j%2 == 0){
                            color = this.fieldColors.colorB;
                        }else{
                            color = this.fieldColors.colorA;
                        }
                    }
                    this.add.rectangle(this.fieldStartingPosition.x + (i * this.wallWidth),this.fieldStartingPosition.y  + (j * this.wallWidth),this.wallWidth,this.wallWidth,color);
                }
            }
        
        
       
        //Create the apple instnace
            this.apple = this.add.rectangle(this.fieldStartingPosition.x + (this.appleStartingCords.x * this.wallWidth),this.fieldStartingPosition.y + (this.appleStartingCords.y * this.wallWidth),this.appleSize,this.appleSize,0xff0000);
            this.field[this.appleStartingCords.x][this.appleStartingCords.y] = 'a';
            this.appleCurrentCords = this.appleStartingCords;

        //Combo manager
            //Sets the combos
                this.input.keyboard.createCombo('WWSSADAD', {resetOnMatch: true, resetOnWrongKey: true});


            //reads the combos
                this.input.keyboard.on('keycombomatch', function (keyCombo) {
                    
                    console.log(keyCombo.keyCodes);
                    
                })

                this.cursors = this.input.keyboard.createCursorKeys();

         
        //Apple input manager
            var up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            var down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            var left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            var right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

            up.on('down', event =>
            {
                this.MoveApple(0,-1);

            });
            down.on('down', event =>
            {
                this.MoveApple(0,1);

            });
            right.on('down', event =>
            {
                this.MoveApple(1,0);

            });
            left.on('down', event =>
            {
                
            this.MoveApple(-1,0);

            });

            let ctr = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
            
            ctr.on('up', event =>
            {
                
                //this checks to make sure its the left ctr key and not the right one
                if(event.location != 1) return;
                this.isAppleNoMoveBeingPressed = false;
                
                //BUG FOUND if the left ctr is being held and the right control is pressed the left control will not unpress

            });
            ctr.on('down', event =>
            {
                
                //this checks to make sure its the left ctr key and not the right one
                if(event.location != 1) return;
                this.isAppleNoMoveBeingPressed = true;
                


            });

       
    }

    

    update(time){
        
        this.time = time;
        
        
            
        
       

    }


    MoveApple(xDirection = 0, yDirection = 0){


        //Sets apple's sprite based on direction

        //Check if control is being held
        if(this.isAppleNoMoveBeingPressed) return;

        //Check if the apple is allowed to move where it want to
        if(this.field[this.appleCurrentCords.x + xDirection][this.appleCurrentCords.y + yDirection] != '0')return;

        //Moves Apple
        if(this.time >= this.appleMovementCoolDownTime + this.appleMovementCoolDown){
            this.apple.destroy();
            this.apple = this.add.rectangle(this.apple.x + (this.appleMoveDistance * xDirection),this.apple.y + (this.appleMoveDistance * yDirection),this.appleSize,this.appleSize,0xff0000);
            this.appleMovementCoolDownTime = this.time;
            this.appleCurrentCords = {x:this.appleCurrentCords.x + xDirection,y: this.appleCurrentCords.y + yDirection};
        }

        
    }




}
