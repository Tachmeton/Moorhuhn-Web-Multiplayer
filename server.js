const express = require("express");

const app = express();

app.use(express.static("static"));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

let lobbyPlayer = 0;

let rooms = []

var chicks = [];

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.listen(3000);


io.on('connection', client => {
  console.log("New Connection" + client.id);


  client.on('event', data => { /* … */ });
  client.on('disconnect', () => { /* … */ });


  client.on('joinRoom', room => {
    
    //Room gibts/ voll?
    let roomthere = roomFull(room);
    switch(roomthere){
    case "first Room":
      socket.join(room);

      let room = {
        id: room,
        joinedPlayer: 1
      };

      rooms.push(room);
      //Success
      break;

      case "Room exists and space left":

      socket.join(room);

      //rooms durchgehen joinedPlayer erhöhen
      rooms.forEach(function(element){
        if(element.id == room){
          element.joinedPlayer += 1;      //funktioniert das?
        }
      });
      //Success
      break;

      case "Room exists but full":

      //Error zurückgeben

      break;

      default:
      //Error
      break

    }


    
    

    if(!lobbyZaehlerStartet){
      setIntervall(waitonLobbyFull(room),3000);
      lobbyZaehlerStartet = true;
    }
    lobbyPlayer +=1;

  })
});

//https://socket.io/docs/rooms-and-namespaces/

function roomFull(){
  return false;
}


function waitonLobbyFull(room){
  if(lobbyPlayer == 2){
    startGame(room);
  }
}




function startGame(room){
  socket.on(room).emit("startingSoon");
    setTimeout(function(){
      io.on(room).emit("startingNow");     //Standardwerte von chicks vereinbaren
    }, 5000);

    updateChicks(room);
}


function updateChicks(room){
  
}