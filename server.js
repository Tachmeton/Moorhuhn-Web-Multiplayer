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

/**
 * returns array of json objects with attributes:
 *    -creator
 *    -maxPlayers
 *    -joinedPlayers
 *    -id
 */
function getLobbies() {
    return [
        {
            creator: "john der 4.",
            maxPlayers: 4,
            joinedPlayers: 2,
            id: 7
        },
        {
            creator: "john der 5.",
            maxPlayers: 4,
            joinedPlayers: 4,
            id: 8
        }
        ,
        {
            creator: "john der 5.",
            maxPlayers: 4,
            joinedPlayers: 4,
            id: 9
        }
    ]
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
    console.log("player wants to join lobby");
    const lobbyId = req.query.lobbyId;
    if(lobbyId !== null) {
        // irgendwie lobby beitrete action @bastian
        res.status(200).send();
    } else {
        // fehler lobby kontte nicht beigetreten werden
        res.status(403).send();
    }

});

io.on('connection', (client) => {
<<<<<<< HEAD
    let playerId;
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
  //socket.emit("connect");
=======
console.log("New Connection: " + client.id);
//socket.emit("connect");

>>>>>>> Bastian

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

    /*let chicken = {
        id: client.id,
        x: Math.round(Math.random() * FeldLaengeX),
        y: Math.round(Math.random() * FeldLaengeY),
        direction: "w",
        lives: 3,
        alive: true,
        role: "c"
    };*/

    let hunter = {
        id: client.id,
        kills: 0,
        bullets: 10,
        maxBullets: 10
    }

    let newRoom = {
        id: room,
        joinedPlayer: 1,
        player: [],
        hunter: hunter,
        updateChicksInterval: null,
        startRoomIntervall: null,
        timeLeft: 1000,
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
            lives: 3,
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
    break

    }

    if(rooms[room].joinedPlayer === 1){
    console.log(room + "zaehler");
    rooms[room].startRoomInterval = setInterval(function(){waitonLobbyFull(room,client)},3000);
    }

}else{
    console.log(client.id + " tried to join Room but it is undefined!");
}

})

client.on('chickInput', (direction) => {
    //console.log("Direction: " + direction);

    if(direction === 'n' || direction === 'e' || direction === 's' || direction === 'w'){

        let room = Object.keys(client.rooms).filter(item => item!=client.id);

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
});

client.on('hunterShot', (coordinates) => {

    let room = Object.keys(client.rooms).filter(item => item!=client.id);
    console.log("room: " + room);
    let chickenWidth = 0;
    let chickenHeight = 0;

    if(client.id === rooms[room].hunter.id){

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
                console.log("Hit on " + rooms[room].chicken[i].id);
                io.to(room).emit("killChick", rooms[room].player[i].id);
                ++roomse[room].hunter.kills;
                console.log(rooms[room].player[i].id  + " has been shot!");

                rooms[room].player[i].x = Math.round(Math.random() * FeldLaengeX);
                rooms[room].player[i].y = Math.round(Math.random() * FeldLaengeY);

                io.to(room).emit("updateChick", {
                    id: rooms[room].player[i].id,
                    x: rooms[room].player[i].x,
                    y: rooms[room].player[i].y,
                    direction: rooms[room].player[i].direction
                });
            }else{
                console.log("No hit!");
            }
        }
    }else{
        console.log(client.id + " wollte sich als Hunter ausgeben ist er aber nicht!");
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

/*rooms.forEach(function(element){
    console.log(element.id + " == " + room);
    console.log(element.id == room);
    if(element.id == room){

    if(element.joinedPlayer >= 2){
        return "Room exists but full";
    }else{
        return "Room exists and space left";
    }

    }else{
    return "first in Room";
    }

});
//Room existiert noch nicht
return "error";*/
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