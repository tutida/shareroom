/* share-room  app.js */

//Module dependencies.
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , crypto = require('crypto')
  , fs = require('fs')
  , util = require('util')
var formidable = require('formidable');
// maneger of socket,upload_file
var socketsOf = {}
  , Files = {};

var roomOf = [];

//config for node-server
var app = module.exports = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json())//         these sentence insteaded bodyparser
  app.use(express.urlencoded())//
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.set('roomOf', roomOf);

app.get('/', routes.index);
app.post('/room', routes.room);
app.post('/upload', function(req, res) {

  var form = new formidable.IncomingForm();
  form.encoding = "utf-8";
  form.uploadDir = "./public"

  var linkPath = []
      ,linkName = []
      ,roomId = '';

  form
    .on('field', function(field, value) {
      roomId = value;
    })
    .on('file', function(field, file) {
      linkPath.push(file.path);
      linkName.push(file.name);
    })
    .on('end', function() {
      try{
        fs.statSync("public/uploaded/" + roomId + "/");
      }catch(er){
        fs.mkdirSync("public/uploaded/" + roomId + "/");
      }

      for(i=0; i<linkPath.length; i++){
        var oldPath = './' + linkPath[i];
        var newPath = './public/uploaded/' + roomId + "/" +linkName[i];
        fs.rename(oldPath, newPath, function(err) {
          if (err) throw err;
        });
      }
      res.end();
      emitToRoom(roomId, 'finish upload', {});
    })
    .on('progress', function(bytesReceived, bytesExpected) {
      var percent = (bytesReceived / bytesExpected * 100) | 0;
      console.log('Uploading: ' + percent + '%');
    });


  form.parse(req);
});

var server = http.createServer(app);
var io = require('socket.io').listen(server, {'log level': 1});

//set bufSize
io.set('destroy buffer size','auto');

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



// setting socket.io
io.sockets.on('connection',function (socket) {
  
  socket.emit('connected', {});

  socket.on('read dir',function (data, fn){
    fs.readdir("public/uploaded/" + data.roomId, function(err, files){
      var fileList = [];
      if (!err) {
        fileList = files;
      } else {fileList.push('empty');}
      if(data.state == 'connected' || data.state == 'open'){
        socket.emit('dir result', fileList);
      }else if(data.state == 'renew'){
        emitToRoom(data.roomId, 'dir result', fileList);
      }
    });
  });

  socket.on('hash password', function (password, fn) {
    var hashedPassword = '';
    var shasum = crypto.createHash('sha512');

    if (password !== '') {
      shasum.update('initialhash');
      shasum.update(password);
      hashedPassword = shasum.digest('hex');
    }
    fn(hashedPassword);
  });

  socket.on('check credential', function (client) {
    if (client.mode == 'create') {
      if (socketsOf[client.roomId] !== undefined) {
        socket.emit('room exists', {});
        return;
      }
      socketsOf[client.roomId] = {};
      roomOf.push(client.roomName)
    }

    if (client.mode == 'enter') {
      if (socketsOf[client.roomId] === undefined) {
        socket.emit('invalid credential', {});
        return;
      }
      if (socketsOf[client.roomId][client.userName] !== undefined) {
        socket.emit('userName exists', {});
        return;
      }
    }

    socket.set('client', client, function () {
      socketsOf[client.roomId][client.userName] = socket;
      if (client.userName) {
        console.log('user ' + client.userName + '@' + client.roomId + ' connected');
      }
    });

    socket.emit('credential ok', {});

    var members = Object.keys(socketsOf[client.roomId]);
    emitToRoom(client.roomId, 'update members', members);

    var shasum = crypto.createHash('sha1')
    var message = {
        from: 'システムメッセージ',
        body: client.userName + 'さんが入室しました',
        roomId: client.roomId
    }
    message.date = _formatDate(new Date());
    shasum.update('-' + message.roomId);
    message.id = (new Date()).getTime() + '-' + shasum.digest('hex');
    emitToRoom(message.roomId, 'push message', message);

  });

  socket.on('disconnect', function () {
    socket.get('client', function (err, client) {
      if (err || !client) {
        return;
      }
      var sockets = socketsOf[client.roomId];
      if(sockets !== undefined) {
        delete sockets[client.userName];
      }
      console.log('user ' + client.userName + '@' + client.roomId + ' disconnected');
      var members = Object.keys(sockets);
      if (members.length === 0) {
        delete socketsOf[client.roomId];
        deleteFolderRecursive("public/uploaded/" + client.roomId);
        for(i=0; i<roomOf.length; i++){
          if(roomOf[i] == client.roomName){
            roomOf.splice(i, 1);
          }
        }
      } else {
        emitToRoom(client.roomId, 'update members', members);
        var message = {
          from: 'システムメッセージ',
          body: client.userName + 'さんが退室しました',
          roomId: client.roomId
        }
        var shasum = crypto.createHash('sha1')
        message.date = _formatDate(new Date());
        shasum.update('-' + message.roomId);
        message.id = (new Date()).getTime() + '-' + shasum.digest('hex');
        emitToRoom(message.roomId, 'push message', message);
      }
    });
  });

  socket.on('say', function (message, fn) {
    var shasum = crypto.createHash('sha1')
    message.date = _formatDate(new Date());
    shasum.update(message.userName + '-' + message.roomId);
    message.id = (new Date()).getTime() + '-' + shasum.digest('hex');
    emitToRoom(message.roomId, 'push message', message);
    fn();
  });

  socket.on('request log', function (data) {
    socket.get('client', function (err, client) {
      if (err || client === undefined) {
        return;
      }
      emitToRoom(client.roomId, 'request log', {}, function (log) {
        socket.emit('update log', log);
      });
    });
  });

  socket.on('Start', function (data) { 
      var Name = data['Name'];
      Files[Name] = {  
        FileSize : data['Size'],
        Data   : "",
        Downloaded : 0
      }
      var Place = 0;
      try{
        var Stat = fs.statSync('Temp/' +  Name);
        if(Stat.isFile())
        {
          Files[Name]['Downloaded'] = Stat.size;
          Place = Stat.size / 524288;
        }
      }catch(er){}

      fs.open("Temp/" + Name, 'a', 0755, function(err, fd){
        if(err){
          console.log(err);
        }else{
          Files[Name]['Handler'] = fd;
          socket.emit('MoreData', { 'Place' : Place, Percent : '0' });
        }
      });
  });

  socket.on('request points', function (roomId){
  	emitToRoom(roomId, 'request paintLog', {}, function (data) {
      socket.emit('resize canvas', {width:data.width,height:data.height}); 
  			socket.emit('paste', data.log); 
  	});
  });

  socket.on('sendPoints', function (data){
    emitToRoom(data.roomId, 'draw canvas', data.message);
  });

  socket.on('sendText', function (data){
    emitToRoom(data.roomId, 'draw text', data.message);
  });

  socket.on('clickClear', function (roomId){
  	emitToRoom(roomId, 'clear canvas');
  });

  socket.on('clickResize', function (data){
    emitToRoom(data.roomId, 'resize canvas',{width:data.width,height:data.height});
  });

  socket.on('imagePaste', function (data){
  	emitToRoom(data.roomId, 'paste', data.src);
  });
});


//functions
function emitToRoom(roomId, event, data, fn) {
  if (socketsOf[roomId] === undefined) {
    return;
  }
  var sockets = socketsOf[roomId];
  Object.keys(sockets).forEach(function (key) {
    sockets[key].emit(event, data, fn);
  });
};

function _formatDate(date) {
  var mm = date.getMonth();
  var dd = date.getDate();
  var HH = date.getHours();
  var MM = date.getMinutes();
  if (HH < 10) {
    HH = '0' + HH;
  }
  if (MM < 10) {
    MM = '0' + MM;
  }
  return mm + '/' + dd + ' ' + HH + ':' + MM;
};

function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};