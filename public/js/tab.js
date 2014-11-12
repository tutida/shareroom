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
});