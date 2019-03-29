/* eslint-disable no-undef */
/* eslint-disable */
$(document).ready(function() {
    console.log("game.js loaded");

    $("#start").click(startGame);

    const chicks = [
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

    const xSpeed = 5;
    const ySpeed = 2;

    let pic = new Image();
    let picReverse = new Image();
    pic.src = "img/copyrightChick.png";
    picReverse.src = "img/copyrightChickReverse.png";

    function startGame() {
        const c = document.getElementById("game");
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
        updateDirections(chicks);
        updateChicks(chicks, xMax, yMax);
        drawChicks(ctx, chicks);


        /*x += xSpeed;
        y += ySpeed;

        x = (x < 0) ? 0: x;
        x = (x > xMax) ? xMax: x;

        y = (y < 0) ? 0: y;
        y = (y > yMax) ? yMax: y;

        if(xSpeed >= 0) {
            ctx.drawImage(picReverse, x, y);
        } else {
            ctx.drawImage(pic, x, y);
        }*/
    }

    function updateDirections(chicks) {

        for(let i = 0; i < chicks.length; i++) {
            const random = Math.random();
            if(Math.round(random * 100) % 15 == 1) {
                switch (true) {
                    case (random < 0.25):
                        chicks[i].direction = 'n';
                        console.log("i now goes north");
                        break;
                    case (random < 0.5):
                        chicks[i].direction = 'e';
                        console.log("i now goes east");
                        break;
                    case (random < 0.75):
                        chicks[i].direction = 's';
                        console.log("i now goes south");
                        break;
                    default:
                        chicks[i].direction = 'w';
                        console.log("i now goes west");
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
                    chicks[i].x = (chicks[i].x > yMax) ? yMax: chicks[i].x;
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
            if(chicks[i].xSpeed >= 0) {
                ctx.drawImage(picReverse, chicks[i].x, chicks[i].y);
            } else {
                ctx.drawImage(pic, chicks[i].x, chicks[i].y);
            }
        }
    }
});
