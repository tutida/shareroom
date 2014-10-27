// chat.js

(function () {
  var messageLogs = {};

  $(document).ready(function () {

    $(window).on('load resize', function(){
      $('#chat').css('height',$('#pageslide').height())
    });

    socket.on('connected', function(data) {
      socket.emit('check credential', minichat);
    });

    socket.on('credential ok', function(data) {
      socket.emit('request log', {});
    });

    socket.on('invalid credential', function(data) {
      authRetry('ルーム名/パスワードが不正です');
    });

    socket.on('room exists', function(data) {
      authRetry('同名のルームがすでに存在します');
    });

    socket.on('userName exists', function(data) {
      authRetry('その名前はすでに使われています');
    });

    socket.on('request log', function(data, callback) {
      callback(messageLogs);
    });

    socket.on('update log', function(log) {
      Object.keys(log).forEach(function (key) {
        messageLogs[key] = log[key];
      });
      updateMessage();
    });

    socket.on('update members', function (members) {
      $('#members').empty();
      for (var i = 0; i < members.length; i++) {
        var html = '<li>' + members[i] + '</li>';
        $('#members').append(html);
      }
    });

    socket.on('push message', function (message) {
      messageLogs[message.id] = message;
      prependMessage(message);
      popupMessage(message);
    });

    $('#message').keypress(function (e) {
      if(e.keyCode == 13 && !e.shiftKey) {
        var message = {
          from: minichat.userName,
          body: $('#message').val(),
          roomId: minichat.roomId
        };
        socket.emit('say', message, function () {
          $('#message').val('');
        });
      }
    });

    $('#credential-dialog-form').on('submit', function() {
      $('#credentialDialog').modal('hide');
      socket.emit('hash password', $('#new-password').val(), function (hashedPassword) {
        minichat.roomName = $('#new-room').val();
        minichat.userName = $('#new-name').val();
        minichat.password = hashedPassword;
        minichat.roomId = minichat.roomName + minichat.password;
        socket.emit('check credential', minichat);
      });
      return false;
    });

    $("#open").pageslide({ direction: "right", modal: true });
    $("#open").click(function(){
      if(chatOpen){
        chatOpen = false;
        $("#open").text('chat-open');
      } else {
        chatOpen = true;
        popupCount = 0;
        $("#open").text('chat-close');
        $("#pop").fadeOut("fast");
      }
    });

    function resize() {
      var nofiSize = window.innerWidth - $('#userH').width() - $('#roomH').width() - 450;
      $('#notification').css('width',nofiSize);
    }
    window.onload=resize;
    window.onresize=resize;
  }); // document.ready()ここまで

  function authRetry(message) {
    $('#credential-dialog-header').text(message);    
    $('#new-room').val(minichat.roomName);
    $('#new-name').val(minichat.userName);
    $('#credentialDialog').modal('show');
  }

  function prependMessage(message) {
    var str = message.body.replace(/\r?\n/g, "<br />");;
    var html = '<div class="message" id="' + message.id + '">'
      + '<p class="postdate">' + message.date + '</p>'
      + '<p class="author">' + message.from + '：</p>'
      + '<p class="comment">' + str + '</p>'
      + '</div>';
    $('#messages').prepend(html);
  }

  function updateMessage() {
    $('#messages').empty();
    var keys = Object.keys(messageLogs);
    keys.sort();
    keys.forEach(function (key) {
      prependMessage(messageLogs[key]);
    });
  }

  function popupMessage(message) {
    if(!chatOpen){
      popupCount++;
      $("#pop").fadeIn("normal");
      $("#pop").text(popupCount);
    }
    var str = message.body.replace(/\r?\n/g, " ");;
    $('#notification').text('['+message.from+']'+' : '+str);
    $('#notification').css('display','none')
    $('#notification').animate({height: "toggle", opacity: "toggle"},"slow");
  }

}).apply(this);

