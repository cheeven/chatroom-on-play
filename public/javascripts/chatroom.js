$.fn.pressEnter = function(fn) {

    return this.each(function() {
        $(this).bind('enterPress', fn);
        $(this).keyup(function(e){
            if(e.keyCode == 13)
            {
              $(this).trigger("enterPress");
            }
        })
    });
 };

var setupChatroom = function(id, wsEndpoint) {
    var socket = null;
         $('.chatroom-' + id + ' .connectButton').click(function(){
             socket = new WebSocket(wsEndpoint);
             socket.onopen = function(evt){
                 var message = $('<pre>');
                 $(message).html('WebSocket connected!');
                 $('.chatroom-' + id + ' .messages').append($(message));
                 $('.chatroom-' + id + ' .connectButton').prop('disabled', true);
                 $('.chatroom-' + id + ' .messageText').prop('disabled', false);
                 $('.chatroom-' + id + ' .disconnectButton').prop('disabled', false);
             };
             socket.onmessage = function(evt){
                 var message = $('<pre>');
                 $(message).html('Message: ' + evt.data);
                 $('.chatroom-' + id + ' .messages').append($(message));
             };
             socket.onclose = function(evt){
                 var message = $('<pre>');
                 $(message).html('WebSocket closed!');
                 $('.chatroom-' + id + ' .messages').append($(message));
                 $('.chatroom-' + id + ' .connectButton').prop('disabled', false);
                 $('.chatroom-' + id + ' .messageText').prop('disabled', true);
                 $('.chatroom-' + id + ' .disconnectButton').prop('disabled', true);
             };
             $('.chatroom-' + id + ' .connectButton').prop('disabled', true);
         });
         $('.chatroom-' + id + ' .disconnectButton').click(function(){
             if(socket) {
                 socket.close();
             }
             $('.chatroom-' + id + ' .disconnectButton').prop('disabled', true);
             $('.chatroom-' + id + ' .messages').empty();
         });
         $('.chatroom-' + id + ' .messageText').pressEnter(function(){
             var message = $('.chatroom-' + id + ' .messageText').val();
             if(socket && message) {
                 socket.send(message);
             }
         });
         };