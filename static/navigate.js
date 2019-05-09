$('#login').on('click', function() {
    $('#passwordHelp').remove();
    $.ajax({
        type: "POST",
        url: "localhost/checkAuthentication",
        data: {
            "user": $('#username').value(),
            "password": $('#password').value()
        },
        success: function() {
            navigatePage('main');
        },
        error: function() {
            $('#login-form').prepend('<small id="passwordHelp" class="text-danger">Kombination aus Passwort und Benutzername nicht vorhanden</small>');
        }
      });
});