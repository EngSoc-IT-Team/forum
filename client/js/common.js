"use strict"

function logout() {
    $.ajax({
        url: '/logout',
        type: 'POST',
        contentType: 'application/json', 
        data: JSON.stringify({logout: true})
    }).done(function(data) {
        if (data)
            location.href = '/login'
        else{
            // TODO: display some error message
            console.log(data)
        }
    }).fail(function(err) {
        console.log(err);
    });
}