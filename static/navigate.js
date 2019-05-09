$('#login-card').on('click', '#login', function(e) {
    $('#passwordHelp').remove();
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/checkAuthentication",
        data: {
            "user": $('#user').val(),
            "password": $('#password').val()
        },
        dataType: "json",
        success: function() {
            navigatePage('main');
        },
        error: function() {
            $('#login-form').prepend('<small id="passwordHelp" class="text-danger">Kombination aus Passwort und Benutzername nicht vorhanden</small>');
        }
      });
});

$('#login-card').on('click', '#create-account', function(e) {
    e.preventDefault();
    $.ajax({
        type:"GET",
        url:"http://localhost:3000/register.html",
        success: function(data){
            $('#login-card-body').replaceWith(data);
        },
        error: function(data){
            console.log("error");
            console.log(data);
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
            alert("navigiere jetzt zu main");
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