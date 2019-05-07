const TEST_MODE = false;
const PLAYER_ROLE = "h";
const MY_CHICKEN_ID = 1;
const TOTAL_LIVES = 5;
const MAX_BULLETS = 10;
const GAME_TIME = 30;
const CROSSHAIRFADE_X_TEST = 80;
const CROSSHAIRFADE_Y_TEST = 150;
const END_SCREEN_MESSAGE = "GAME OVER";

const HEART_SYMBOL = "♥";
const COUNTDOWN_TIME = 5;
const REFRESH_RATE = 30;
const xSpeed = 50;
const ySpeed = 50;

const VIRTUAL_WIDTH  = 15000;
const VIRTUAL_HEIGHT = 10000;
const VIRTUAL_FONT_SIZE = 0.043;
const VIRTUAL_CHICKEN_WIDTH = 0.072;
const VIRTUAL_CHICKEN_HEIGHT = 0.14;
const VIRTUAL_BULLET_WIDTH = 0.02;
const VIRTUAL_BULLET_HEIGHT = 0.071;


const chickenRelativWidth = 0.072;
const chickenRelativHeight = 0.066;

const picLeft = new Image();
const picLeftMe = new Image();
const picUp = new Image();
const picUpMe = new Image();
const picDown = new Image();
const picDownMe = new Image();
const picRight = new Image();
const picRightMe = new Image();
const bullet = new Image();
const crosshair = new Image();

picLeft.src = "img/copyrightChick.png";
picLeftMe.src = "img/copyrightChickGreen.png";
picUp.src = "img/copyrightChickUp.png";
picUpMe.src = "img/copyrightChickUpMe.png";
picDown.src = "img/copyrightChickDown.png";
picDownMe.src = "img/copyrightChickDownMe.png";
picRight.src = "img/copyrightChickReverse.png";
picRightMe.src = "img/copyrightChickReverseGreen.png";
bullet.src = "img/bullet.png";
crosshair.src = "img/crosshair.png";

$(document).ready(function() {
    console.log("game.js loaded");

    const c = document.getElementById("game");
    const game = new Gameboard(c);

    window.onresize = function() {
        game.resized();
    }
/*
    // initialize necessary global variables
    let chicks = [
        {
            x: 140,
            y: 20,
            direction: 's',
            lives:1
        },
        {
            x: 280,
            y:200,
            direction: 'e',
            lives:3
        },
        {
            x:400,
            y:100,
            direction: 'w',
            lives: 5
        }
    ];*/


    // register mouse click
    document.getElementById("game").onclick = sendHunterShot;
    document.getElementById("countdown").onclick = function(){console.log("countdown clicked");game.startCountdown(COUNTDOWN_TIME)};
    document.getElementById("start").onclick = function(){
        game.startGame({
            chicks: chicks,
            timeLeft: GAME_TIME,
            role: PLAYER_ROLE,
            myChickenId: MY_CHICKEN_ID,
            bulletsLeft: MAX_BULLETS
        });
    };
    document.getElementById("crosshairPosition").onclick = function() {
        game.animatedShot.progress = REFRESH_RATE;
        game.animatedShot.x = CROSSHAIRFADE_X_TEST;
        game.animatedShot.y = CROSSHAIRFADE_Y_TEST;
    };
    document.getElementById("brutallyMurdered").onclick = function() {
        chicks[1].alive = false;
    };
    document.getElementById("joinRoom").onclick = function(){
        socket.emit("joinRoom", (1));
    };

    // register keypresses
    document.onkeydown = function(e){
        sendChickControl(e, game);
    };

    const socket = io.connect('https://chlorhuhn.rocks', {"secure":true});

    socket.on('connect', function() {
        console.log("socket connection established");
    });

    socket.on('connect_error', function(message) {
        console.log("error @ establishing socket connection: " + message);
    });

    socket.on('startingSoon', function(countDownTime) {
        game.startCountdown(countDownTime);
    });

    socket.on('assignRole', function(data) {
        game.assignRole(data);
    });

    socket.on('startingNow', function(data) {
//        chicks = data.chicks;

        game.startGame(data);
    });

    //Von Bastian reingefügt kommt später warsch weg
    socket.on('joined', function(){
        let joinButton = document.getElementById('joinRoom');
        joinButton.innerHTML = "join Worked";
    });

    socket.on('syncChicks', function(syncedChicks) {
        game.syncChicks(syncedChicks);
//        chicks = syncedChicks;
    });

    socket.on('updateChick', function(chick) {
        game.updateChick(chick);
//        chicks[chicken.id] = chicken;
    });

    socket.on('killChick', function(id) {
        game.killChick(id);
//        chicks[chicken.id].alive = false;
    });

    socket.on('crosshairPosition', function(data) {
        game.animatedShot.progress = REFRESH_RATE;
        game.animatedShot.x = data.x;
        game.animatedShot.y = data.y;
    });

    socket.on('disconnect', function() {
        console.log("socket connection was closed");
    });

    // functions
    function sendChickControl(e, game) {
        e.preventDefault();

        if(game.role !== 'c') {
            return;
        }

        console.log("button pressed: " + e.keyCode);

        let direction;
        e = e || window.event;
        if (e.keyCode == '38') { // up key
            direction = 'n';
        }
        else if (e.keyCode == '40') { // down key
            direction = 's';
        }
        else if (e.keyCode == '37') { // left key
            direction = 'w';
        }
        else if (e.keyCode == '39') { // right key
            direction = 'e';
        }else {
            return; //other keys ignored
        }

        let myChickIndex;
        for(let i = 0; i< game.chicks.length; i++) {
            if(game.chicks[i].id === game.myChickenId) {
                myChickIndex = i;
            }
        }

        // only emit to server if direction changed
        if(game.chicks[myChickIndex].direction != direction) {
            socket.emit('chickInput', direction);
        }

        if(TEST_MODE) {
            chicks[game.myChickenId].direction = direction;
        }
    }

    function sendHunterShot(e) {
        if(game.myRole === 'c'){
            return;
        }
        e = e || window.event;

        var rect = c.getBoundingClientRect();
        var canvasPosX = event.clientX - rect.left;
        var canvasPosY = event.clientY - rect.top;

        console.log("canvasX: %s;canvasY:%s", canvasPosX, canvasPosY);

        socket.emit('hunterShot', {
            x: canvasPosX,
            y: canvasPosY
        });
    }

});

class Gameboard {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");
        this.resized();
        this.chicks = [];
        this.animatedShot = {
            progress: 0,
            x: 0,
            y: 0
        };
    }

    resized() {
        this.width  = this.canvas.scrollWidth;
        this.height = this.canvas.scrollHeight;
        this.canvas.width  = this.canvas.scrollWidth;
        this.canvas.height = this.canvas.scrollHeight;
    }

    startCountdown(i) {
        const thisSave = this;
        this.countdownValue = i;
        while(i >= 0) {
            setTimeout(function() {
                thisSave.clearCanvas();
                thisSave.drawText(thisSave.countdownValue);
                --thisSave.countdownValue
            }, i * 1000);
            --i;
        }
    }

    drawText(text) {
        if(this.countdownValue >= 0){
            this.ctx.font = Math.round(VIRTUAL_FONT_SIZE * this.canvas.height) + "px Arial";
            this.ctx.fillStyle = "black";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(text, this.canvas.width / 2 ,this.canvas.height / 2);
        }
    }

    assignRole(roleData) {
        this.role = roleData.role;
        if(this.role === 'c') {
            this.myChickenId = roleData.chickenId;
        } else {
            this.bulletsLeft = roleData.bulletsLeft;
        }
    }

    startGame(game) {
        const thisSave = this;
        this.chicks = game.chicks;
        this.timeLeft = game.timeLeft;

        this.gameInterval = setInterval(function(){
            thisSave.gameLoop();
        }, REFRESH_RATE);
        this.timeLeftInterval = setInterval(function(){
            --thisSave.timeLeft;
        }, 1000);
    }

    /******************** */
    joinRoom(){
        //joined Room 1 (wer hätte es gedacht? Ich nicht - Michi)
        socket.emit("joinRoom", "1");
    }

    gameLoop() {
        this.clearCanvas();
        if(this.timeLeft === 0) {
            this.drawText(END_SCREEN_MESSAGE);
            this.drawTimeLeft();
            clearInterval(this.gameInterval);
            clearInterval(this.timeLeftInterval);
            return;
        };

        if(TEST_MODE) {
            this.updateDirections(); // uncomment when server is working
        }
        this.updateChicks();
        this.drawChicks();
        this.drawAnimatedShot();
        this.drawTimeLeft();

        if(this.myRole == "h") {
            this.drawBulletsLeft();
        } else {
            this.drawLives();
        }
//        this.drawLives();
    }

    updateDirections() {
        for(let i = 0; i < this.chicks.length; i++) {
            if(i === this.myChickenId) {
                continue;
            }

            const random = Math.random();
            if(Math.round(random * 100) % 15 == 1) {
                switch (true) {
                    case (random < 0.25):
                        this.chicks[i].direction = 'n';
                        break;
                    case (random < 0.5):
                        this.chicks[i].direction = 'e';
                        break;
                    case (random < 0.75):
                        this.chicks[i].direction = 's';
                        break;
                    default:
                        this.chicks[i].direction = 'w';
                }
            }
        }
    }

    updateChicks() {
        for(let i = 0; i < this.chicks.length; i++) {
            switch(this.chicks[i].direction) {
                case 'n':
                    this.chicks[i].y -= ySpeed;
                    this.chicks[i].y  = (this.chicks[i].y  < 0) ? 0: this.chicks[i].y;
                    break;
                case 'e':
                    this.chicks[i].x += xSpeed;
                    this.chicks[i].x = (this.chicks[i].x > VIRTUAL_WIDTH) ?VIRTUAL_WIDTH: this.chicks[i].x;
                  break;
                case 's':
                    this.chicks[i].y += ySpeed;
                    this.chicks[i].y = (this.chicks[i].y > VIRTUAL_HEIGHT) ? VIRTUAL_HEIGHT: this.chicks[i].y;
                    break;
                case 'w':
                    this.chicks[i].x -= xSpeed;
                    this.chicks[i].x  = (this.chicks[i].x  < 0) ? 0: this.chicks[i].x;
                    break;
                default:
                    alert("one of the chicken has an undefined flying-direction");
            }
        }
    }

    updateChick(chick) {
        for(let i = 0; i < this.chicks.length; i++) {
            if(this.chicks[i].id === chick.id) {
                this.chicks[i].x = chick.x;
                this.chicks[i].y = chick.y;
                this.chicks[i].direction = chick.direction;
            }
        }
    }

    syncChicks(syncedChicks) {
        this.chicks = syncedChicks;
    }

    killChick(id) {
        for(let i = 0; i < this.chicks.length; i++) {
            if(this.chicks[i].id === id) {
                this.chicks[i].alive = false;
            }
        }
    }

    reviveChicken(revivedChicken) {
        for(let i = 0; i < this.chicks.length; i++) {
            if(this.chicks[i].id === revivedChicken.id) {
                this.chicks[i].x = revivedChicken.x;
                this.chicks[i].y = revivedChicken.y;
                this.chicks[i].direction = revivedChicken.direction;
                this.chicks[i].alive = true;
            }
        }
    }

    drawChicks() {
        for(let i = 0; i < this.chicks.length; i++) {
            if(this.chicks[i].alive === false) {
                continue;
            }

            if(this.chicks[i].direction === 'e') {
                if(i === this.myChickenId) {
                    this.ctx.drawImage(picRightMe, this.drawableX(this.chicks[i].x), this.drawableY(this.chicks[i].y), VIRTUAL_CHICKEN_WIDTH * this.canvas.width, VIRTUAL_CHICKEN_HEIGHT * this.canvas.height);
                } else {
                    this.ctx.drawImage(picRight, this.drawableX(this.chicks[i].x), this.drawableY(this.chicks[i].y), VIRTUAL_CHICKEN_WIDTH * this.canvas.width, VIRTUAL_CHICKEN_HEIGHT * this.canvas.height);
                }
            } else if(this.chicks[i].direction === 'w'){
                if(i === this.myChickenId) {
                    this.ctx.drawImage(picLeftMe, this.drawableX(this.chicks[i].x), this.drawableY(this.chicks[i].y), VIRTUAL_CHICKEN_WIDTH * this.canvas.width, VIRTUAL_CHICKEN_HEIGHT * this.canvas.height);
                } else {
                    this.ctx.drawImage(picLeft, this.drawableX(this.chicks[i].x), this.drawableY(this.chicks[i].y), VIRTUAL_CHICKEN_WIDTH * this.canvas.width, VIRTUAL_CHICKEN_HEIGHT * this.canvas.height);
                }
            }else if(this.chicks[i].direction === 'n'){
                if(i === this.myChickenId) {
                    this.ctx.drawImage(picUpMe, this.drawableX(this.chicks[i].x), this.drawableY(this.chicks[i].y), VIRTUAL_CHICKEN_HEIGHT * this.canvas.height, VIRTUAL_CHICKEN_WIDTH * this.canvas.width);
                } else {
                    this.ctx.drawImage(picUp, this.drawableX(this.chicks[i].x), this.drawableY(this.chicks[i].y), VIRTUAL_CHICKEN_HEIGHT * this.canvas.height, VIRTUAL_CHICKEN_WIDTH * this.canvas.width);
                }
            }else{
                if(i === this.myChickenId) {
                    this.ctx.drawImage(picDownMe, this.drawableX(this.chicks[i].x), this.drawableY(this.chicks[i].y),  VIRTUAL_CHICKEN_HEIGHT * this.canvas.height, VIRTUAL_CHICKEN_WIDTH * this.canvas.width);
                } else {
                    this.ctx.drawImage(picDown, this.drawableX(this.chicks[i].x), this.drawableY(this.chicks[i].y), VIRTUAL_CHICKEN_HEIGHT * this.canvas.height, VIRTUAL_CHICKEN_WIDTH * this.canvas.width);
                }
            }
        }
    }

    drawTimeLeft() {
        this.ctx.font = Math.round(VIRTUAL_FONT_SIZE * this.canvas.height) + "px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "right";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(this.timeLeft, this.canvas.width - this.drawableX(10) , this.drawableY(10));
    }

    drawLives() {
        let xPos = VIRTUAL_WIDTH;//this.canvas.width;
        let myChickIndex;

        for(let i = 0; i< this.chicks.length; i++) {
            if(this.chicks[i].id === this.myChickenId) {
                myChickIndex = i;
            }
        }

        if(myChickIndex === null) {
            console.log("error, mychickenid is not found in chicks array");
            return;
        }

        const livesLeft = this.chicks[myChickIndex].lives;
        const livesLost = TOTAL_LIVES - livesLeft;

        this.ctx.font = Math.round(VIRTUAL_FONT_SIZE * this.canvas.height) + "px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "right";
        this.ctx.textBaseline = "bottom";

        const xOffset = this.ctx.measureText(HEART_SYMBOL.repeat(livesLost)).width;

        this.ctx.fillText(HEART_SYMBOL.repeat(livesLost), xPos - this.drawableX(10)  , this.canvas.height);

        this.ctx.fillStyle = "red";
        this.ctx.fillText(HEART_SYMBOL.repeat(livesLeft), xPos - this.drawableX(10) -xOffset  , this.canvas.height);


    }

    drawBulletsLeft() {
        const bulletWidth = VIRTUAL_BULLET_WIDTH * this.canvas.width;
        const bulletHeight = VIRTUAL_BULLET_HEIGHT * this.canvas.height;
        for(let i = 0; i < this.bulletsLeft; ++i) {
            this.ctx.drawImage(bullet, this.canvas.width - bulletWidth - (i*bulletWidth), this.canvas.height - bulletHeight - this.drawableY(10), bulletWidth, bulletHeight);
        }
    }

    drawAnimatedShot() {
        if(this.animatedShot.progress > 0) {
            this.ctx.globalAlpha = this.animatedShot.progress / REFRESH_RATE;
            this.ctx.drawImage(crosshair, this.drawableX(this.animatedShot.x), this.drawableY(this.animatedShot.y));
            this.ctx.globalAlpha = 1;
            --this.animatedShot.progress;
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
    }

    drawableX(virtualX){
        return virtualX * this.canvas.width/VIRTUAL_WIDTH;
    }

    drawableY(virtualY){
        return virtualY * this.canvas.height/VIRTUAL_HEIGHT;
    }
}
