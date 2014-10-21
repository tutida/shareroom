(function () {
	$(document).ready(function () {
		socket.on('connected', function(data) {
	      socket.emit('read dir', {roomId: minichat.roomId,state: 'connected'});
	    });

	    socket.on('finish upload', function(data) {
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
					if((i+1)%3 == 0){
						html += '</div>';
					}
				}
			}else html += '<p id="List">' + 'There are not Uploaded Files' + '</p>';

			$('#UploadedFiles').prepend(html);
	    });
	}); // end of document.ready()
}).apply(this);

