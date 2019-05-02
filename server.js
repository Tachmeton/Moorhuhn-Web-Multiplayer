const express = require('express');
const app = express();
const socket = require('socket.io');
const server = app.listen(3000, function() {
  console.log("server now listening on port 3000");
});
const io = require('socket.io')(server);

app.use(express.static("static"));


let lobbyPlayer = 0;

lobbyZaehlerStartet = false;

let rooms = [];

var chicks = [];

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on('connection', (client) => {
  console.log("New Connection: " + client.id);
  //socket.emit("connect");


  client.on('event', data => { /* … */ });
  client.on('disconnect', () => { /* … */ });


  client.on('joinRoom', room => {
    
    //Room gibts/ voll?
    let roomthere = roomFull(room);
    console.log(roomthere + "  " + client.id);
    switch(roomthere){
    case "first in Room":
      client.join(room);

      let chicken = {
        id: client.id,
        x: Math.round(Math.random() * 16000),
        y: Math.round(Math.random() * 9000),
        direction: "w"
      };

      let newRoom = {
        id: room,
        joinedPlayer: 1,
        player: [chicken]
      };

      rooms.push(newRoom);
      
      //Success
      console.log(client.id + " joined room" + room);
      client.emit("joined");
      break;

      case "Room exists and space left":

      client.join(room);

      //rooms durchgehen joinedPlayer erhöhen
      rooms.forEach(function(element){
        if(element.id == room){
          element.joinedPlayer += 1;

          let chicken = {
            id: client.id,
            x: Math.round(Math.random() * 16000),
            y: Math.round(Math.random() * 9000),
            direction: "w"
          };

          element.player.push(chicken);
        }
      });
      //Success
      console.log(client.id + "joined room" + room);
      client.emit("joined");
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


    
    

    if(!lobbyZaehlerStartet){
      setInterval(function(){waitonLobbyFull(room,client)},3000);
      lobbyZaehlerStartet = true;
    }
    lobbyPlayer +=1;

  })
});

//https://socket.io/docs/rooms-and-namespaces/

function roomFull(room){

  let roomState = 0;
  //0 ist kein Room, 1 room noch free aber nicht erster, 2 room full

  let i = 0;
  while(i < rooms.length && roomState === 0){
    console.log("Room Id: " + rooms[i].id);
    if(rooms[i].id === room){
      console.log("joined Player: " + rooms[i].joinedPlayer);
      if(rooms[i].joinedPlayer < 2){
        roomState = 1;
      }else{
        roomState = 2;
      }
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
  if(lobbyPlayer == 2){
    startGame(room, client);
  }
}




function startGame(room,client){
  client.to(room).emit("startingSoon");
    setTimeout(function(){
      io.to(room).emit("startingNow");     //Standardwerte von chicks vereinbaren
    }, 5000);

    setInterval(function(){updateChicks(room)},1000);
}


function updateChicks(room){
  
}