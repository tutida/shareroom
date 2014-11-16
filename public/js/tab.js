$(function() {

    var globalIndex = 0;

    $(document).on('click', '.tab li', function(){

        var index = $('.tab li').index(this);
        globalIndex = index;

        $('.content li').css('display','none');

        $('.content li').eq(index).css('display','block');

        $('.tab li').removeClass('select');
        $(this).addClass('select')

        if(index==0){
          $('#bookmark').text('bookmark+');
        }else{$('#bookmark').text('bookmark-');}
    });

    $('#bookmark').click(function(){
      if(globalIndex==0 || globalIndex==1){
        plusTag();
      }else{

        var prevTab = $('.tab li').eq(globalIndex).prev();
        $('.tab li').eq(globalIndex).remove();
        $('.content li').eq(globalIndex).remove();

        prevTab.trigger("click");
      }
    });

    var bkNum = 1;
    function plusTag(){
      var tabName = 'BookMark_' + bkNum
      var comment = "This is picture. so,you can't draw anything. but,can save as picture by right-click"
      var html1 = '<li class="hide">'+tabName+'</li>';
      var html2 = '<li class="hide">'+comment+'<br><img id="bookMark'+bkNum+'"style="border:10px solid #ccc;"/></li>';
      $('ul.tab').append(html1);
      $('ul.content').append(html2);
      $('ul.tab li').slideDown("slow");
      chgImg();
      bkNum++;
    }

    function chgImg(){
      var imgId = "bookMark" + bkNum
      var cvs = document.getElementById("canvas-node");
      var png = cvs.toDataURL();
      document.getElementById(imgId).src = png;
    }

    $('#logButton').click(function(){
      if($('#logButton').text() == 'off'){
        var intervalNum = $('#logInterval').val();
        if(intervalNum <= 0){
          window.alert('0以下の間隔は指定できません。');
        }else{
          if(window.confirm('WhiteBoardのログ機能をONにします。\n間隔：'+intervalNum+'分')){
            $('#logButton').text('on');
            $('#logButton').css({'background':'#696969','color':'#fff'});
            document.getElementById("logInterval").disabled = "true";
            whiteboardfLogger(intervalNum);
          }
        }
      }else if($('#logButton').text() == 'on'){
        if(window.confirm('WhiteBoardのログ機能をOFFにします')){
          $('#logButton').text('off');
          $('#logButton').css({'background':'#ccc','color':'#000'});
          document.getElementById("logInterval").disabled = "";
          clearInterval(repeat);
        }
      }
    });
    var logNum = 0;
    function whiteboardfLogger(num){
      plusLog();
      var interval = num * 60000; 
      repeat = setInterval(function() {
        logNum++;
        plusLog();
      }, interval);
    }
    function plusLog(){
      var date = new Date();
      var html = '<div class="logThumb"><img id="log'+logNum+'"style="border:10px solid #ccc;" class="logImages"/>'+ date.toLocaleString() +'</div>';
      $('#whiteBoardLog').append(html);
      logImg();
    }
    function logImg(){
      var logId = "log" + logNum
      var cvs = document.getElementById("canvas-node");
      var png = cvs.toDataURL();
      document.getElementById(logId).src = png;
    }
});