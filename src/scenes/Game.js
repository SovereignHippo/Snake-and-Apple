// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

        this.playingField = {width: 40, height: 20};
        this.wallWidth = 30;
        this.fieldStartingPosition = {x: 60, y:60};
        this.fieldColors = {colorA: 0x303070, colorB: 0x000000, wallColor: 0x808080}
        this.isGameOver;
        

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
        };
        
        this.snake = {
            body: [],
            size: 28,
            direction: 'left',
            nextDirection: 'left',
            speed: 150, //Higher number actually means slower snake
            lastMoveTime: 0,
            startingNumberOfSegments: 3,
            startingCords: {x:30, y: 9},
            currentCords: {x:30, y: 9},
        };


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
        this.isGameOver = false;

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
            this.apple.object = this.add.rectangle(this.fieldStartingPosition.x + (this.apple.startingCords.x * this.wallWidth),this.fieldStartingPosition.y + (this.apple.startingCords.y * this.wallWidth),this.apple.size,this.apple.size,0xff0000);
            this.field[this.apple.startingCords.x][this.apple.startingCords.y] = 'a';
            this.apple.currentCords = this.apple.startingCords;

        //Create the snake instnace
            this.snake.body = [];
            

            for(let i = 0; i < this.snake.startingNumberOfSegments; i++){
                const segment = this.add.rectangle(this.fieldStartingPosition.x + (this.snake.startingCords.x * this.wallWidth) + (i * this.wallWidth),this.fieldStartingPosition.y + (this.snake.startingCords.y * this.wallWidth),this.snake.size,this.snake.size,0x0000ff);
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

         
        //console.log(this.field);
   
    }

    

    update(time){
        
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
            
        
       

    }


    MoveApple(xDirection = 0, yDirection = 0){


        //Sets apple's sprite based on direction

        //Check if control is being held
        if(this.apple.isNoMoveBeingPressed) return;

        //Check if the apple is allowed to move where it want to
        if(this.field[this.apple.currentCords.x + xDirection][this.apple.currentCords.y + yDirection] != '0')return;

        //Moves Apple
        if(this.time >= this.apple.movementCoolDownTime + this.apple.movementCoolDown){
            //Physically move the apple
            this.apple.object.destroy();
            this.field[this.apple.currentCords.x][this.apple.currentCords.y] = "0";

            this.apple.object = this.add.rectangle(this.apple.object.x + (this.apple.moveDistance * xDirection),this.apple.object.y + (this.apple.moveDistance * yDirection),this.apple.size,this.apple.size,0xff0000);
            this.apple.movementCoolDownTime = this.time;
            this.apple.currentCords = {x:this.apple.currentCords.x + xDirection,y: this.apple.currentCords.y + yDirection};
            this.field[this.apple.currentCords.x][this.apple.currentCords.y] = "a";

           
            
        }

        
    }

    MoveSnake() {
         // Update current direction
        this.snake.direction = this.snake.nextDirection;

        // Calculate new head position
        const head = this.snake.body[0].object;
        let newX = head.x;
        let newY = head.y;

        let newCordX = this.snake.body[0].currentCords.x;
        let newCordY = this.snake.body[0].currentCords.y;


        switch (this.snake.direction) {
            case 'left':
                newX -= this.wallWidth;
                newCordX -= 1;
                break;
            case 'right':
                newX += this.wallWidth;
                newCordX += 1;
                break;
            case 'up':
                newY -= this.wallWidth;
                newCordY -= 1;
                break;
            case 'down':
                newY += this.wallWidth;
                newCordY += 1;
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
            const newHead = this.add.rectangle(newX,newY,this.snake.size,this.snake.size,0x0000ff);
            const newHeadObject = {
                currentCords: {x:newCordX, y: newCordY},
                object: newHead,
            }
            this.field[newHeadObject.currentCords.x][newHeadObject.currentCords.y] = 's';
            this.snake.body.unshift(newHeadObject);
            

            //check as to weather or not it needs to grow
            if(!isEating){
                //Remove tail if not eating
                const tail = this.snake.body.pop();
                this.field[tail.currentCords.x][tail.currentCords.y] = '0';
                tail.object.destroy();
            }else{
                //Apple has been eaten
                this.apple.object.destroy();
                this.RespawnApple();
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
        this.apple.currentCords = {x: x, y: y};
        this.apple.object = this.add.rectangle(this.fieldStartingPosition.x + (x * this.wallWidth), this.fieldStartingPosition.y + (y * this.wallWidth),this.apple.size,this.apple.size,0xff0000);

    }

    GameOver(){
        if(this.isGameOver) return;
        this.isGameOver = true;
        console.log('Game Over!');
    }




}
