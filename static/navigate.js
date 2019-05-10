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

$('body').on('click', '#v-pills-home-tab', function() {
    loadLobbies(function(data, textStatus,jqXhr) {
        if(jqXhr.status === 200) {
            $('#lobby-holder').empty();
            for(let i = 0; i < data.length; ++i) {
                const lobbyFree = (data[i].joinedPlayers < data[i].maxPlayers)?true:false;
                $("#lobby-holder").append(' \
                    <div class="card">\
                        <div class="card-body ' + ((lobbyFree)?"bg-success":"bg-danger") + '">\
                            <div class="row">\
                                <div class="col-sm">\
                                ' + data[i].name + '\
                                </div>\
                                <div class="col-sm">\
                                ' + data[i].joinedPlayers + '/' + data[i].maxPlayers + '\
                                </div>\
                                <div class="col-sm">\
                                <button onclick="joinLobby(this)" class="btn btn-sm btn-primary join-game" data-gameId="' + data[i].id + '" ' + ((lobbyFree)?'':'disabled="disabled"') + '>join Lobby</button>\
                                </div>\
                            </div>\
                        </div>\
                    </div>');
            }
        } else {
            alert("lobbies konnten nicht geladen werden");
        }
    });
});

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


function loadGame(done) {
    $.ajax({
        type:"GET",
        url:"http://localhost:3000/game.html",
        success: function(data,textStatus,jqXhr){
            done(data,textStatus,jqXhr)
        },
        error: function(data){
            console.log("error while loading /register.html");
        }
    });
}

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
            navigatePage('main');
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

function navigatePage() {

}