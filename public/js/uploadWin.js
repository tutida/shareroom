$(function() {
  
    $('#uploadWin').draggable();

    $('#upload-open').on('click', function(e){
      $('#uploadWin').animate({height: "toggle", opacity: "toggle"},"slow");
      socket.emit('read dir', {roomId: minichat.roomId,state: 'open'});
    });

    $('.uploadWinTab li').click(function(){
      var index = $('.uploadWinTab li').index(this);
      if(index == 1){
        $('#uploadWin').animate({height: "toggle", opacity: "toggle"},"slow");
      }
    });

    $('#uploadButton').button();

    $(document).on('click', '.click', function(){
        src2 = $(this).context.src
        socket.emit('imagePaste', {src: src2,roomId: minichat.roomId});
    });
});