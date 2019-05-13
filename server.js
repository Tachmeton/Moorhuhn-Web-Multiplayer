const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('./config');
const cookieParser = require('cookie-parser');

eval(fs.readFileSync('database.js')+'');

Error.stackTraceLimit = Infinity;


const xSpeed = 50;
const ySpeed = 50;
const FeldLaengeX = 15000;
const FeldLaengeY = 10000;

const VIRTUAL_CHICKEN_WIDTH = 0.072;
const VIRTUAL_CHICKEN_HEIGHT = 0.14;

const LIVE_OF_CHICKEN = 5;
const BULLETS = 10;
const TIME_ONE_GAME = 100;

const MAX_PLAYER = 2;

server.listen(3000, function() {
console.log("server now listening on port 3000");
});

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(cookieParser());

let rooms = {};


app.get("/?", function(req, res) {
    if(req.cookies.token) {
        jwt.verify(req.cookies.token, config.secret, function(err, decoded) {
            if(err) {
                console.log("bla");
                res.sendFile(__dirname + "/static/index.html");
            } else {
                console.log("bla");
                res.sendFile(__dirname + "/static/main.html");
            }
        });
    } else {
        console.log("kein token gefunden");
        res.sendFile(__dirname + "/static/index.html");
    }
});


app.get("/main.html", function(req,res) {
    if(req.cookies.token) {
        jwt.verify(req.cookies.token, config.secret, function(err, decoded) {
            if(err) {
                res.sendFile(__dirname + "/static/index.html");
            } else {
                res.sendFile(__dirname + "/static/main.html");
            }
        });
    } else {
        console.log("kein token gefunden");
    }
    res.sendFile(__dirname + "/static/index.html");
});

app.use(express.static("static"));
/**
 *  input:      password and user as JS
ON
 *  res-status: 403 - wrong password or username
 *              200 - authentication successfull
 */
app.post("/checkAuthentication", function(req,res) {
    try{
        login(req.body.user, req.body.password, function(databaseResponse) {
            if(databaseResponse.correctCredentials) {
                console.log("user logged in, jwt will be sent");
                // create jwt with player_id; expires in 14 days (60*60*24*14)
                const token = jwt.sign({"player_id":databaseResponse.player_id}, config.secret,{expiresIn: 1209600});
                res.cookie("token", token, {"httpOnly": true});// ,"secure": "true"});
                res.status(200).send({"auth":true, "token":token});
            } else {
                res.status(409).send({"auth": false});
            }
        });
    } catch(e) {
        console.log("/checkAuthentication: someone sent invalid credentials");
        res.status(400).send({"auth": false});
    }
});

app.post("/registerUser", function(req,res) {
    try{
        registerUser(req.body.user, req.body.password, function(registerSuccessfull) {
            switch(registerSuccessfull) {
                case 0:
                    res.status(200).send("Registration successfull");
                    break;
                case 1:
                    res.status(409).send('{"message":"Username already exists", "rc": 1}');
                    break;
                case 2:
                    res.status(409).send('{"message":"Email already exists", "rc": 2}');
                    break;
                default:
                    res.status(500).send("Internal Problem during Registration");
            }
        });
    } catch(e) {
        console.log("/registerUser: someone send invalid credentials");
        console.log(e);
        res.sendStatus(500);
    }
});

app.post("/createLobby", function(req,res) {
    jwt.verify(req.cookies.token, config.secret, function(err, decoded) {
        if(err) {
            // fehler: ungültiger token/cookie
            console.log("Fehler beim createn der Lobby");
        } else {
            //konnte entschlüsselt werden
            playerId = decoded.player_id;
            console.log("player: " + playerId + " will eine Lobby createn");

            roomnumber = createRoomNumber();

            let hunter = {
                id: playerId,
                socket_id: null,
                joined: false,
                kills: 0,
                bullets: BULLETS,
                maxBullets: BULLETS,
                shots: 0
            };

            let newRoom = {
                id: roomnumber,
                joinedPlayer: 0,
                player: [],
                hunter: hunter,
                updateChicksInterval: null,
                startRoomIntervall: null,
                timeLeft: TIME_ONE_GAME,
                timeLeftInterval: null,
                syncChicksInterval: null
            };

            rooms[roomnumber] = newRoom;

            console.log("player: " + playerId + " has created a lobby");

            res.status(200).send();
        }
    });
});

/**
 * returns array of json objects with attributes:
 *    -creator
 *    -maxPlayers
 *    -joinedPlayers
 *    -id
 */
function getLobbies() {
    lobbyArray = [];


    for(let lobby in rooms){

        let room = {
            creator: rooms[lobby].hunter.id,
            maxPlayers: MAX_PLAYER,
            joinedPlayers: Object.keys(rooms[lobby].player).length + 1,
            id: lobby
        }

        lobbyArray.push(room);
    }

    return lobbyArray;
}


app.get("/getLobbies", function(req,res) {
    if(req.cookies.token) {
        jwt.verify(req.cookies.token, config.secret, function(err, decoded) {
            if(err) {
                res.status(400).send("no token sent");
            } else {
                res.status(200).send(getLobbies());
            }
        });
    } else {
        res.status(400).send("no token sent");
    }
});


app.post("/joinLobby", function(req,res) {
    const lobbyId = req.body.lobbyId;
    if(lobbyId !== null && lobbyId !== undefined) {
        jwt.verify(req.cookies.token, config.secret, function(err, decoded) {
            if(err) {
                // fehler: ungültiger token/cookie
                console.log("Error ungueltiger token/cookie");
            } else {
                //konnte entschlüsselt werden
                playerId = decoded.player_id;
                if(rooms[lobbyId] != null && playerId != null){
                    if(rooms[lobbyId].joinedPlayer < MAX_PLAYER){

                        ++rooms[lobbyId].joinedPlayer;

                        let chicken = {
                            id: playerId,
                            joined: false,
                            x: Math.round(Math.random() * FeldLaengeX),
                            y: Math.round(Math.random() * FeldLaengeY),
                            direction: "w",
                            lives: LIVE_OF_CHICKEN,
                            alive: true
                        };

                        let place = rooms[lobbyId].player.length;
        
                        rooms[lobbyId].player[place] = chicken;

                        console.log("player: " + playerId + " first lobby join worked");
                        
                        //if player does not join -->kick it from lobby
                        setTimeout(function(){
                            if(rooms[lobbyId].player[place].joined === false){
                                delete rooms[lobbyId].player[place];
                                console.log(playerId + " has been removed cause no follow up join");
                            }
                        }, 10000);

                        res.status(200).send();
                    }else{
                        console.log("Lobby is full");
                    }
                }else{
                    console.log("room or playerid are null");
                    console.log(rooms[lobbyId]);
                    console.log(playerId);
                }
            }
        });
    } else {
        // fehler lobby kontte nicht beigetreten werden
        res.status(403).send();
    }

});

io.on('connection', (client) => {

    console.log("New Connection: " + client.id);

    let playerId;
    let joinedLobby = null;
    try{
        const cookies = cookieToJson(client.handshake.headers.cookie);
        if(cookies.token !== null) {
            //Gültigkeit überprüfen:
            jwt.verify(cookies.token, config.secret, function(err, decoded) {
                if(err) {
                    // fehler: ungültiger token/cookie
                    console.log("ein fehler beim entschlüsseln des jwt ist aufgetreten");
                } else {
                    //konnte entschlüsselt werden
                    playerId = decoded.player_id;
                    console.log("player: " + playerId + " hat eine socket connection aufgebaut");
                    let didjoin = false;
                    if(playerId != null){
                        for(let lobby in rooms){
                            if(rooms[lobby].hunter.id === playerId && rooms[lobby].hunter.joined === false){
                                client.join(rooms[lobby].id);
                                console.log(playerId + " joined Lobby on 2nd join!");
                                didjoin = true;
                                joinedLobby = lobby;
                                rooms[lobby].hunter.joined = true;
                                ++rooms[joinedLobby].joinedPlayer;
                            }else{
                                for(let playerkey in rooms[lobby].player){
                                    if(rooms[lobby].player[playerkey].id === playerId && rooms[lobby].player[playerkey].joined === false){
                                        client.join(rooms[lobby].id);
                                        console.log(playerId + " joined Lobby on 2nd join!");
                                        didjoin = true;
                                        joinedLobby = lobby;
                                        rooms[lobby].player[playerkey].socket_id = client.id;
                                        rooms[lobby].player[playerkey].joined = true;
                                    }
                                }
                            }
                        }
                        if(!didjoin){
                            client.emit("Error", "Could not join Lobby");
                            console.log(playerId + " could not join Lobby on 2nd join!");
                            client.disconnect();
                        }else{
                            if(rooms[joinedLobby].joinedPlayer === MAX_PLAYER && allJoined(rooms[joinedLobby]) === true){
                                startGame(joinedLobby);
                            }else{
                                console.log("Do not start Game");
                                console.log(rooms[joinedLobby].joinedPlayer + " === " + MAX_PLAYER);
                                console.log(allJoined(rooms[joinedLobby]));
                            }
                        }
                    }
                }
            });
        } else {
            throw Error("could not parse cookie");
        }
    } catch(e) {
        console.log("socket.io on connection - can not JSON.parse cookie");
        console.log(e);
        client.disconnect();
    }
    console.log("New Connection: " + client.id);






    client.on('disconnect', () => {
        for (let lobby in rooms){
            if(rooms[lobby].hunter.id === playerId){
                client.leave(rooms[lobby].id);
                if(rooms[lobby].syncChicksInterval != null){
                    if(rooms[lobby].player.length > 0){
                        let lastJoined = rooms[lobby].player.length - 1;
    
                        let newHunter = {
                                id: rooms[lobby].player[lastJoined].id,
                                socket_id: rooms[lobby].player[lastJoined].socket_id,
                                joined: rooms[lobby].player[lastJoined].joined,
                                kills: 0,
                                bullets: BULLETS,
                                maxBullets: BULLETS,
                                shots: 0
                        };

                        lobby.hunter = newHunter;
                        delete rooms[lobby].player[lastJoined];
                    }else{
                        delete rooms[lobby];
                    }
                }else{
                    io.to(rooms[lobby].id).emit("Hunter left Midgame");
                }
            }else if(rooms[lobby].joinedPlayer === 1){
                //Nichts
            }else{
                for(let playerkey of rooms[lobby].player){
                    if(rooms[lobby].player[playerkey].id === playerId ){
                        client.leave(rooms[lobby].id);
                        delete player;          //could leave a null object in rooms.player???
                        --rooms[lobby].joinedPlayer;
                    }
                }
            }
        }
    });

    client.on('leaveRoom', (room) => {

        console.log("wants to leave room " +  room);

        if(room != undefined && room != null){

            //whats missing: left of local array...

            client.leave(room);
            console.log("Room " + room + ": " + client.id + " left Room!");
        }
    });

    client.on('chickInput', (direction) => {
        //console.log("Direction: " + direction);

        let room = Object.keys(client.rooms).filter(item => item!=client.id);
        if(room != undefined && room != null){
            if(direction === 'n' || direction === 'e' || direction === 's' || direction === 'w'){
                for(let playerkey in  rooms[room].player){
                    if(rooms[room].player[playerkey].id === client.id){
                        rooms[room].player[playerkey].direction = direction;

                        io.to(room).emit("updateChick", {
                            id: rooms[room].player[playerkey].id,
                            x: rooms[room].player[playerkey].x,
                            y: rooms[room].player[playerkey].y,
                            direction: rooms[room].player[playerkey].direction
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

                    for(let playerkey in rooms[room].player){

                        if(rooms[room].player[playerkey].direction == 'w' || rooms[room].player[playerkey].direction == 'e'){
                            chickenWidth = VIRTUAL_CHICKEN_WIDTH * FeldLaengeX;
                            chickenHeight = VIRTUAL_CHICKEN_HEIGHT * FeldLaengeY;
                        }else{
                            //umgedreht
                            chickenWidth = VIRTUAL_CHICKEN_HEIGHT * FeldLaengeY;
                            chickenHeight = VIRTUAL_CHICKEN_WIDTH * FeldLaengeX;
                        }

                        console.log("Rechnung x: " + coordinates.x + " - " + rooms[room].player[playerkey].x);
                        console.log("Rechnung y: " + coordinates.y + " - " + rooms[room].player[playerkey].y);

                        let xDifference = coordinates.x - rooms[room].player[playerkey].x;
                        let yDifference = coordinates.y - rooms[room].player[playerkey].y;

                        console.log("xDifference: " + xDifference);
                        console.log("yDifference: " + yDifference);

                        if(xDifference > 0 && xDifference < chickenWidth && yDifference > 0 && yDifference < chickenHeight){
                            console.log("Hit on " + rooms[room].player[playerkey].id);
                            io.to(room).emit("killChick", rooms[room].player[playerkey].id);
                            ++rooms[room].hunter.kills;
                            console.log(rooms[room].player[playerkey].id  + " has been shot!");

                            rooms[room].player[playerkey].x = Math.round(Math.random() * FeldLaengeX);
                            rooms[room].player[playerkey].y = Math.round(Math.random() * FeldLaengeY);

                            io.to(room).emit("reviveChick", {
                                id: rooms[room].player[playerkey].id,
                                x: rooms[room].player[playerkey].x,
                                y: rooms[room].player[playerkey].y,
                                direction: rooms[room].player[playerkey].direction,
                                live: rooms[room].player[playerkey].live
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


function startGame(room){
    console.log("Room " + room + ": Starting soon!");
    io.to(room).emit("startingSoon", (5));

    io.to(rooms[room].hunter.socket_id).emit("assignRole", {
        role: 'h',
        bulletsLeft: rooms[room].hunter.bullets
    });

    for(let playerkey in rooms[room].player){
        io.to(rooms[room].player[playerkey].socket_id).emit("assignRole", {
            role: 'c',
            chickenId: rooms[room].player[playerkey].id
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

                //console.log(io.sockets.connected);

                io.sockets.connected[rooms[room].hunter.id].leave(room);

                for(let playerkey in rooms[room].player){
                    io.sockets.connected[rooms[room].player[playerkey].id].leave(room);
                }
                //io.to(room).emit("Plsleave", room);

                //console.log(io.sockets);

                setTimeout(function(){
                    delete rooms[room];
                }, 2000);

            }
        },30);

        rooms[room].syncChicksInterval = setInterval(function(){
            io.to(room).emit("syncChicks", (rooms[room].player));
        },500);

        rooms[room].timeLeftInterval = setInterval(function(){
                --rooms[room].timeLeft;
        },1000);

    }, 5000);
}


function updateChicks(room){
    for(let playerkey in rooms[room].player) {
        switch(rooms[room].player[playerkey].direction) {
            case 'n':
                rooms[room].player[playerkey].y -= ySpeed;
                rooms[room].player[playerkey].y  = (rooms[room].player[playerkey].y  < 0) ? 0: rooms[room].player[playerkey].y;
                break;
            case 'e':
                rooms[room].player[playerkey].x += xSpeed;
                rooms[room].player[playerkey].x = (rooms[room].player[playerkey].x > FeldLaengeX) ?FeldLaengeX: rooms[room].player[playerkey].x;
            break;
            case 's':
                rooms[room].player[playerkey].y += ySpeed;
                rooms[room].player[playerkey].y = (rooms[room].player[playerkey].y > FeldLaengeY) ? FeldLaengeY: rooms[room].player[playerkey].y;
                break;
            case 'w':
                rooms[room].player[playerkey].x -= xSpeed;
                rooms[room].player[playerkey].x  = (rooms[room].player[playerkey].x  < 0) ? 0: rooms[room].player[playerkey].x;
                break;
            default:
                //ERROR
            break;
        }
        //console.log(rooms[room].player[i].x + ", " + rooms[room].player[i].y);
    }
}

function cookieToJson(cookie) {
    const returnJson = {};
    const splitSemicolon = cookie.split(";");

    for(let i = 0; i< splitSemicolon.length; ++i) {
        const splitEquals = splitSemicolon[i].split('=');
        if(splitEquals.length = 2) {
            returnJson[splitEquals[0]] = splitEquals[1];
        } else {
            return {};
        }
    }

    return returnJson;
    
}






//Hilfsfunktionen

function createRoomNumber() {

    let uniqueroomnumber = false;
    while(!uniqueroomnumber){
        roomnumber = Math.round(Math.random() * 10000);

        if(rooms[roomnumber] == undefined){
            uniqueroomnumber = true;
        }
    }
    return roomnumber;
}


function allJoined(lobby){
    let allJoined = true;
    
    if(lobby != null){
        if(lobby.hunter.joined == true){
            for(let player of lobby.player){
                if(player.joined === false){
                    allJoined = false;
                }
            }
        }
    }
    return allJoined;
}







/*
---------------------------------------
    Trash which might be used later
---------------------------------------

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
*/
