const express = require("express");

const app = express();

app.use(express.static("static"));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/wasIstBasti", function(req, res) {
    res.send("ein kek");
});

app.post("/asdasd", function(req, res) {

});

app.delete("/asldew", function() {

});


app.listen(3000);
