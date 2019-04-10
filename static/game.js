/* eslint-disable no-undef */
/* eslint-disable */

const TEST_MODE = true;
const COUNTDOWN_TIME = 5;
const REFRESH_RATE = 30;
const xSpeed = 5;
const ySpeed = 2;
const myChick = 1;

const picLeft = new Image();
const picLeftMe = new Image();
const picUp = new Image();
const picUpMe = new Image();
const picDown = new Image();
const picDownMe = new Image();
const picRight = new Image();
const picRightMe = new Image();
picLeft.src = "img/copyrightChick.png";
picLeftMe.src = "img/copyrightChickGreen.png";
picUp.src = "img/copyrightChickUp.png";
picUpMe.src = "img/copyrightChickUpMe.png";
picDown.src = "img/copyrightChickDown.png";
picDownMe.src = "img/copyrightChickDownMe.png";
picRight.src = "img/copyrightChickReverse.png";
picRightMe.src = "img/copyrightChickReverseGreen.png";

$(document).ready(function() {
    console.log("game.js loaded");

    const c = document.getElementById("game");
    const game = new Gameboard(c);

    // initialize necessary global variables
    let chicks = [
        {
            x: 140,
            y: 20,
            direction: 's'
        },
        {
            x: 280,
            y:200,
            direction: 'e'
        },
        {
            x:400,
            y:100,
            direction: 'w'
        }
    ];


    // register mouse click
    document.getElementById("game").onclick = sendHunterShot;
    document.getElementById("countdown").onclick = function(){console.log("countdown clicked");game.startCountdown(COUNTDOWN_TIME)};
    document.getElementById("start").onclick = function(){game.startGame(chicks)};


    // register keypresses
    document.onkeydown = sendChickControl;

    // make socket connection
    const socket = io('http://localhost');

    socket.on('connect', function() {
        console.log("socket connection established");
    });

    socket.on('connect_error', function(message) {
        console.log("error @ establishing socket connection: " + message);
    });

    socket.on('startingSoon', function() {
        game.startCountdown(countDownTime);
    });

    socket.on('startingNow', function(chickArray) {
        chicks = chicksArray;
        game.startGame(chicks);
    });

    socket.on('syncChicks', function(syncedChicks) {
        chicks = syncedChicks;
    });

    socket.on('updateChick', function(chicken) {
        chicks[chicken.id] = chicken;
    });

    socket.on('killReviveChick', function(chicken) {
        chicks[chicken.id].alive = chicken.alive;
    });

    socket.on('disconnect', function() {
        console.log("socket connection was closed");
    });

    // functions
    function sendChickControl(e) {
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
        if(chicks[myChick].direction != direction) {
            socket.emit('chickInput', {
                id:chicks[myChick].id,
                x:chicks[myChick].x,
                y:chicks[myChick].y,
                direction:direction
            });
        }

        if(TEST_MODE) {
            chicks[myChick].direction = direction;
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
    }

    startCountdown(i) {
        const thisSave = this;
        this.countdownValue = i;
        while(i >= 0) {
            setTimeout(function() {
                thisSave.drawText(i);
                --thisSave.countdownValue
            }, i * 1000);
            --i;
        }
    }

    drawText(text) {
        this.clearCanvas();
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.countdownValue, this.canvas.width / 2 ,this.canvas.height / 2);
    }

    startGame(chicks) {
        const thisSave = this;
        this.chicks = chicks;
        const gameInterval = setInterval(function(){
            thisSave.gameLoop();
        }, REFRESH_RATE);
    }

    gameLoop() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        this.updateDirections(); // uncomment when server is working
        this.updateChicks();
        this.drawChicks();
    }

    updateDirections() {
        for(let i = 0; i < this.chicks.length; i++) {
            if(i === myChick) {
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
            if(this.chicks[i].direction === 'e') {
                if(i === myChick) {
                    this.ctx.drawImage(picRightMe, this.chicks[i].x, this.chicks[i].y);
                } else {
                    this.ctx.drawImage(picRight, this.chicks[i].x, this.chicks[i].y);
                }
            } else if(this.chicks[i].direction === 'w'){
                if(i === myChick) {
                    this.ctx.drawImage(picLeftMe, this.chicks[i].x, this.chicks[i].y);
                } else {
                    this.ctx.drawImage(picLeft, this.chicks[i].x, this.chicks[i].y);
                }
            }else if(this.chicks[i].direction === 'n'){
                if(i === myChick) {
                    this.ctx.drawImage(picUpMe, this.chicks[i].x, this.chicks[i].y);
                } else {
                    this.ctx.drawImage(picUp, this.chicks[i].x, this.chicks[i].y);
                }
            }else{
                if(i === myChick) {
                    this.ctx.drawImage(picDownMe, this.chicks[i].x, this.chicks[i].y);
                } else {
                    this.ctx.drawImage(picDown, this.chicks[i].x, this.chicks[i].y);
                }
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
    }
};
