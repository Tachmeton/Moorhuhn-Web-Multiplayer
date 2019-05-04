//connect to db
const fs = require('fs');
const pg = require('pg');
const bcrypt = require('bcrypt');
const saltRounds = 14;

const dbOptions = JSON.parse(fs.readFileSync('dbOptions.json'));

console.log("read dbOptions.json");

const pool = new pg.Pool(dbOptions);
/*
    Fügt Spieler hinzu und prüft vorher, ob Mail oder Name bereits in der DB vorhanden sind.
    Return: 0 - erfolgreich
            1 - Name bereits vorhanden
            2 - Email bereits vorhanden
*/
function insertPlayer(name, password, email) {
    bcrypt.genSalt(saltRounds, function(err, salt) {
        if(err) {
            console.log(err.stack);
        } else {
            bcrypt.hash(password, salt, function(err, hash) {
                const query1 = {
                    text: "SELECT name, email FROM player;",
                    rowMode: "array"
                };
                const query2 = {
                    text: "INSERT INTO player (name, email, password, salt) VALUES ('" + name + "', '" + email + "', '" + hash + "', '" + salt + "');",
                    rowMode: "array"
                };
            
                pool.query(query1, (err, res) => {
                    if(err) {
                        console.log(err.stack);
                    } else {
                        console.log("SELECT successful");
                        
                        //check names
                        for (i = 0; i < res.rowCount; i++) {
                            if(res.rows[i][0].toLowerCase().localeCompare(name.toLowerCase()) == 0) {
                                console.log("gibts schon!!1");
                                return 1;
                            }
                        }
                        
                        //check emails
                        for (i = 0; i < res.rowCount; i++) {
                            if(res.rows[i][1].toLowerCase().localeCompare(email.toLowerCase()) == 0) {
                                console.log("gibts schon!!");
                                return 2;
                            }
                        }

                        //insert player
                        pool.query(query2, (err, res) => {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log("inserted successful");
                                return 0;
                            }
                        });
                    }
                });
            });
        }
    });
}

/*
    Überprüft eingegebene Logindaten.
    Return: 0 - Eingabe war erfolgreich
            1 - Passwort oder Login waren falsch
*/
function login(login, password) {
    const query = {
        text: "SELECT password, salt FROM player WHERE name = '" + login + "' OR email = '" + login + "';",
        rowMode: "array"
    };

    pool.query(query, (err, res) => {
        if(err) {
            console.log(err.stack);
        } else {
            if(res.rowCount == 1) {
                bcrypt.hash(password, res.rows[0][1], function(err, hash) {
                    if(res.rows[0][0].localeCompare(hash) == 0) {
                        console.log("Eingabe war korrekt!");
                        return 0;
                    } else {
                        console.log("Passwort war falsch!")
                        return 1;
                    }
                });
            } else {
                console.log("Falscher Login!")
                return 1;
            }
        }
    });
}

/*
    gibt die Punkte des spielers als Array zurück
    [shooterpoints, chickenpoints]
*/
function getPoints(player) {
    const query = {
        text: "SELECT shooterpoints, chickenpoints FROM player WHERE name = '" + player + "';",
        rowMode: "array"
    };

    pool.query(query, (err, res) => {
        if (err) {
            console.log(err.stack);
        } else {
            console.log(res.rows[0]); //[shooterpoints, chickenpoints] --> als arry <3
            return res.rows[0];
        }
    });
}

//login("Frranz", "PaulistToll");
//insertPlayer("Frranz", "PaulistToll", "franz@admin.de");
//getPoints("Pauli");
//pool.end;