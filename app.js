/* share-room  app.js */

//Module dependencies.
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , crypto = require('crypto')
  , fs = require('fs')
  , util = require('util')

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
  app.use(express.bodyParser());
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
};