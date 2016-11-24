"use strict";

function getLoginContent() {
	return {username: $(netid).val(), secret: $(secret).val()};
}

function login() {
	$(signIn).prop("disabled", true);
	var content = getLoginContent();
	if (!content["username"] || !content["secret"]){
		$(signIn).prop("disabled", false);
		return console.warn("Please fill out required fields before attempting to log in")
	}

	$.ajax({
    	url: '/login',
    	type: 'POST',
    	contentType: 'application/json', 
    	data: JSON.stringify(content)
    }).done(function(data) {
    	if (data) {
            location.href = '/'
        }
        else {
            $(signIn).prop("disabled", false);

        }
    	
        
    }).fail(function(err) {
    	console.log(err);
    	$(signIn).prop("disabled", false);
    });
}

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