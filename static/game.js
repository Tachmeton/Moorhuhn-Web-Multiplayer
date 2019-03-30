/* eslint-disable no-undef */
/* eslint-disable */
$(document).ready(function() {
    console.log("game.js loaded");

    $("#start").click(startGame);

    const c = document.getElementById("game");

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
    let myChick = 1;
    const xSpeed = 5;
    const ySpeed = 2;
    let pic = new Image();
    let picReverse = new Image();
    pic.src = "img/copyrightChick.png";
    picReverse.src = "img/copyrightChickReverse.png";

    // make socket connection
    const socket = io('http://localhost');

    socket.on('connect', function() {
        console.log("socket connection established");
    });

    socket.on('connect_error', function(message) {
        console.log("error @ establishing socket connection: " + message);
    });

    socket.on('syncChicks', function(syncedChicks) {
        chicks = syncedChicks;
    });

    socket.on('updateChick', function(chicken) {
        chicks[chicken.id] = chicken;
    });

    socket.on('disconnect', function() {
        console.log("socket connection was closed");
    })

    // register keypresses
    document.onkeydown = sendChickControl;

    // register mouse click
    document.getElementById("game").onclick = sendHunterShot;

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
            io.emit('chickInput', {
                id:chicks[myChick].id,
                x:chicks[myChick].x,
                y:chicks[myChick].y,
                direction:direction
            });
        }
    }

    function sendHunterShot(e) {
        e = e || window.event;

        var rect = c.getBoundingClientRect();
        var canvasPosX = event.clientX - rect.left;
        var canvasPosY = event.clientY - rect.top;

        io.emit('hunterShot', {
            x: canvasPosX,
            y: canvasPosY
        });
    }

    function startGame() {
        const ctx = c.getContext("2d");

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
        for(let i = 1; i < chicks.length; i++) {
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
                ctx.drawImage(picReverse, chicks[i].x, chicks[i].y);
            } else {
                ctx.drawImage(pic, chicks[i].x, chicks[i].y);
            }
        }
    }
});
