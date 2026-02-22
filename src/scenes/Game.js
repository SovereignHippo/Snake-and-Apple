// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Game extends Phaser.Scene {
    
    constructor() {
        super('Game');
        
        this.isDebugingOn = true;

        this.playingField = {width: 18, height: 18};
        this.wallWidth = 32; //AKA the grid cell size
        this.fieldStartingPosition;
        this.fieldColors = {colorA: 0x303070, colorB: 0x000000, wallColor: 0x808080}
        this.isGameOver;
        this.gameTimer;
        this.gameTimerStartingValue = 30;
        this.gameTimeAddedOnKill = 3;
        this.gameCurrentScore;
        this.idMakerCount;
        this.isPaused;
        this.isAppleReadyUp;
        this.isSnakeReadyUp;

        //this.scoreMessage = "Score: ";
        this.timeMessage = "Time: ";

        this.inputLog = [];
        this.apples = [];

        this.apple = {
            id: "-1",
            size: 28, //outdate, no longer used
            isNoMoveBeingPressed: false,
            moveDistance: this.wallWidth,
            startingCords: {x:2, y:9},
            currentCords: {x:2, y:9},
            isOnMovementCoolDown: false,
            movementCoolDown:0,
            movementCoolDownTime:0,
            object: undefined,
            sprites: ['appleUp', 'appleRight', 'appleDown', 'appleLeft'],
            directionOffSet: 0,
            parent: undefined,
            children: [],
            isVisible: true,
            canMove: true,
            makeParentInvisible: false,
            makesParentInmovable: false,
            makesParentMagiclyInept: false,
            isFragile: false,
            isReadyToBeDeleted: false,
            canPerformMagic: true,
            deathSound: "smokePoofSound",
            deathEffect: "whisp",
            checkVisibility: function(scene){
                
                for(let child of this.children){
                    if(child.makeParentInvisible){
                        return;
                    }
                }
                if(!this.isVisible && this.object?.active == false){
                    this.object = scene.add.sprite(scene.fieldStartingPosition.x + (this.currentCords.x * scene.wallWidth),scene.fieldStartingPosition.y + (this.currentCords.y * scene.wallWidth),this.sprites[2]);
                }
                this.isVisible = true;
            },
            checkMovability: function(){
                for(let child of this.children){
                    if(child.makesParentInmovable){
                        return;
                    }
                }
                
                this.canMove = true;
            },
            checkMagicalAbility: function(){
                for(let child of this.children){
                    if(child.makesParentMagiclyInept){
                        return;
                    }
                }
                
                this.canPerformMagic = true;
            },

            
        };
        
        this.snake = {
            body: [],
            size: 28, //outdate, no longer used
            direction: 'left',
            nextDirection: 'left',
            speed: 100, //Higher number actually means slower snake
            lastMoveTime: 0,
            startingNumberOfSegments: 5,
            startingCords: {x:12, y: 9},
            currentCords: {x:12, y: 9},
            headSprites: ['snakeHeadUp', 'snakeHeadRight', 'snakeHeadDown', 'snakeHeadLeft'],
            tailSprites: ['snakeTailUp','snakeTailRight','snakeTailDown','snakeTailLeft'],
        };

        


        this.time;
        
    }

    init() {
        // Initialize scene
           
           
        
    }

    preload() {
        //Plugins
        
        // Load assets
        this.load.image('appleUp', 'assets/appleSprites/apple0.png');
        this.load.image('appleRight', 'assets/appleSprites/apple1.png');
        this.load.image('appleLeft', 'assets/appleSprites/apple3.png');
        this.load.image('appleDown', 'assets/appleSprites/apple2.png');

        this.load.image('snakeHeadUp','assets/snakeSprites/head0.png');
        this.load.image('snakeHeadRight','assets/snakeSprites/head1.png');
        this.load.image('snakeHeadLeft','assets/snakeSprites/head3.png');
        this.load.image('snakeHeadDown','assets/snakeSprites/head2.png');

        this.load.image('snakeBodyUpDown','assets/snakeSprites/snake02.png');
        this.load.image('snakeBodyUpRight','assets/snakeSprites/snake01.png');
        this.load.image('snakeBodyUpLeft','assets/snakeSprites/snake30.png');
        this.load.image('snakeBodyLeftRight','assets/snakeSprites/snake31.png');
        this.load.image('snakeBodyDownLeft','assets/snakeSprites/snake32.png');
        this.load.image('snakeBodyDownRight','assets/snakeSprites/snake21.png');

        this.load.image('snakeTailUp','assets/snakeSprites/tail0.png');
        this.load.image('snakeTailRight','assets/snakeSprites/tail1.png');
        this.load.image('snakeTailLeft','assets/snakeSprites/tail3.png');
        this.load.image('snakeTailDown','assets/snakeSprites/tail2.png');

        this.load.audio('smokePoofSound','assets/sounds/NarutoSmokeSound.mp3');
        this.load.audio('appleCrunchSound','assets/sounds/AppleCrunchSound.wav');

        this.load.image('smoke','assets/particles/whitePuff.png');
        this.load.image('whisp','assets/particles/blackSmoke.png')
    }

    create() {
        // Create game objects
         this.isGameOver = false;
         this.gameTimer = this.gameTimerStartingValue;
            this.inputLog = [];
            this.time = 0;
            this.idMakerCount = 1;
            this.fieldStartingPosition = {
                x: (this.sys.canvas.width * .5) - (this.wallWidth * this.playingField.width * .5),
                y: (this.sys.canvas.height * .5) - (this.wallWidth * this.playingField.height * .5)
            };
            this.isPaused = true;
            this.gameCurrentScore = 0;

            this.isAppleReadyUp = false;
            this.isSnakeReadyUp = false;

            
        

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
            this.mainApple = Object.create(this.apple);
            this.mainApple.object = this.add.sprite(this.fieldStartingPosition.x + (this.mainApple.startingCords.x * this.wallWidth),this.fieldStartingPosition.y + (this.mainApple.startingCords.y * this.wallWidth),'appleDown');
            this.field[this.mainApple.startingCords.x][this.mainApple.startingCords.y] = 'a';
            this.mainApple.currentCords = this.mainApple.startingCords;
            this.mainApple.id = 'a';
            this.mainApple.Kill = function(){
                for(let item of this.children){
                    item.Kill();
                }
            }
            this.apples = [this.mainApple];
            

        //Create the snake instnace
            this.snake.body = [];
            

            for(let i = 0; i < this.snake.startingNumberOfSegments; i++){
                let segment;
                const x = this.fieldStartingPosition.x + (this.snake.startingCords.x * this.wallWidth) + (i * this.wallWidth);
                const y = this.fieldStartingPosition.y + (this.snake.startingCords.y * this.wallWidth);
                if(i == 0){
                    segment = this.add.sprite(x, y, 'snakeHeadLeft');
                }else if(i == this.snake.startingNumberOfSegments - 1){
                    segment = this.add.sprite(x, y, 'snakeTailLeft');
                }else{
                    segment = this.add.sprite(x, y, 'snakeBodyLeftRight');
                }
                
                const bodyPart = {
                    currentCords: {x:this.snake.startingCords.x + i, y: this.snake.startingCords.y},
                    object: segment,
                }
                this.field[bodyPart.currentCords.x][bodyPart.currentCords.y] = 's';
                this.snake.body.push(bodyPart);
            }
            

               

         
        //Apple input manager

            var up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            var down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            var left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            var right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

            up.on('down', event =>
            {
                //Cleans up the apples array destroying any that need it
                //this.DestroyApplesWhoNeedIt();

                
                
                //Check for pause
                if(this.isPaused) return;

                if(!this.ComboManager(0)){
                    for(let apple of this.apples){
                        this.MoveApple(0,apple);
                    }
                    
                }
                
                

            });
            down.on('down', event =>
            {
                //Cleans up the apples array destroying any that need it
                //this.DestroyApplesWhoNeedIt();

                //Check for pause
                if(this.isPaused) return;
                
                if(!this.ComboManager(2)){
                    for(let apple of this.apples){
                        this.MoveApple(2,apple);
                    }
                }
            });
            right.on('down', event =>
            {
                //Cleans up the apples array destroying any that need it
                //this.DestroyApplesWhoNeedIt();

                //Ready up the apple
                    if(!this.isAppleReadyUp){
                        this.isAppleReadyUp = true;
                        this.appleReadyText?.destroy();
                        this.appleReadyStatusText.text = "Ready";
                        this.appleReadyStatusText.setColor('#00ff00');
                        
                        //Set up ready message

                        if(this.isSnakeReadyUp){
                            this.isPaused = false;
                            this.appleReadyStatusText?.destroy();
                            this.snakeReadyStatusText?.destroy();
                        }
                    }

                //Check for pause
                    if(this.isPaused) return;
                
                if(!this.ComboManager(1)){
                    for(let apple of this.apples){
                        this.MoveApple(1,apple);
                    }
                }

            });
            left.on('down', event =>
            {
                //Cleans up the apples array destroying any that need it
                //this.DestroyApplesWhoNeedIt();

                //Check for pause
                if(this.isPaused) return;
                
                if(!this.ComboManager(3)){
                        for(let apple of this.apples){
                            this.MoveApple(3,apple);
                    }
                    }

            });

            let ctr = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
            
            ctr.on('up', event =>
            {
                
                //this checks to make sure its the left ctr key and not the right one
                if(event.location != 1) return;
                this.apple.isNoMoveBeingPressed = false;
                
                //BUG FOUND if the left ctr is being held and the right control is pressed the left control will not unpress

            });
            ctr.on('down', event =>
            {
                
                //this checks to make sure its the left ctr key and not the right one
                if(event.location != 1) return;
                this.apple.isNoMoveBeingPressed = true;
                


            });

        //Sanke input manager
         this.cursors = this.input.keyboard.createCursorKeys();
         var leftArrow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);

        //On Left arrow click
         leftArrow.on('down', event =>
         {
            //Ready up the snake
                    if(!this.isSnakeReadyUp){
                        this.isSnakeReadyUp = true;
                        this.snakeReadyText?.destroy();
                        this.snakeReadyStatusText.text = "Ready";
                        this.snakeReadyStatusText.setColor('#00ff00');
                        
                        //Set up ready message

                        if(this.isAppleReadyUp){
                            this.isPaused = false;
                            this.snakeReadyStatusText?.destroy();
                            this.appleReadyStatusText?.destroy();
                        }
                    }
         });

        //Create all the texts
            //Create the timer text
                this.timerText = this.add.text(50, 5, this.timeMessage + Math.ceil(this.gameTimer), {
                fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
                stroke: '#000000', strokeThickness: 8,
                align: 'center'
            })
            // //Create the score text
            //     this.scoreText = this.add.text(1100, 5, this.scoreMessage + Math.ceil(this.gameCurrentScore), {
            //     fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            //     stroke: '#000000', strokeThickness: 8,
            //     align: 'center'
            // })
            //Create the Apple Ready Up text
                this.appleReadyText = this.add.text(40, this.sys.canvas.height * .5 - 40, "Press \'D\' to ready up", {
                fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff',
                stroke: '#000000', strokeThickness: 8,
                align: 'center'
                })
                this.appleReadyStatusText = this.add.text(40, this.sys.canvas.height * .5 - 20, "Not Ready", {
                    fontFamily: 'Arial Black', fontSize: 20, color: '#ff0000',
                    stroke: '#000000', strokeThickness: 8,
                    align: 'center'
                })
            //Create the Snake Ready Up text
                this.snakeReadyText = this.add.text(925, this.sys.canvas.height * .5 - 40, "Press \'Left Arrow\' to ready up", {
                    fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff',
                    stroke: '#000000', strokeThickness: 8,
                    align: 'center'
                })
                this.snakeReadyStatusText = this.add.text(925, this.sys.canvas.height * .5 - 20, "Not Ready", {
                    fontFamily: 'Arial Black', fontSize: 20, color: '#ff0000',
                    stroke: '#000000', strokeThickness: 8,
                    align: 'center'
                })
            //create the debugger text
            if(this.isDebugingOn){
                this.debugText = this.add.rexBBCodeText(this.sys.canvas.width * .8, this.sys.canvas.height * .1, "Debugging [color=green]ON[/color]", {
                    fontFamily: 'Arial Black', fontSize: 20, color: '#00ffff',
                    stroke: '#000000', strokeThickness: 8,
                    align: 'left'
                })
            }
                

        //console.log(this.field);
   
    }

    

    update(time, delta){
        
        
        //Past this point will not update while paused
        if(this.isPaused) return;
        
        this.time = this.time + delta;
        
        
        

        // Move snake at fixed intervals
        if (time >= this.snake.lastMoveTime + this.snake.speed) {

            if (this.cursors.left.isDown && this.snake.direction !== 'right') {
                this.snake.nextDirection = 'left';
            } else if (this.cursors.right.isDown && this.snake.direction !== 'left') {
                this.snake.nextDirection = 'right';
            } else if (this.cursors.up.isDown && this.snake.direction !== 'down') {
                this.snake.nextDirection = 'up';
            } else if (this.cursors.down.isDown && this.snake.direction !== 'up') {
                this.snake.nextDirection = 'down';
            }

            this.MoveSnake();
            this.snake.lastMoveTime = time;
        }
            
        
        //Update Game Timer
            this.gameTimer -= (delta/1000);   
            if(this.gameTimer < 0) this.gameTimer = 0;
            this.timerText.text = this.timeMessage + Math.ceil(this.gameTimer);
       


        //Update the debugger text
        if(this.isDebugingOn){
            let fps = 1/(delta / 1000).toFixed(2);

            let fpsColor = "#00FF00";

            if(fps < 30){
                fpsColor = "#FFFF00";
            }else if(fps < 15){
                fpsColor = "#FF0000";
            }

            this.debugText.text = 
            `Time: [color=#00FF00]${(time/1000).toFixed(2)}s[/color]\nDelta: [color=${fpsColor}]${delta.toFixed(2)}ms[/color]\nFPS: [color=${fpsColor}]${fps}[/color]`;
        }
       
    }


    MoveApple(direction, appleRefrence, numberOfSpacesToMove = 1, ctrOveride = false){
        if(this.isGameOver) return;

        //Check if the apple is allowed to move
        if(!appleRefrence.canMove) return;

        let xDirection = 0;
        let yDirection = 0;

        direction = (direction + appleRefrence.directionOffSet)%4;

        switch(direction){
            case 0:
                yDirection = -numberOfSpacesToMove;
                break;
            case 1:
                xDirection = numberOfSpacesToMove;
                break;
            case 2:
                yDirection = numberOfSpacesToMove;
                break;
            case 3:
                xDirection = -numberOfSpacesToMove;
                break;
        }

        //Sets apple's sprite based on direction

        //Check if control is being held
        if(!ctrOveride){
            if(appleRefrence.isNoMoveBeingPressed) return;
        }

        let tagOfTargetSpot = this.field[appleRefrence.currentCords.x + xDirection][appleRefrence.currentCords.y + yDirection];

        //Check if the apple is allowed to move where it want to
        if(tagOfTargetSpot != '0'){
            
            //Kills the thing this apple collides with if fragile
            //let collision = this.GetAppleWithId(this.field[appleRefrence.currentCords.x + xDirection][appleRefrence.currentCords.y + yDirection]);
            let collision = this.GetAppleWithId(tagOfTargetSpot);
            if(collision?.isFragile && collision?.isVisible){
                collision.Kill();
            }

            //If the apple if fragile then it will die if it tries to run another into another apple as long as that apple is visible
            if(appleRefrence.isFragile && !(tagOfTargetSpot == 'w' || tagOfTargetSpot == 's') && collision?.isVisible){
                
                appleRefrence.Kill();
                
            }
            console.log(`Id: ${appleRefrence.id} - isFragile: ${appleRefrence.isFragile} - target spot: ${!(tagOfTargetSpot == 'w' || tagOfTargetSpot == 's')} - col vis: ${collision?.isVisible}`)
            

            return;
            

        };
        
        

        
        //Moves Apple
        if(this.time >= appleRefrence.movementCoolDownTime + appleRefrence.movementCoolDown){
            appleRefrence.movementCoolDownTime = this.time;
            //Physically move the apple if visable
            appleRefrence.object?.destroy();
            if(appleRefrence.isVisible && !appleRefrence.isReadyToBeDeleted){
                appleRefrence.object = this.add.sprite(appleRefrence.object.x + (appleRefrence.moveDistance * xDirection),appleRefrence.object.y + (this.apple.moveDistance * yDirection),this.apple.sprites[direction]);
            }
            

            this.field[appleRefrence.currentCords.x][appleRefrence.currentCords.y] = "0";
            appleRefrence.currentCords = {x:appleRefrence.currentCords.x + xDirection,y: appleRefrence.currentCords.y + yDirection};
            this.field[appleRefrence.currentCords.x][appleRefrence.currentCords.y] = appleRefrence.id;

           
            
        }

        
    }

    MoveSnake() {
        if(this.isGameOver) return;

        //run game tick update
           this.GameTickUpdate();

        // Update current direction
            this.snake.direction = this.snake.nextDirection;

        // Calculate new head position
        const head = this.snake.body[0].object;
        let newX = head.x;
        let newY = head.y;

        let newCordX = this.snake.body[0].currentCords.x;
        let newCordY = this.snake.body[0].currentCords.y;

        let direction;


        switch (this.snake.direction) {
            case 'left':
                newX -= this.wallWidth;
                newCordX -= 1;
                direction = 3;
                break;
            case 'right':
                newX += this.wallWidth;
                newCordX += 1;
                direction = 1;
                break;
            case 'up':
                newY -= this.wallWidth;
                newCordY -= 1;
                direction = 0;
                break;
            case 'down':
                newY += this.wallWidth;
                newCordY += 1;
                direction = 2;
                break;
        }


        //Check for collision
             let isEating = false;
            switch(this.field[newCordX][newCordY]){
                case 'a':
                    isEating = true;
                break;
                case 'w':
                   this.GameOver();
                    return;
                case 's':
                    this.GameOver();
                    return;
                case '0':
                    break;
                default:
                    this.GetAppleWithId(this.field[newCordX][newCordY]).Kill();
            }

        //Move snake 
            //by making a new head
            const newHead = this.add.sprite(newX,newY,this.snake.headSprites[direction]);
            const newHeadObject = {
                currentCords: {x:newCordX, y: newCordY},
                object: newHead,
            }
            this.field[newHeadObject.currentCords.x][newHeadObject.currentCords.y] = 's';
            this.snake.body.unshift(newHeadObject);

            //update the old head's sprite
                const thirdSnakeBodyPart = this.snake.body[2];
                const snakeNeck = this.snake.body[1];

                const x = this.fieldStartingPosition.x + (this.snake.body[1].currentCords.x * this.wallWidth);
                const y = this.fieldStartingPosition.y + (this.snake.body[1].currentCords.y * this.wallWidth);

                
                let newSprite;

                if((snakeNeck.currentCords.x > thirdSnakeBodyPart.currentCords.x || snakeNeck.currentCords.x > newHeadObject.currentCords.x) && (snakeNeck.currentCords.x < thirdSnakeBodyPart.currentCords.x || snakeNeck.currentCords.x < newHeadObject.currentCords.x)){
                    
                    newSprite = 'snakeBodyLeftRight';
                }else if((snakeNeck.currentCords.y > thirdSnakeBodyPart.currentCords.y || snakeNeck.currentCords.y > newHeadObject.currentCords.y) && (snakeNeck.currentCords.y < thirdSnakeBodyPart.currentCords.y || snakeNeck.currentCords.y < newHeadObject.currentCords.y)){
                    newSprite = 'snakeBodyUpDown';
                }else if((snakeNeck.currentCords.y > thirdSnakeBodyPart.currentCords.y || snakeNeck.currentCords.y > newHeadObject.currentCords.y) && (snakeNeck.currentCords.x > thirdSnakeBodyPart.currentCords.x || snakeNeck.currentCords.x > newHeadObject.currentCords.x)){
                    newSprite = 'snakeBodyUpLeft';
                }else if((snakeNeck.currentCords.y > thirdSnakeBodyPart.currentCords.y || snakeNeck.currentCords.y > newHeadObject.currentCords.y) && (snakeNeck.currentCords.x < thirdSnakeBodyPart.currentCords.x || snakeNeck.currentCords.x < newHeadObject.currentCords.x)){
                    newSprite = 'snakeBodyUpRight';
                }else if((snakeNeck.currentCords.y < thirdSnakeBodyPart.currentCords.y || snakeNeck.currentCords.y < newHeadObject.currentCords.y) && (snakeNeck.currentCords.x < thirdSnakeBodyPart.currentCords.x || snakeNeck.currentCords.x < newHeadObject.currentCords.x)){
                    newSprite = 'snakeBodyDownRight';
                }else{
                    newSprite = 'snakeBodyDownLeft';
                }
                this.snake.body[1].object.destroy();
                this.snake.body[1].object = this.add.sprite(x, y, newSprite);
            

            //check as to weather or not it needs to grow
            if(!isEating){
                //Remove tail if not eating
                const tail = this.snake.body.pop();
                this.field[tail.currentCords.x][tail.currentCords.y] = '0';
                tail.object.destroy();

                //update new tail
                const tailToBe = this.snake.body[this.snake.body.length - 1];
                const lastPartOfSnakeThatIsntTail = this.snake.body[this.snake.body.length - 2];
                let tailDirection;
                if(lastPartOfSnakeThatIsntTail.currentCords.x > tailToBe.currentCords.x){
                    tailDirection = 1;
                }else if(lastPartOfSnakeThatIsntTail.currentCords.x < tailToBe.currentCords.x){
                    tailDirection = 3;
                }else if(lastPartOfSnakeThatIsntTail.currentCords.y < tailToBe.currentCords.y){
                    tailDirection = 0;
                }else{
                    tailDirection = 2;
                }
                let newTailX = this.fieldStartingPosition.x + (this.snake.body[this.snake.body.length - 1].currentCords.x * this.wallWidth);
                let newTailY = this.fieldStartingPosition.y + (this.snake.body[this.snake.body.length - 1].currentCords.y * this.wallWidth);
                this.snake.body[this.snake.body.length - 1].object.destroy();
                this.snake.body[this.snake.body.length - 1].object = this.add.sprite(newTailX, newTailY, this.snake.tailSprites[tailDirection]);
            }else{
                //Apple has been eaten
                this.EatMainApple();
                
            }
        
    }

    RespawnApple(){
        const x = Math.floor(Math.random() * (this.playingField.width - 2));
        const y = Math.floor(Math.random() * (this.playingField.height - 2));

        if(this.field[x][y] != '0'){
            this.RespawnApple();
            return;
        }

        this.field[x][y] = 'a';
        this.mainApple.currentCords = {x: x, y: y};
        this.mainApple.object = this.add.sprite(this.fieldStartingPosition.x + (x * this.wallWidth), this.fieldStartingPosition.y + (y * this.wallWidth),this.apple.sprites[2]);

    }

    GameOver(){
        if(this.isDebugingOn) return;
        if(this.isGameOver) return;
        this.isGameOver = true;
        console.log('Game Over!');
        this.scene.start("GameOver",{score: this.gameCurrentScore});
    }
        

    ComboManager(direction){
        //Manges the combo both input and and doing actions
        //returns true if this function handles movement, false if it does not

        const inputLogMaxLength = 20;
        const currentAppleList = this.apples.slice();

        

        switch(direction){
            case 0:
                this.inputLog.push('W');
                break;
            case 1:
                this.inputLog.push('D');
                break;
            case 2:
                this.inputLog.push('S');
                break;
            case 3:
                this.inputLog.push('A');
                break;
        }
            //UseFull for lots of functions
            
                

        // keep the array length below the maxium
        while(this.inputLog.length > inputLogMaxLength){
            this.inputLog.shift();
        }

        //Clone Jitsu
            if(this.inputLog.slice(-9,-1).join("") == "WWSSADAD"){

            
                for(let apple of currentAppleList){
                    if(!apple.canPerformMagic || !apple.canMove){
                        this.MoveApple(direction,apple);
                        continue;
                    };

                    let relativeDirection = (direction + apple.directionOffSet)%4;
                    let xDirection = 0;
                    let yDirection = 0;

                    switch(relativeDirection){
                        case 0:
                            yDirection = -1;
                            break;
                        case 1:
                            xDirection = 1;
                            break;
                        case 2:
                            yDirection = 1;
                            break;
                        case 3:
                            xDirection = -1;
                            break;
                    }

                    if(this.field[apple.currentCords.x + xDirection][apple.currentCords.y + yDirection] != '0') {
                        this.MoveApple(direction,apple);
                        continue;
                    };

                    function killFunctionForShawdowClone(){
                        for(let child of this.children){
                            
                            child.Kill();
                        }

                        this.object?.destroy();

                        
                        
                        for(let i = 0; i < this.parent.children.length; i++ ){
                            if(this.parent.children[i].id == apple.id){
                                this.parent.children.splice(i,1);
                                break;
                            }
                        }

                        
                        //Makes it ready to be deleted next iteration
                        this.isReadyToBeDeleted = true;
                        
                    }

                    //Play the sound
                        this.sound.play("smokePoofSound" ,{
                            volume: 1,
                        });

                    //Smoke bomb effect
                        this.CreateSmokeEffect(apple.currentCords.x,apple.currentCords.y);

                    if(relativeDirection != '0' && this.field[apple.currentCords.x][apple.currentCords.y - 1] == '0'){
                        this.SummonNewApple(apple.currentCords.x,apple.currentCords.y - 1,killFunctionForShawdowClone,apple,(4 - direction)%4,true,true,true,true,0);
                    }
                    if(relativeDirection != '1' && this.field[apple.currentCords.x + 1][apple.currentCords.y] == '0'){
                        this.SummonNewApple(apple.currentCords.x + 1,apple.currentCords.y,killFunctionForShawdowClone,apple,(5 - direction)%4,true,true,true,true,1);
                    }
                    if(relativeDirection != '2' && this.field[apple.currentCords.x][apple.currentCords.y + 1] == '0'){
                        this.SummonNewApple(apple.currentCords.x,apple.currentCords.y + 1,killFunctionForShawdowClone,apple,(6 - direction)%4,true,true,true,true,2);
                    }
                    if(relativeDirection != '3' && this.field[apple.currentCords.x - 1][apple.currentCords.y] == '0'){
                        this.SummonNewApple(apple.currentCords.x - 1,apple.currentCords.y,killFunctionForShawdowClone,apple,(7 - direction)%4,true,true,true,true,3);
                    }

                    this.MoveApple(direction,apple);

                    
                }
                return true;
                
            }
                
        //Teleport Dash
            if(this.inputLog.slice(-6,-2).join("") == "WASD" || this.inputLog.slice(-6,-2).join("") == "WDSA"){
                
                for(let apple of currentAppleList){
                    
                    if(!apple.canPerformMagic || !apple.canMove){ //Check if they can perform magic or not
                        this.MoveApple(direction,apple);
                        continue;
                    };

                    //if the last two inputs are equal, do the teleport dash else move normally
                    if(this.inputLog.at(-2) === this.inputLog.at(-1)){
                       
                        //Play the sound
                        this.sound.play("smokePoofSound" ,{
                            volume: .25,
                        });

                        //Smoke bomb effect
                        this.CreateSmokeEffect(apple.currentCords.x,apple.currentCords.y,.25);

                        this.MoveApple(direction,apple,2);

                    }else{
                        this.MoveApple(direction,apple);
                    }

                }
                return true;//return true because this combo handles the movement
            }
        
        //Astral Projection
            if(this.inputLog.slice(-7,-1).join("") == "SSADWW" ){

                for(let apple of currentAppleList){
                    
                    if(!apple.canPerformMagic || !apple.canMove){ //Check if they can perform magic or not
                        this.MoveApple(direction,apple);
                        continue;
                    };

                    var xDirecton = 0;
                    var yDirection = 0;
                    var newDirection = (direction + apple.directionOffSet)%4;
                    switch(newDirection){
                        case 0:
                            yDirection = -1;
                            break;
                        case 1:
                            xDirecton = 1;
                            break;
                        case 2:
                            yDirection = 1;
                            break;
                        case 3: 
                            xDirecton = -1;
                            break;
                    }

                    //Check to be sure the spawn spot is valid
                    if(this.field[apple.currentCords.x + xDirecton][apple.currentCords.y + yDirection] != "0") continue;

                    apple.isVisible = false;
                    apple.object?.destroy();
                    apple.canMove = false;

                    function porjectionKillFunction(){
                        //Projection Kill Function
                        for(let i = 0; i < this.children.length; i++ ){

                            this.children[i].Kill();
            
                        }
                        

                        this.object?.destroy();
                        
                        
                        for(let i = 0; i < this.parent.children.length; i++ ){
                            if(this.parent.children[i].id == this.id){
                                this.parent.children.splice(i,1);
                                break;
                            }
                        }

                      
                        //Makes it ready to be deleted next iteration
                        this.isReadyToBeDeleted = true;
                    }

                    this.SummonNewApple(apple.currentCords.x + xDirecton,apple.currentCords.y + yDirection,porjectionKillFunction,
                    apple,apple.directionOffSet,true,true,apple.isFragile,true,newDirection,true,true)

                }

                return true;

            }
        
        
        return false;

    }

    DestroyApplesWhoNeedIt(){
        for(let i = this.apples.length - 1; i > 0; i--){
            if(this.apples[i].isReadyToBeDeleted){
                switch(this.field[this.apples[i].currentCords.x][this.apples[i].currentCords.y]){
                    case 's':
                    case 'w':
                        break;
                    default:
                        this.field[this.apples[i].currentCords.x][this.apples[i].currentCords.y] = '0';
                }
                //create a whisp effect
                    this.CreateWhispEffect(this.apples[i].currentCords.x,this.apples[i].currentCords.y,this.apples[i].deathEffect,this.apples[i].deathSound);
                    
                this.apples.splice(i,1);
            }
        }
    }

    GetAppleWithId(id){
        for(let element of this.apples){
            if(element.id == id){
                return element;
            }
        }
    }

    GetANewId(){
        this.idMakerCount++;
        return this.idMakerCount.toString();
    }

    SummonNewApple(xCordinante, yCordinante,killFunction,parentApple,offSetValue = 0,visibility = true,movability = true,fragility = false,isMagical = true,sprite = 2,makesParentInvisible = false,makesParentUnmovable = false){
        let newApple = Object.create(this.apple);
        newApple.currentCords = {x:xCordinante,y:yCordinante};
            if(visibility){
                newApple.object = this.add.sprite(this.fieldStartingPosition.x + (newApple.currentCords.x * this.wallWidth),this.fieldStartingPosition.y + (newApple.currentCords.y * this.wallWidth),newApple.sprites[sprite]);
             }
            newApple.id = this.GetANewId();
            this.field[newApple.currentCords.x][newApple.currentCords.y] = newApple.id;
            newApple.Kill = killFunction;
            newApple.isVisible = visibility;
            newApple.canMove = movability;
            newApple.parent = parentApple;
            newApple.directionOffSet = offSetValue;
            newApple.isFragile = fragility;
            newApple.canPerformMagic = isMagical;
            newApple.makeParentInvisible = makesParentInvisible;
            newApple.makesParentInmovable = makesParentUnmovable;
            
            parentApple.children.push(newApple);
            newApple.children = [];
            this.apples.push(newApple);
            
            
                    
    }

    CreateSmokeEffect(xCord, yCord, maxSize = .5){
        let emitter = this.add.particles(this.fieldStartingPosition.x + (xCord * this.wallWidth),this.fieldStartingPosition.y + (yCord * this.wallWidth),'smoke', {
            speed: 2,
            lifespan: 400,
            quantity: 1,
            scale: {start: .1, end: maxSize,ease: 'Expo.easeOut'},
            emitting: true,
            duration: 100,
            alpha: {start: 1, end: 0,ease: 'Expo.easeIn'},
            particleBringToTop: true,
            maxParticles: 4,
        });

        emitter.setDepth(1);
    }

    CreateWhispEffect(xCord, yCord,effect,sound){
        let emitter = this.add.particles(this.fieldStartingPosition.x + (xCord * this.wallWidth),this.fieldStartingPosition.y + (yCord * this.wallWidth),effect,
        {
            speed: 2,
            lifespan: 400,
            quantity: 1,
            scale: {start: .1, end: .2,ease: 'Expo.easeOut'},
            emitting: true,
            duration: 100,
            alpha: {start: 1, end: 0,ease: 'Expo.easeIn'},
            particleBringToTop: true,
            maxParticles: 4,
        });

        emitter.setDepth(1);

        //Play the sound 
            this.sound.play(sound ,{
                volume: .4,
                delay: Math.random() * .3,
            });
    }

    EatMainApple(){
        this.mainApple.object.destroy();
        this.mainApple.Kill();
        this.inputLog = [];
        this.RespawnApple();
        //Give more time
        this.gameTimer += this.gameTimeAddedOnKill;
        //Update Score and score text
        this.gameCurrentScore++;
        //this.scoreText.text = this.scoreMessage + Math.ceil(this.gameCurrentScore);
        //Need to add logic // I dont rember what logic he is talking about

        //Play the sound 
            this.sound.play("appleCrunchSound" ,{
                volume: .4,
                detune: (Math.random() * 20) + 40,
                rate: (Math.random() * .3) + .9,
            });
    }

    CheckEachApplesAbilites(){
        for(let i = this.apples.length - 1; i >= 0; i--){
            this.apples[i].checkVisibility(this);
            this.apples[i].checkMovability();
            this.apples[i].checkMagicalAbility();
        }
    }

    GameTickUpdate(){//Runs evertime the snake moves

        this.DestroyApplesWhoNeedIt();

        this.CheckEachApplesAbilites();

    }


}
