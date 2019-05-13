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
            3 - Database Error
*/
function registerUser(name='', password, done){
    const email = ' '
    name = (name===null)?'':name;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        if(err) {
            console.log(err.stack);
        } else {
            bcrypt.hash(password, salt, function(err, hash) { // old: select name,email
                const query1 = {
                    text: "SELECT name FROM player;",
                    rowMode: "array"
                };
                const query2 = {
                    text: "INSERT INTO player (name, password, salt) VALUES ('" + name + "', '" + hash + "', '" + salt + "');",
                    rowMode: "array"
                };
            
                pool.query(query1, (err, res) => {
                    if(err) {
                        console.log(err.stack);
                        done(3);
                    } else {
                        console.log("SELECT successful");
                        
                        //check names
                        for (i = 0; i < res.rowCount; i++) {
                            if(res.rows[i][0].toLowerCase().localeCompare(name.toLowerCase()) == 0) {
                                console.log("gibts schon!!1");
                                console.log("db:" + res.rows[i][0].toLowerCase() + ";gschikct:" + name.toLowerCase());
                                done(1);
                                return;
                            }
                        }

                        //insert player
                        pool.query(query2, (err, res) => {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log("inserted successful");
                                console.log(done);
                                done(0);
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
function login(login, password, done) {
    const query = {
        text: "SELECT password, salt, id FROM player WHERE name = '" + login + "';",
        rowMode: "array"
    };

    pool.query(query, (err, res) => {
        if(err) {
            console.log(err.stack);
        } else {
            if(res.rowCount == 1) {
                bcrypt.hash(password, res.rows[0][1], function(err, hash) {
                    if(res.rows[0][0].localeCompare(hash) == 0) {
                        done({"correctCredentials":true, "player_id": res.rows[0][2]});
                    } else {
                        done({"correctCredentials":false});
                    }
                });
            } else {
                done({"correctCredentials":false});
            }
        }
    });
}

/*
    Fügt Spiel in Tabelle game und alle zugehörigen Spieler in Tabelle player_in_game
    Input: hunter, chicken[], general mit hunter.username, hunter.shots, hunter.hits, chicken[].username, chicken[].livesLeft, general.duration
    Return: true  - alles korrekt
            false - Fehler beim schreiben in die DB
*/
function saveGame(hunter, chicken, general, done) {
    const query1 = {
        text: "INSERT INTO game (shots, hits, duration) VALUES ('" + hunter.shots + "', '" + hunter.hits + "', " + general.duration + ") RETURNING id;",
        rowMode: "array"
    };

    pool.query(query1, (err, res) => {
        if(err) {
            console.log(err);
            done(0);
            return;
        } else {
            console.log("Game wurde in die Datenbank geschrieben.");

            //Setze zweites Kommando zusammen
            var part1 = "INSERT INTO player_in_game (game, shooter, chicken1, chicken_lifes1";
            for(var i = 1; i < chicken.length; i++) {
                part1 = part1 + ", chicken" + (i+1) + ", chicken_lifes" + (i+1);
            }
            part1 = part1 + ") VALUES (" + res.rows[0][0] + ", " + "(SELECT id FROM player WHERE id='" + hunter.id + "')";
            for(var i = 0; i < chicken.length; i++) {
                part1 = part1 + ", (SELECT id FROM player WHERE id='" + chicken[i].id + "'), " + chicken[i].lifesLeft;
            }
            part1 = part1 + ");";

            const query2 = {
                text: part1,
                rowMode: "array"
            };

            pool.query(query2, (err, res) => {
                if(err) {
                    console.log(query2);
                    console.log(err.stack);
                    done(false);
                    return;
                } else {
                    console.log("Successfully inserted everything");
                    done(true);
                    return;
                }
            });
        }
    });
}

function getUsernames(arrayOfPlayerIds, done) {
    const idString = JSON.stringify(arrayOfPlayerIds)
    const sqlIdList = "(" + idString.substring(1, idString.length-1) + ")";
    const query = {
        'text':'SELECT id,name from Player WHERE id=' + sqlIdList + ";",
        'rowMode': 'array'
    };
    console.log(query);
    pool.query(query, (err, res) => {
        if(err) {
            done({success:false});
        } else {
            const idToPlayerMap = {};

            for(index in res) {
                idToPlayerMap[res[index][0]] = res[index][1];
            }

            console.log(idToPlayerMap);
            done({success: true, map: idToPlayerMap});
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

//saveGame({"username":"franz", "hits":12, "shots":30}, [{"username":"paul", "lifesLeft":2}, {"username":"basti", "lifesLeft":4}], {"duration":200});