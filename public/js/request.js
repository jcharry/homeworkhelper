(function(){
    //$('.searchrequest').on('click', function(e) {
        //// Request clicked - get id of request
        //console.log($(this)[0].dataset.id);
    //});

    $('.offerToHelpButton').on('click', function(e) {
        //send POST for ID
        
        //TODO: Probably want some kind of confirmation to prevent accidental offers
        var requestId = $(this)[0].dataset.id;
        
        console.log(requestId);
        $.ajax({
            method: 'POST',
            url: '/offerHelp',
            data: { request_id: requestId },
        });
        
    });
     
    
})();
