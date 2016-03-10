(function(){
    $('#newRequestForm').on('submit', function(e) {
        // Prevent form from submitting
        e.preventDefault();

        // Check description field
        var desc = $('#description').val();
        if (desc === '') {
            alert('Description is a required field!');
        }

        // Check bid field
        var bid = $('#bid').val();
        if ( isNaN(bid) || bid === '' || bid === 0) {
            alert('Please enter a valid number for bid');
            return false;
        }

        // If fields are entered correctly, submit
         this.submit();
    });

    // Register popup dialog
    $('#requestDetailPopup').dialog({
        autoOpen: false,
    });

    $('.helpAwaitsButton').on('click', function() {
        // Get id of request
        var id = $(this).attr('data-requestId');
        $.ajax({
            type: 'GET',
            url: '/request?id='+id,
            success: function(res) {
                openDialog(res, id);
                // We're gonna use a popup
            }
        });
    });



    function openDialog(res, requestId) {
        $('#requestDetailPopup').html(res)
        $('#requestDetailPopup').dialog('open');

        console.log('req id: ' + requestId);

        // Setup button handlers
        $('.acceptHelpButton').on('click', function(e) {
            // Change status of request object
            // open potential line of communication between
            // tutor and student
            $.ajax({
                type: 'POST',
                url: '/acceptHelp',
                data: {
                    accountId: $(this).attr('data-accountId'),
                    requestId: requestId,
                },
                success: function(res) {
                    console.log(res);
                }
            });
        });
    }

    $('#sendMessagePopup').dialog({autoOpen: false});
    $('.openMessageDialog').on('click', function() {
        // Open message dialog
        $('#sendMessagePopup').dialog('open');
        currentTutorIdForMessaging = $(this).attr('data-accountid');
        currentRequestIdForMessaging = $(this).attr('data-requestid');
        console.log(currentRequestIdForMessaging);
    });

    var currentTutorIdForMessaging;
    var currentRequestIdForMessaging;
    $('#sendMessageButton').on('click', function() {
        // post message
        if ($('#messagebox').val() !== '') {
            $.ajax({
                type: 'POST',
                url: '/sendMessage',
                data: {
                    tutorId: currentTutorIdForMessaging, 
                    message: $('#messagebox').val(),
                    requestId: currentRequestIdForMessaging, 
                },
                success: function(res) {
                    console.log(res);                        
                    $('#messageBox').html(res);
                },
                error: function(err) {
                    console.log(err);
                }
            });
        }
    });
})();
