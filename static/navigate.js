/* eslint-disable no-multi-str */
let activeGame;
/**
 * JS for Login:
 *  HTML from login/register loads dynamically while switching between the two
 */

 /**
  * Clicking Login Button:
  *     Credentials Correct: dynamically load main.html
  *                    else: show error message
  */
$('#login-card').on('click', '#login', function(e) {
    $('#passwordHelp').remove();
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/checkAuthentication",
        data: {
            "user": $('#user').val(),
            "password": $('#password').val()
        },xhrFields: {
            withCredentials: true
        },
        dataType: "json",
        success: function(data,textStatus,jqXhr) {
            if(jqXhr.status === 200) {
                console.log("redirecting to main");
                loadMain(function(data) {
                    $('#mainContainer').replaceWith(data);
                    showLobbies();
                });

            } else {
                alert("could not load main");
            };

        },
        error: function() {
            $('#login-form').prepend('<small id="passwordHelp" class="text-danger">Kombination aus Passwort und Benutzername nicht vorhanden</small>');
        }
      });
});

/**
 * Requesets main-container.html
 * Returns HTML in parameter of Callback
 * @param {Function} done
 */
function loadMain(done) {
    $.ajax({
        type:"GET",
        url:"http://localhost:3000/main-container.html",
        success: function(data){
            done(data)
        },
        error: function(data){
            console.log("error while loading /register.html");
        }
    });
}

/**
 * Clicking create Account Button
 * dynamically loads register.html from server
 */
$('#login-card').on('click', '#create-account', function(e) {
    e.preventDefault();
    $.ajax({
        type:"GET",
        url:"http://localhost:3000/register.html",
        success: function(data){
            $('#login-card-body').replaceWith(data);
        },
        error: function(data){
            console.log("error while loading /register.html");
        }
    });
});

/**
 * Clicking Register Button in register view
 *
 * Sends POST Request to Server to create Account
 * Account could be created: redirects to main
 *                     else: show error
 */
$('#login-card').on('click', '#register', function(e) {
    $('#registerHelp').remove();

    if($('#password').val() !== $('#passwordConfirm').val()) {
        $('#register-form').prepend('<small id="registerHelp" class="text-danger">Passworteingaben nicht identisch</small>');
        return;
    }
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/registerUser",
        data: {
            "user": $('#username').val(),
            "password": $('#password').val()
        },
        success: function() {
            $('#return-to-login').click();
        },
        error: function(error) {
            console.log(error);
            if(JSON.parse(error.responseText).rc == 1) {
                $('#register-form').prepend('<small id="registerHelp" class="text-danger">E-Mailadresse existiert bereits</small>');
            } else {
                $('#register-form').prepend('<small id="registerHelp" class="text-danger">Benutzername existiert bereits</small>');
            }
        }
      });
});

/**
 * Clicking Already have an account
 * Loads login.html and returns to login view
 */
$('#login-card').on('click', '#return-to-login', function(e) {
    e.preventDefault();
    $.ajax({
        type:"GET",
        url:"http://localhost:3000/login.html",
        success: function(data){
            $('#login-card-body').replaceWith(data);
        },
        error: function(data){
            console.log("error");
            console.log(data);
        }
    });
});

/**
 * JS for Main Page:
 *  HTML from Lobbies, Profile, Settings is shown loaded when clicking sidebar
 */

/**
 * Click on Lobby Button in main
 *
 * refreshes lobbies from server
 * (uses /getLobbies)
 */
$('body').on('click', '#v-pills-home-tab', function() {
    showLobbies();
});

/**
 * Requests Lobbies from Server
 * Adds Lobbies to HTML
 */
function showLobbies() {
    loadLobbies(function(data,textStatus,jqXhr){
        if(jqXhr.status === 200) {
            $('#lobby-holder').not(':first').empty();
            for(let i = 0; i < data.length; ++i) {
                const lobbyFree = (data[i].joinedPlayers < data[i].maxPlayers)?true:false;
                addLobbieToUi(lobbyFree, data[i].creator, data[i].joinedPlayers, data[i].maxPlayers, data[i].id);
            }
        } else {
            alert("lobbies konnten nicht geladen werden");
        }
    });
}

function addLobbieToUi(lobbyFree, creator, joinedPlayers, maxPlayers, id) {
    $("#lobby-holder").prepend(' \
    <div class="card">\
        <div class="card-body ' + ((lobbyFree)?"bg-success":"bg-danger") + '">\
            <div class="row">\
                <div class="col-sm">\
                ' + creator + '\
                </div>\
                <div class="col-sm">\
                ' + joinedPlayers + '/' + maxPlayers + '\
                </div>\
                <div class="col-sm">\
                <button onclick="joinLobby(this)" class="btn btn-sm btn-primary join-game" data-gameId="' + id + '" ' + ((lobbyFree)?'':'disabled="disabled"') + '>join Lobby</button>\
                </div>\
            </div>\
        </div>\
    </div>');
}

/**
 * GET Lobbies from server
 *
 * Returns Array as Parameter of callback
 *
 * @param {Function} done
 */
function loadLobbies(done) {
    $.ajax({
        type:"GET",
        url:"http://localhost:3000/getLobbies",
        xhrFields: {
            withCredentials: true
        },
        dataType: "json",
        success: function(data, textStatus,jqXhr){
            done(data, textStatus,jqXhr)
        },
        error: function(data){
            console.log("error while loading /getLobbies");
        }
    });
}

$('body').on('click', '#create-lobby', function() {
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/createLobby",
        xhrFields:{
            withCredentials:true
        },
        success: function(lobbId,textStatus,jqXhr) {
            if(jqXhr.status === 200){
                loadGame(function(gamehtml,textStatus,jqXhr) {
                    if(jqXhr.status === 200) {
                        $('#mainContainer').replaceWith(gamehtml);
                        activeGame = new Gameboard(lobbyId);
                    } else {
                        alert("/game.html konnte nicht geladen werden");
                    }
                });
            } else {
                alert("es konnte keine neue Lobby erstellt werden");
            }
        },
        error: function(data) {
            alert("es konnte keine lobby erstellt werden");
        }
    });
});

/**
 * Sends POST Request to Server to joinLobby
 *
 * Joining lobby possible: dynamically load /game.html
 *
 * @param {Element} el
 */
function joinLobby(el) {
    const lobbyId = $(el).attr('data-gameId');
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/joinLobby",
        data: {
            "lobbyId": lobbyId
        },xhrFields: {
            withCredentials: true
        },
        success: function(data,textStatus,jqXhr) {
            if(jqXhr.status === 200) {
                loadGame(function(data,textStatus,jqXhr) {
                    if(jqXhr.status === 200) {
                        $('#mainContainer').replaceWith(data);
                        activeGame = new Gameboard(lobbyId);
                    } else {
                        alert("/game.html konnte nicht geladen werden");
                    }
                });
            } else {
                alert("Ein Problem beim joinen der Lobby ist aufgetreten");
            };

        },
        error: function(e) {
            alert("Ein Problem beim joinen der Lobby ist aufgetreten");
        }
      });
}

/**
 * Loads /game.html from server
 *
 * Returns HTML as Parameter of callback
 *
 * @param {Function} done
 */
function loadGame(done) {
    $.ajax({
        type:"GET",
        url:"http://localhost:3000/game.html",
        success: function(data,textStatus,jqXhr){
            done(data,textStatus,jqXhr);
        },
        error: function(data){
            console.log("error while loading /register.html");
        }
    });
}
