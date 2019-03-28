const express = require("express");

const app = express();

app.listen(3000);

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/gameui/index.html");
});

app.get("/wasIstBasti", function(req, res) {
    res.send("ein kek");
});

app.post("/asdasd", function(req, res) {

});

app.delete("/asldew", function() {

});

function getGames() {
    // Datenbankverbindung aufbauen

}
