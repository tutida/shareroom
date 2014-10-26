(function () {
	$(document).ready(function () {

	    socket.on('uploading', function(data) {
	      if(document.getElementById("drop") == null){
      		$('#UploadedFiles').addClass('drop')
	      }
	      var html = "";
	      if(document.getElementById("progress") == null){
	      	html ='<div id="progress">'+data+'％ uploading...</div>'
	      	$('#UploadedFiles').append(html);	      	
	      }else{
	      	html ='<div id="progress">'+data+'％ uploading...</div>'
	      	$('#progress').html(html);
	      }
	    });

	    socket.on('finish upload', function(data) {
	      $('#UploadedFiles').removeClass('drop')
	      socket.emit('read dir', {roomId: minichat.roomId,state: 'renew'});
	    });

	    socket.on('dir result', function(data) {
			$('#UploadedFiles').empty();
			var html = "";
			if(data.fileList[0] != 'empty'){
				for(var i in data.fileList){
					if(i == 0 || i%3 == 0){
						html += '<div class="thumbnailList">';
					}
					html += '<div class="thumbnail">'
					if(data.linkType[data.fileList[i]].match(/image/)){
						html += '<img src="';
						html += "/uploaded/" + minichat.roomId + "/" + data.fileList[i];
						html += '" class="images"/>';
					}else{
						html += '<a href="';
						html += "/uploaded/" + minichat.roomId + "/" + data.fileList[i];
						html += '"onclick="return false">'
						html += '<img src="';
						html += "/images/Noimage_image.png"
						html += '" class="files"/></a>';
					}
					html += '<div class="filename">'
					html += data.fileList[i];
					html += '</div></div>'
					var j = Number(i);
					if((i+1)%3 == 0 || (j+1) == data.fileList.length){
						html += '</div>';
					}
				}
				html += '<div id="delete" align="center">All Delete</div>';
			}else html += '<p>' + 'There are not Uploaded Files' + '</p>';

			$('#UploadedFiles').prepend(html);
	    });
	}); // end of document.ready()
}).apply(this);

$(function() {
  
    $('#uploadWin').draggable();

    $('#upload-open').on('click', function(e){
      if($('#uploadWin').css('display') == 'none'){
        socket.emit('read dir', {roomId: minichat.roomId,state: 'open'});
      }
      $('#uploadWin').animate({height: "toggle", opacity: "toggle"},"slow");
    });

    $('.uploadWinTab li').click(function(){
      var index = $('.uploadWinTab li').index(this);
      if(index == 1){
        $('#uploadWin').animate({height: "toggle", opacity: "toggle"},"slow");
      }
    });

    $('#uploadButton').button();

    $(document).on('click', '.images', function(){
        src2 = $(this).context.src
        socket.emit('imagePaste', {src: src2,roomId: minichat.roomId});
    });

    $(document).on('click', '.files', function(){
		window.alert('画像ファイルではありません。\n[右クリック]→[保存]が可能です。');
    });

    $(document).on('click', '#delete', function(){
		if(window.confirm('アップロードされたファイルが削除されます。\nよろしいですか？')){
			socket.emit('delete dir', minichat.roomId);
		}else　return;
    });
});