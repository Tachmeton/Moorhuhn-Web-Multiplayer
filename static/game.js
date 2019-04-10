/* eslint-disable no-undef */
/* eslint-disable */

const TEST_MODE = true;
const COUNTDOWN_TIME = 5;
const REFRESH_RATE = 30;
const xSpeed = 5;
const ySpeed = 2;
const myChick = 1;

const pic = new Image();
const picMe = new Image();
const picReverse = new Image();
const picReverseMe = new Image();
pic.src = "img/copyrightChick.png";
picMe.src = "img/copyrightChickGreen.png";
picReverse.src = "img/copyrightChickReverse.png";
picReverseMe.src = "img/copyrightChickReverseGreen.png";

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
//    document.getElementById("game").onclick = sendHunterShot;
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
        startCountdown(countDownTime);
    });

    socket.on('startingNow', function(chickArray) {
        chicks = chicksArray;
        startGame();
    });

    socket.on('syncChicks', function(syncedChicks) {
        chicks = syncedChicks;
    });

    socket.on('updateChick', function(chicken) {
        chicks[chicken.id] = chicken;
    });

    socket.on('disconnect', function() {
        console.log("socket connection was closed");
    });

 /*   function startCountdown(startingNumber) {
        while(startingNumber >= 0) {
            setTimeout(function() {
                drawText(startingNumber)
            }, startingNumber * 1000);
            --startingNumber;
        }
    }

    function drawText(text) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, c.width/2 ,c.height / 2);
    }*/

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

        socket.emit('hunterShot', {
            x: canvasPosX,
            y: canvasPosY
        });
    }

/*    function startGame() {

        const xMax = c.width;
        const yMax = c.height;

        const refreshRate = 30;

        const gameInterval = setInterval(function(){
            gameLoop(ctx, xMax, yMax);
        }, refreshRate);
    }

    function gameLoop(ctx, xMax, yMax) {
        ctx.clearRect(0,0, xMax, yMax);
        updateDirections(chicks); // uncomment when server is working
        updateChicks(chicks, xMax, yMax);
        drawChicks(ctx, chicks);
    }

    function updateDirections(chicks) {
        for(let i = 0; i < chicks.length; i++) {
            if(i === myChick) {
                continue;
            }

            const random = Math.random();
            if(Math.round(random * 100) % 15 == 1) {
                switch (true) {
                    case (random < 0.25):
                        chicks[i].direction = 'n';
                        break;
                    case (random < 0.5):
                        chicks[i].direction = 'e';
                        break;
                    case (random < 0.75):
                        chicks[i].direction = 's';
                        break;
                    default:
                        chicks[i].direction = 'w';
                }
            }
        }

    }

    function updateChicks(chicks, xMax, yMax) {
        for(let i = 0; i < chicks.length; i++) {
            switch(chicks[i].direction) {
                case 'n':
                    chicks[i].y -= ySpeed;
                    chicks[i].y  = (chicks[i].y  < 0) ? 0: chicks[i].y;
                    break;
                case 'e':
                    chicks[i].x += xSpeed;
                    chicks[i].x = (chicks[i].x > xMax) ? xMax: chicks[i].x;
                  break;
                case 's':
                    chicks[i].y += ySpeed;
                    chicks[i].y = (chicks[i].y > yMax) ? yMax: chicks[i].y;
                    break;
                case 'w':
                    chicks[i].x -= xSpeed;
                    chicks[i].x  = (chicks[i].x  < 0) ? 0: chicks[i].x;
                    break;
                default:
                    alert("one of the chicken has an undefined flying-direction");
            }
        }
    }

    function drawChicks(ctx, chicks){

        for(let i = 0; i < chicks.length; i++) {
            if(chicks[i].direction === 'e') {
                if(i === myChick) {
                    ctx.drawImage(picReverseMe, chicks[i].x, chicks[i].y);
                } else {
                    ctx.drawImage(picReverse, chicks[i].x, chicks[i].y);
                }
            } else {
                if(i === myChick) {
                    ctx.drawImage(picMe, chicks[i].x, chicks[i].y);
                } else {
                    ctx.drawImage(pic, chicks[i].x, chicks[i].y);
                }
            }
        }
    }
}); */});

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
        this.chicks = chicks;
        const gameInterval = setInterval(function(){
            this.gameLoop();
        }, REFRESH_RATE);
    }

    gameLoop() {
        this.ctx.clearRect(0,0, c.width, c.height);
        this.updateDirections(); // uncomment when server is working
        this.updateChicks();
        this.drawChicks();
    }

    updateDirections() {
        for(let i = 0; i < chicks.length; i++) {
            if(i === myChick) {
                continue;
            }

            const random = Math.random();
            if(Math.round(random * 100) % 15 == 1) {
                switch (true) {
                    case (random < 0.25):
                        chicks[i].direction = 'n';
                        break;
                    case (random < 0.5):
                        chicks[i].direction = 'e';
                        break;
                    case (random < 0.75):
                        chicks[i].direction = 's';
                        break;
                    default:
                        chicks[i].direction = 'w';
                }
            }
        }
    }

    updateChicks() {
        for(let i = 0; i < chicks.length; i++) {
            switch(chicks[i].direction) {
                case 'n':
                    chicks[i].y -= ySpeed;
                    chicks[i].y  = (chicks[i].y  < 0) ? 0: chicks[i].y;
                    break;
                case 'e':
                    chicks[i].x += xSpeed;
                    chicks[i].x = (chicks[i].x > c.width) ? c.width: chicks[i].x;
                  break;
                case 's':
                    chicks[i].y += ySpeed;
                    chicks[i].y = (chicks[i].y > c.height) ? c.height: chicks[i].y;
                    break;
                case 'w':
                    chicks[i].x -= xSpeed;
                    chicks[i].x  = (chicks[i].x  < 0) ? 0: chicks[i].x;
                    break;
                default:
                    alert("one of the chicken has an undefined flying-direction");
            }
        }
    }

    drawChicks() {
        for(let i = 0; i < chicks.length; i++) {
            if(chicks[i].direction === 'e') {
                if(i === myChick) {
                    this.ctx.drawImage(picReverseMe, chicks[i].x, chicks[i].y);
                } else {
                    this.ctx.drawImage(picReverse, chicks[i].x, chicks[i].y);
                }
            } else {
                if(i === myChick) {
                    this.ctx.drawImage(picMe, chicks[i].x, chicks[i].y);
                } else {
                    this.ctx.drawImage(pic, chicks[i].x, chicks[i].y);
                }
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
    }
};
