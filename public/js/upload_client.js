(function () {
	$(document).ready(function () {
		socket.on('connected', function(data) {
	      socket.emit('read dir', {roomId: minichat.roomId,state: 'connected'});
	    });

	    socket.on('finish upload', function(data) {
	      socket.emit('read dir', {roomId: minichat.roomId,state: 'connected'});
	    });

	    socket.on('dir result', function(fileList) {
			$('#UploadedFiles').empty();
			var html = '<div>';
			if(fileList[0] != 'empty'){
				for(var i in fileList){
					html += '<p class="click" id="List">' + fileList[i] + '</p>';
				}
			}else html += '<p id="List">' + 'There is not Uploaded Files' + '</p>';
			html += '</div>'
			$('#UploadedFiles').prepend(html);
	    });
	}); // end of document.ready()
}).apply(this);

