(function () {
	var SelectedFile;
	var FReader;
	var Name;

	$(document).ready(function () {
		Ready();

		socket.on('connected', function(data) {
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

		socket.on('MoreData', function (data){
			UpdateBar(data['Percent']);
			var Place = data['Place'] * 524288;
			var NewFile; 
			if(window.File.prototype.slice === undefined) {
				window.File.prototype.slice = (window.File.prototype.webkitSlice || window.File.prototype.mozSlice);
			}
			var newFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
			FReader.readAsBinaryString(newFile);
		});

		socket.on('Done', function (data){
			var Content = "<div id='done'>Successfully Uploaded !!</div>";
				Content += "<img id='Thumb' src='" + data['src'] + "' alt='" + data['Name'] + "'>";
				Content += "<a id='Restart'>upload another</a>";
			document.getElementById('uploadArea').innerHTML = Content;
			document.getElementById('Restart').addEventListener('click', Refresh);
            $('#Restart').button();
			socket.emit('read dir', {roomId: minichat.roomId,state: 'renew'});
		});

	}); // end of document.ready()

	function FileChosen(evnt) {
    SelectedFile = evnt.target.files[0];
	document.getElementById('nameBox').value = SelectedFile.name;
	}

	function Ready(){ 
		if(window.File && window.FileReader){ //These are the necessary HTML5 objects the we are going to use 
			document.getElementById('uploadButton').addEventListener('click', StartUpload);  
			document.getElementById('fileBox').addEventListener('change', FileChosen);
		}
		else
		{
			document.getElementById('uploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
		}
	}

	function StartUpload(){
		if(document.getElementById('fileBox').value != "")
		{
			FReader = new FileReader();
			Name = document.getElementById('nameBox').value;
			var Content = "<div id='Uploading'><span id='NameArea'>Uploading " + SelectedFile.name +" as " + Name + "</span>";
			Content += '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">50%</span>';
			Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span></div>";
			document.getElementById('uploadArea').innerHTML = Content;
			FReader.onload = function(evnt){
				socket.emit('Upload', { 'Name' : Name, Data : evnt.target.result, roomId: minichat.roomId });
			}
			socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
		}
		else
		{
			alert("Please Select A File");
		}
	}

	function UpdateBar(percent){
		document.getElementById('ProgressBar').style.width = percent + '%';
		document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%';
		var MBDone = Math.round(((percent/100.0) * SelectedFile.size) / 1048576);
		document.getElementById('MB').innerHTML = MBDone;
	}
	function Refresh(){
		var Content = '<p id="selectFile">';
            Content += '<label id="fileBoxLabel" for="fileBox">Choose A File:</label>';
            Content += '<input id="fileBox" type="file"/></p>';
            Content += '<p id="fileName">';
            Content += '<label id="nameBoxLabel" for="nameBox">Name:</label>';
            Content += '<input id="nameBox" type="text"/>';
            Content += '</p><a id="uploadButton">upload</a>';
		document.getElementById('uploadArea').innerHTML = Content;
		$('#uploadButton').button();
		Ready();
	}

}).apply(this);

