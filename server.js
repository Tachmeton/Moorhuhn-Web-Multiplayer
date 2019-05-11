const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const xSpeed = 50;
const ySpeed = 50;
const FeldLaengeX = 15000;
const FeldLaengeY = 10000;

const VIRTUAL_CHICKEN_WIDTH = 0.072;
const VIRTUAL_CHICKEN_HEIGHT = 0.14;

const LIVE_OF_CHICKEN = 5;
const BULLETS = 10; 
const TIME_ONE_GAME = 10;

server.listen(3000, function() {
console.log("server now listening on port 3000");
});

app.use(express.static("static"));

let rooms = {};

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on('connection', (client) => {
    console.log("New Connection: " + client.id);

    client.on('event', data => { /* … */ });
    client.on('disconnect', () => { /* … */ });


    client.on('joinRoom', (room) => {
        //gute Eingabe?
        if(room != undefined){

        //Room gibts/ voll?
        let roomthere = roomFull(room);
        console.log(roomthere + "  " + client.id);

        switch(roomthere){
        case "first in Room":

            client.join(room);

            let hunter = {
                id: client.id,
                kills: 0,
                bullets: BULLETS,
                maxBullets: BULLETS,
                shots: 0
            }

            let newRoom = {
                id: room,
                joinedPlayer: 1,
                player: [],
                hunter: hunter,
                updateChicksInterval: null,
                startRoomIntervall: null,
                timeLeft: TIME_ONE_GAME,
                timeLeftInterval: null,
                syncChicksInterval: null
            };

            rooms[room] = newRoom;

            //Success
            console.log(client.id + " joined room" + room);
            //client.emit("joined");
        break;


        case "Room exists and space left":

            client.join(room);

            if(rooms[room] != null){
            rooms[room].joinedPlayer += 1;

            let chicken = {
                id: client.id,
                x: Math.round(Math.random() * FeldLaengeX),
                y: Math.round(Math.random() * FeldLaengeY),
                direction: "w",
                lives: LIVE_OF_CHICKEN,
                alive: true
            };

            rooms[room].player.push(chicken);
            }
            //Success
            console.log(client.id + "joined room" + room);
            //client.emit("joined");
        break;


        case "Room exists but full":

            //Error zurückgeben
            console.log(client.id + " could not join room " + room);
        break;


        default:
            //Error
            console.log("Default Case Join Room");
            console.log(client.id + " could not join room " + room);
        break;
        }

        if(rooms[room].joinedPlayer === 1){
        console.log(room + "zaehler");
        rooms[room].startRoomInterval = setInterval(function(){waitonLobbyFull(room,client)},3000);
        }

    }else{
        console.log(client.id + " tried to join Room but it is undefined!");
    }

    });

    client.on('leaveRoom', (room) => {

        console.log("wants to leave room " +  room);

        if(room != undefined && room != null){

            client.leave(room);
            console.log("Room " + room + ": " + client.id + " left Room!");
        }
    });

    client.on('chickInput', (direction) => {
        //console.log("Direction: " + direction);

        let room = Object.keys(client.rooms).filter(item => item!=client.id);
        if(room != undefined && room != null){
            if(direction === 'n' || direction === 'e' || direction === 's' || direction === 'w'){
                for(let i = 0; i < rooms[room].player.length; ++i){
                    if(rooms[room].player[i].id === client.id){
                        rooms[room].player[i].direction = direction;

                        io.to(room).emit("updateChick", {
                            id: rooms[room].player[i].id,
                            x: rooms[room].player[i].x,
                            y: rooms[room].player[i].y,
                            direction: rooms[room].player[i].direction
                        });
                    }
                }
            }else{
                console.log("Client: " + client.id + "mit falscher Direction: " + direction);
            }
        }
    });

    client.on('hunterShot', (coordinates) => {

        let room = Object.keys(client.rooms).filter(item => item!=client.id);
        
        if(room != undefined && room != null){
            console.log("room: " + room);
            let chickenWidth = 0;
            let chickenHeight = 0;

            if(client.id === rooms[room].hunter.id){

                if(rooms[room].hunter.bullets > 0){

                    --rooms[room].hunter.bullets;

                    for(let i = 0; i < rooms[room].player.length; ++i){

                        if(rooms[room].player[i].direction == 'w' || rooms[room].player[i].direction == 'e'){
                            chickenWidth = VIRTUAL_CHICKEN_WIDTH * FeldLaengeX;
                            chickenHeight = VIRTUAL_CHICKEN_HEIGHT * FeldLaengeY;
                        }else{
                            //umgedreht
                            chickenWidth = VIRTUAL_CHICKEN_HEIGHT * FeldLaengeY;
                            chickenHeight = VIRTUAL_CHICKEN_WIDTH * FeldLaengeX;
                        }

                        console.log("Rechnung x: " + coordinates.x + " - " + rooms[room].player[i].x);
                        console.log("Rechnung y: " + coordinates.y + " - " + rooms[room].player[i].y);

                        let xDifference = coordinates.x - rooms[room].player[i].x;
                        let yDifference = coordinates.y - rooms[room].player[i].y;

                        console.log("xDifference: " + xDifference);
                        console.log("yDifference: " + yDifference);

                        if(xDifference > 0 && xDifference < chickenWidth && yDifference > 0 && yDifference < chickenHeight){
                            console.log("Hit on " + rooms[room].player[i].id);
                            io.to(room).emit("killChick", rooms[room].player[i].id);
                            ++rooms[room].hunter.kills;
                            console.log(rooms[room].player[i].id  + " has been shot!");

                            rooms[room].player[i].x = Math.round(Math.random() * FeldLaengeX);
                            rooms[room].player[i].y = Math.round(Math.random() * FeldLaengeY);

                            io.to(room).emit("reviveChick", {
                                id: rooms[room].player[i].id,
                                x: rooms[room].player[i].x,
                                y: rooms[room].player[i].y,
                                direction: rooms[room].player[i].direction,
                                live: rooms[room].player[i].live
                            });
                        }else{
                            console.log("No hit!");
                        }
                    }
                }
            }else{
                console.log(client.id + " wollte sich als Hunter ausgeben ist er aber nicht!");
            }
        }

    });

});



function roomFull(room){

    let roomState = 0;
    //0 ist kein Room, 1 room noch free aber nicht erster, 2 room full

    if(rooms[room] != null){
        console.log("joined Player: " + rooms[room].joinedPlayer);
        if(rooms[room].joinedPlayer < 2){
            roomState = 1;
        }else{
            roomState = 2;
        }
    }

    console.log("roomState: " + roomState);

    switch(roomState){
        case 0:
        return "first in Room";
        break;

        case 1:
        return "Room exists and space left";
        break;

        case 2:
        return "Room exists but full";
        break;

        default:
        return "error --default";
        break;
    }
}


function waitonLobbyFull(room, client){
    console.log(room + " is waiting!");
    if(rooms[room] != null && rooms[room].joinedPlayer == 2){
        startGame(room, client);
        clearInterval(rooms[room].startRoomInterval);
    }
}




function startGame(room,client){
    console.log("Room " + room + ": Starting soon!");
    io.to(room).emit("startingSoon", (5));

    io.to(rooms[room].hunter.id).emit("assignRole", {
        role: 'h',
        bulletsLeft: rooms[room].hunter.bullets
    });

    for(let i = 0; i < rooms[room].player.length; ++i){

        io.to(rooms[room].player[i].id).emit("assignRole", {
            role: 'c',
            chickenId: rooms[room].player[i].id
        });
    }

        setTimeout(function(){
            io.to(room).emit("startingNow", {
            chicks: rooms[room].player,
            timeLeft: rooms[room].timeLeft
        });


        rooms[room].updateChicksInterval = setInterval(function(){
        if(rooms[room].timeLeft > 0){
            updateChicks(room);
        }else{
            clearInterval(rooms[room].timeLeftInterval);
            clearInterval(rooms[room].updateChicksInterval);
            clearInterval(rooms[room].syncChicksInterval);

            console.log("Room: " + room + " Game is over!");

            console.log(io.sockets.connected);

            io.sockets.connected[rooms[room].hunter.id].leave(room);

            for(let i = 0; i < rooms[room].player.length; i++){
                io.sockets.connected[rooms[room].player[i].id].leave(room);
            }
            //io.to(room).emit("Plsleave", room);

            console.log(io.sockets);

            setTimeout(function(){
                delete rooms[room];
            }, 2000);
            
        }
    },30);

        rooms[room].syncChicksInterval = setInterval(function(){
            client.to(room).emit("syncChicks", (rooms[room].player));
        },500);

    rooms[room].timeLeftInterval = setInterval(function(){
            --rooms[room].timeLeft;
    },1000);

    }, 5000);
}


function updateChicks(room){
    for(let i = 0; i < rooms[room].player.length; i++) {
        switch(rooms[room].player[i].direction) {
            case 'n':
                rooms[room].player[i].y -= ySpeed;
                rooms[room].player[i].y  = (rooms[room].player[i].y  < 0) ? 0: rooms[room].player[i].y;
                break;
            case 'e':
                rooms[room].player[i].x += xSpeed;
                rooms[room].player[i].x = (rooms[room].player[i].x > FeldLaengeX) ?FeldLaengeX: rooms[room].player[i].x;
            break;
            case 's':
                rooms[room].player[i].y += ySpeed;
                rooms[room].player[i].y = (rooms[room].player[i].y > FeldLaengeY) ? FeldLaengeY: rooms[room].player[i].y;
                break;
            case 'w':
                rooms[room].player[i].x -= xSpeed;
                rooms[room].player[i].x  = (rooms[room].player[i].x  < 0) ? 0: rooms[room].player[i].x;
                break;
            default:
                //ERROR
            break;
        }
        //console.log(rooms[room].player[i].x + ", " + rooms[room].player[i].y);
    }
}
