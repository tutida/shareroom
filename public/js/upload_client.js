(function () {
	$(document).ready(function () {
		socket.on('connected', function(data) {
	      socket.emit('read dir', {roomId: minichat.roomId,state: 'connected'});
	    });

	    socket.on('uploading', function(data) {
	      $('#UploadedFiles').addClass('drop')
	    });

	    socket.on('finish upload', function(data) {
	      $('#UploadedFiles').removeClass('drop')
	      socket.emit('read dir', {roomId: minichat.roomId,state: 'renew'});
	    });

	    socket.on('dir result', function(fileList) {
			$('#UploadedFiles').empty();
			var html = "";
			if(fileList[0] != 'empty'){
				for(var i in fileList){
					if(i == 0 || i%3 == 0){
						html += '<div class="thumbnailList">';
					}
					html += '<div class="thumbnail"><img src="'
					html += "/uploaded/" + minichat.roomId + "/" + fileList[i];
					html += '" class="click"/>';
					html += '<div class="filename">'
					html += fileList[i];
					html += '</div></div>'
					var j = Number(i);
					if((i+1)%3 == 0 || (j+1) == fileList.length){
						html += '</div>';
					}
				}
				html += '<div id="delete">All Delete</div>';
			}else html += '<p>' + 'There are not Uploaded Files' + '</p>';

			$('#UploadedFiles').prepend(html);
	    });
	}); // end of document.ready()
}).apply(this);

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

    $(document).on('click', '#delete', function(){
		if(window.confirm('アップロードされたファイルが削除されます。\nよろしいですか？')){
			socket.emit('delete dir', minichat.roomId);
		}else　return;
    });
});

