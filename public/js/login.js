(function() {
    // This doesn't do anything...
    //$('#loginSubmit').on('submit', function() {
        //alert('submit tapped');
    //});

    // Have to attach 
    $('#loginForm').on('submit', function(e) {
        e.preventDefault(); // Stops the form from submitting


        // do some validation checking...
        

        // If submission is valid
        this.submit();
    });

}());


