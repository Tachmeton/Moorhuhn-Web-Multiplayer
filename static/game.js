const TEST_MODE = true;
const PLAYER_ROLE = "h";
const MY_CHICKEN_ID = 1;
const TOTAL_LIVES = 5;
const MAX_BULLETS = 10;
const GAME_TIME = 10;
const CROSSHAIRFADE_X_TEST = 80;
const CROSSHAIRFADE_Y_TEST = 150;
const END_SCREEN_MESSAGE = "GAME OVER";

const HEART_SYMBOL = "♥";
const COUNTDOWN_TIME = 5;
const REFRESH_RATE = 30;
const xSpeed = 5;
const ySpeed = 20;

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
    ];


    // register mouse click
    document.getElementById("game").onclick = sendHunterShot;
    document.getElementById("countdown").onclick = function(){console.log("countdown clicked");game.startCountdown(COUNTDOWN_TIME)};
<<<<<<< HEAD
    document.getElementById("start").onclick = function(){game.startGame(chicks)};
    document.getElementById("join Room").onclick = function(){game.joinRoom()};
=======
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

>>>>>>> franz


    // register keypresses
    document.onkeydown = function(e){
        sendChickControl(e, game);
    };

    socket.on('connect', function() {
        console.log("socket connection established");
    });

    socket.on('connect_error', function(message) {
        console.log("error @ establishing socket connection: " + message);
    });

    socket.on('startingSoon', function() {
        game.startCountdown(countDownTime);
    });

    socket.on('startingNow', function(data) {
        chicks = data.chicks;
        game.startGame(data);
    });

    //Von Bastian reingefügt kommt später warsch weg
    socket.on('joined', function(){
        let joinButton = document.getElementById('joinRoom');
        joinButton.innerHTML = "join Worked";
    });

    socket.on('syncChicks', function(syncedChicks) {
        chicks = syncedChicks;
    });

    socket.on('updateChick', function(chicken) {
        chicks[chicken.id] = chicken;
    });

    socket.on('killChick', function(chicken) {
        chicks[chicken.id].alive = false;
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
        }

        // only emit to server if direction changed
        if(chicks[game.myChickenId].direction != direction) {
            socket.emit('chickInput', {
                id:chicks[game.myChickenId].id,
                x:chicks[game.myChickenId].x,
                y:chicks[game.myChickenId].y,
                direction:direction
            });
        }

        if(TEST_MODE) {
            chicks[game.myChickenId].direction = direction;
        }
    }

    function sendHunterShot(e) {
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
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.chicks = [];
        this.animatedShot = {
            progress: 0,
            x: 0,
            y: 0
        }
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
            this.ctx.font = "30px Arial";
            this.ctx.fillStyle = "black";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(text, this.canvas.width / 2 ,this.canvas.height / 2);
        }
    }

    startGame(game) {
        const thisSave = this;
        this.chicks = game.chicks;
        this.timeLeft = game.timeLeft;
        this.myRole = game.role;

        if(this.myRole === "h") {
            $(this.canvas).css("cursor", "url('img/crosshair.png') 25 25 , auto");
            this.bulletsLeft = game.bulletsLeft;
        } else {
            this.myChickenId = game.myChickenId;
        }

        this.gameInterval = setInterval(function(){
            thisSave.gameLoop();
        }, REFRESH_RATE);
        this.timeLeftInterval = setInterval(function(){
            --thisSave.timeLeft;
        }, 1000);
    }

    /******************** */
    joinRoom(){
        //joined Room 1 (wer hätte es gedacht?)
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
        this.updateDirections(); // uncomment when server is working
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
                    this.chicks[i].x = (this.chicks[i].x > this.canvas.width) ?this.canvas.width: this.chicks[i].x;
                  break;
                case 's':
                    this.chicks[i].y += ySpeed;
                    this.chicks[i].y = (this.chicks[i].y > this.canvas.height) ? this.canvas.height: this.chicks[i].y;
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

    drawChicks() {
        for(let i = 0; i < this.chicks.length; i++) {
            if(this.chicks[i].alive === false) {
                continue;
            }
            if(this.chicks[i].direction === 'e') {
                if(i === this.myChickenId) {
                    this.ctx.drawImage(picRightMe, this.chicks[i].x, this.chicks[i].y   );
                } else {
                    this.ctx.drawImage(picRight, this.chicks[i].x, this.chicks[i].y);
                }
            } else if(this.chicks[i].direction === 'w'){
                if(i === this.myChickenId) {
                    this.ctx.drawImage(picLeftMe, this.chicks[i].x, this.chicks[i].y);
                } else {
                    this.ctx.drawImage(picLeft, this.chicks[i].x, this.chicks[i].y);
                }
            }else if(this.chicks[i].direction === 'n'){
                if(i === this.myChickenId) {
                    this.ctx.drawImage(picUpMe, this.chicks[i].x, this.chicks[i].y);
                } else {
                    this.ctx.drawImage(picUp, this.chicks[i].x, this.chicks[i].y);
                }
            }else{
                if(i === this.myChickenId) {
                    this.ctx.drawImage(picDownMe, this.chicks[i].x, this.chicks[i].y);
                } else {
                    this.ctx.drawImage(picDown, this.chicks[i].x, this.chicks[i].y);
                }
            }
        }
    }

    drawTimeLeft() {
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "right";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(this.timeLeft, this.canvas.width - 10 , 10);
    }

    drawLives() {
        let xPos = this.canvas.width;

        const livesLeft = this.chicks[this.myChickenId].lives;
        const livesLost = TOTAL_LIVES - livesLeft;

        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "right";
        this.ctx.textBaseline = "bottom";

        const xOffset = this.ctx.measureText(HEART_SYMBOL.repeat(livesLost)).width;

        this.ctx.fillText(HEART_SYMBOL.repeat(livesLost), xPos - 10  , this.canvas.height);

        this.ctx.fillStyle = "red";
        this.ctx.fillText(HEART_SYMBOL.repeat(livesLeft), xPos - 10 -xOffset  , this.canvas.height);


    }

    drawBulletsLeft() {
        for(let i = 0; i < this.bulletsLeft; ++i) {
            this.ctx.drawImage(bullet, this.canvas.width - bullet.width - (i*bullet.width), this.canvas.height - bullet.height - 10);
        }
    }

    drawAnimatedShot() {
        if(this.animatedShot.progress > 0) {
            this.ctx.globalAlpha = this.animatedShot.progress / REFRESH_RATE;
            this.ctx.drawImage(crosshair, this.animatedShot.x, this.animatedShot.y)
            this.ctx.globalAlpha = 1;
            --this.animatedShot.progress;
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
    }
}
