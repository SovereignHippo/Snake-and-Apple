// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

        this.playingField = {width: 40, height: 20};
        this.wallWidth = 30;
        this.fieldStartingPosition = {x: 60, y:60};
        this.fieldColors = {colorA: 0x303070, colorB: 0x000000, wallColor: 0x808080}
        this.isGameOver;
        this.gameTimer;
        this.gameTimerStartingValue = 30;
        this.gameTimeAddedOnKill = 5;
        this.gameCurrentScore;

        this.scoreMessage = "Score: ";
        this.timeMessage = "Time: ";
        

        this.apple = {
            size: 28,
            isNoMoveBeingPressed: false,
            moveDistance: this.wallWidth,
            startingCords: {x:5, y:9},
            currentCords: {x:5, y:9},
            isOnMovementCoolDown: false,
            movementCoolDown:60,
            movementCoolDownTime:0,
            object: undefined,
            sprites: ['appleUp', 'appleRight', 'appleDown', 'appleLeft'],
            directionOffSet: 0,
            
        };
        
        this.snake = {
            body: [],
            size: 28,
            direction: 'left',
            nextDirection: 'left',
            speed: 100, //Higher number actually means slower snake
            lastMoveTime: 0,
            startingNumberOfSegments: 3,
            startingCords: {x:30, y: 9},
            currentCords: {x:30, y: 9},
            headSprites: ['snakeHeadUp', 'snakeHeadRight', 'snakeHeadDown', 'snakeHeadLeft'],
            tailSprites: ['snakeTailUp','snakeTailRight','snakeTailDown','snakeTailLeft'],
        };


        this.time;
        
    }

    init() {
        // Initialize scene
    }

    preload() {
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
    }

    create() {
        // Create game objects
        this.isGameOver = false;
        this.gameTimer = this.gameTimerStartingValue;

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
            

        //Combo manager
            //Sets the combos
                this.input.keyboard.createCombo('WWSSADAD', {resetOnMatch: true, resetOnWrongKey: true});


            //reads the combos
                this.input.keyboard.on('keycombomatch', function (keyCombo) {
                    
                    console.log(keyCombo.keyCodes);
                    
                })

               

         
        //Apple input manager

            var up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            var down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            var left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            var right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

            up.on('down', event =>
            {
                
                this.MoveApple(0,this.mainApple);

            });
            down.on('down', event =>
            {
                this.MoveApple(2,this.mainApple);

            });
            right.on('down', event =>
            {
                this.MoveApple(1,this.mainApple);

            });
            left.on('down', event =>
            {
                
            this.MoveApple(3,this.mainApple);

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

         

        //Create the timer text
            this.timerText = this.add.text(50, 5, this.timeMessage + Math.ceil(this.gameTimer), {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
        //Create the score text
            this.gameCurrentScore = 0;
            this.scoreText = this.add.text(1100, 5, this.scoreMessage + Math.ceil(this.gameCurrentScore), {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
        //console.log(this.field);
   
    }

    

    update(time, delta){
        
        this.time = time;
        
        
        if (this.cursors.left.isDown && this.snake.direction !== 'right') {
            this.snake.nextDirection = 'left';
        } else if (this.cursors.right.isDown && this.snake.direction !== 'left') {
            this.snake.nextDirection = 'right';
        } else if (this.cursors.up.isDown && this.snake.direction !== 'down') {
            this.snake.nextDirection = 'up';
        } else if (this.cursors.down.isDown && this.snake.direction !== 'up') {
            this.snake.nextDirection = 'down';
        }

        // Move snake at fixed intervals
        if (time >= this.snake.lastMoveTime + this.snake.speed) {
            this.MoveSnake();
            this.snake.lastMoveTime = time;
        }
            
        
        //Update Game Timer
            this.gameTimer -= (delta/1000);   
            if(this.gameTimer < 0) this.gameTimer = 0;
            this.timerText.text = this.timeMessage + Math.ceil(this.gameTimer);
       

    }


    MoveApple(direction, appleRefrence){
        //if(this.isGameOver) return;

        let xDirection = 0;
        let yDirection = 0;

        direction = (direction + appleRefrence.directionOffSet)%4;

        switch(direction){
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

        //Sets apple's sprite based on direction

        //Check if control is being held
        //if(appleRefrence.isNoMoveBeingPressed) return;

        //Check if the apple is allowed to move where it want to
        if(this.field[appleRefrence.currentCords.x + xDirection][appleRefrence.currentCords.y + yDirection] != '0')return;

        //Moves Apple
        if(this.time >= appleRefrence.movementCoolDownTime + appleRefrence.movementCoolDown){
            //Physically move the apple
            appleRefrence.object.destroy();
            this.field[appleRefrence.currentCords.x][appleRefrence.currentCords.y] = "0";

            appleRefrence.object = this.add.sprite(appleRefrence.object.x + (appleRefrence.moveDistance * xDirection),appleRefrence.object.y + (this.apple.moveDistance * yDirection),this.apple.sprites[direction]);
            appleRefrence.currentCords = {x:appleRefrence.currentCords.x + xDirection,y: appleRefrence.currentCords.y + yDirection};
            this.field[appleRefrence.currentCords.x][appleRefrence.currentCords.y] = "a";

           
            
        }

        
    }

    MoveSnake() {
        //if(this.isGameOver) return;
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
                this.mainApple.object.destroy();
                this.RespawnApple();
                //Give more time
                this.gameTimer += this.gameTimeAddedOnKill;
                //Update Score and score text
                this.gameCurrentScore++;
                this.scoreText.text = this.scoreMessage + Math.ceil(this.gameCurrentScore);
                //Need to add logic
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
        if(this.isGameOver) return;
        this.isGameOver = true;
        console.log('Game Over!');
    }




}
