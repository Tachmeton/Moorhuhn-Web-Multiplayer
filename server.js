const express = require("express");

const app = express();

app.use(express.static("static"));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

let lobbyPlayer = 0;

let rooms = [];

var chicks = [];

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.listen(3000);


io.on('connection', client => {
  console.log("New Connection" + client.id);
  socket.emit("connect")


  client.on('event', data => { /* … */ });
  client.on('disconnect', () => { /* … */ });


  client.on('joinRoom', room => {
    
    //Room gibts/ voll?
    let roomthere = roomFull(room);
    switch(roomthere){
    case "first Room":
      socket.join(room);

      let chicken = {
        id: socket.id,
        x: Math.round(Math.random() * 16000),
        y: Math.round(Math.random() * 9000),
        direction: "w"
      };

      let room = {
        id: room,
        joinedPlayer: 1,
        player: [chicken]
      };

      rooms.push(room);
      
      //Success
      console.log(socket.id + "joined room" + room);
      socket.emit("joined");
      break;

      case "Room exists and space left":

      socket.join(room);

      //rooms durchgehen joinedPlayer erhöhen
      rooms.forEach(function(element){
        if(element.id == room){
          element.joinedPlayer += 1;

          let chicken = {
            id: socket.id,
            x: Math.round(Math.random() * 16000),
            y: Math.round(Math.random() * 9000),
            direction: "w"
          };

          element.player.push(chicken);
        }
      });
      //Success
      console.log(socket.id + "joined room" + room);
      socket.emit("joined");
      break;

      case "Room exists but full":

      //Error zurückgeben
      console.log(socket.id + "could not join room" + room);
      break;

      default:
      //Error
      console.log(socket.id + "could not join room" + room);
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

    setIntervall(updateChicks(room),1000);
}


function updateChicks(room){
  
}