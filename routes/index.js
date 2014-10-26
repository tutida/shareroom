/*
 * GET home page.
 */

var crypto = require('crypto')

exports.index = function(req, res){
  res.render('index', { title: 'Share-room',roomOf: module.parent.exports.set('roomOf')});
};

exports.room = function(req, res){
  var roomName = req.body.roomName || '';
  var yourName = req.body.yourName || '';
  var password = req.body.password || '';
  var mode = req.body.mode;

  if (mode === undefined) {
    res.send(500);
    return;
  };
  var hashedPassword = '';
  var shasum = crypto.createHash('sha512');

  if (password !== '') {
    shasum.update('initialhash');
    shasum.update(password);
    hashedPassword = shasum.digest('hex');
  }

  var params = {
    title: roomName+ '：' + yourName,
    room: {
      name: roomName,
      password: hashedPassword
    },
    user: {name: yourName},
    mode: mode
  };
  res.render('room', params);
};


var fs = require('fs')
  , formidable = require('formidable')

exports.upload = function(req, res){
  
  var form = new formidable.IncomingForm();
  form.encoding = "utf-8";
  form.uploadDir = "./public"
 
  var linkPath = []
      ,linkName = []
      ,linkType = {}
      ,roomId = ''
      ,prevPercent='';

  form
    .on('field', function(field, value) {
      roomId = value;
    })
    .on('file', function(field, file) {
      if(module.parent.exports.set('linkTypeOf')[roomId]){
        linkType = module.parent.exports.set('linkTypeOf')[roomId]
      }
      linkType[file.name] = file.type;
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
      module.parent.exports.set('linkTypeOf')[roomId] = linkType;
    })
    .on('progress', function(bytesReceived, bytesExpected) {
      var percent = (bytesReceived / bytesExpected * 100) | 0;
      if(percent != prevPercent){
        emitToRoom(roomId, 'uploading', percent);
        prevPercent = percent;
      }
    });
  form.parse(req);
};

function emitToRoom(roomId, event, data, fn) {
  var socketsOf =  module.parent.exports.set('socketsOf');
  if (socketsOf[roomId] === undefined) {
    return;
  }
  var sockets = socketsOf[roomId];
  Object.keys(sockets).forEach(function (key) {
    sockets[key].emit(event, data, fn);
  });
};

