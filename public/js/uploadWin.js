$(function() {
  
    $('#uploadWin').draggable();

    $('#upload-open').on('click', function(e){
      $('#uploadWin').animate({height: "toggle", opacity: "toggle"},"slow");
    });

    $('.uploadWinTab li').click(function(){
      var index = $('.uploadWinTab li').index(this);
      if(index !== 2){
        $('.uploadWinTab li').removeClass('select');
        $(this).addClass('select')
        $('.uploadWinContents li').css('display','none');
        $('.uploadWinContents li').eq(index).css('display','block');
      } else $('#uploadWin').animate({height: "toggle", opacity: "toggle"},"slow");
    });

    $('#uploadButton').button();

    $(document).on('click', '.click', function(){
        $(this).find("span:last").remove();
        src2 = "/uploaded/" + minichat.roomId + "/" + $(this).html(); + new Date().getTime();
        socket.emit('imagePaste', {src: src2,roomId: minichat.roomId});
    });

    $(document).on('mouseenter', '.click', function(){
      var src3 = "/uploaded/" + minichat.roomId + "/" + $(this).html(); + new Date().getTime();
      var ex = "<img id='Thumb_list' src='" + src3 +"'>";
      $(this).append($("<span> "+ ex +"</span>"));
    });

    $(document).on('mouseleave', '.click', function(){
      $(this).find("span:last").remove();
    });
});