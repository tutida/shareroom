$(function() {

  $('#palette').draggable();

  $('#palette-open').on('click', function(e){
    $('#palette').animate({height: "toggle", opacity: "toggle"},"slow");
  });

  $('.paletteTab li').click(function(){
    var index = $('.paletteTab li').index(this);
    if(index !== 3){
      $('.paletteTab li').removeClass('select');
      $(this).addClass('select')
    }

    switch(index){
      case 0:
        if($('#tool').css('display') == 'block'){
          $('#tool').css('display','none')
          input_text = false;
        }
        if($('#options').css('display') == 'block') $('#options').css('display','none');
        break;
      case 1:
        if($('#tool').css('display') == 'none'){
          $('#tool').css('display','block')
          input_text = true;
        }
        if($('#options').css('display') == 'block') $('#options').css('display','none');
        break;
      case 2:
        $('#options').css('display','block')
        break;
      case 3:
        $('#palette').animate({height: "toggle", opacity: "toggle"},"slow");
        break;
    }
  });

  $( "#styleRadio" ).buttonset();

  function hexFromRGB(r, g, b) {
    var hex = [
      r.toString( 16 ),
      g.toString( 16 ),
      b.toString( 16 )
    ];
    $.each( hex, function( nr, val ) {
      if ( val.length === 1 ) {
        hex[ nr ] = "0" + val;
      }
    });
    return hex.join( "" ).toUpperCase();
  }

  function refreshSwatch() {
    var red = $( "#redslider" ).slider( "value" ),
      green = $( "#greenslider" ).slider( "value" ),
      blue = $( "#blueslider" ).slider( "value" ),
      hex = hexFromRGB( red, green, blue );
    $( "#swatch" ).css( "background-color", "#" + hex );
  }

  $(function() {
    $( "#redslider, #greenslider, #blueslider" ).slider({
      orientation: "horizontal",
      range: "min",
      max: 255,
      value: 127,
      slide: refreshSwatch,
      change: refreshSwatch
    });
    $( "#redslider" ).slider( "value", 0 );
    $( "#greenslider" ).slider( "value", 0 );
    $( "#blueslider" ).slider( "value", 0 );
  });
  
  $( "#colorRadio" ).buttonset();

  $( "#colorRadio input" ).click(function () {
    var data = $("input[name='colorRadio']:checked").val();
    var rgb = (new Function("return " + data))();
    $( "#redslider" ).slider( "value", rgb.r );
    $( "#greenslider" ).slider( "value", rgb.g );
    $( "#blueslider" ).slider( "value", rgb.b );
  });

  $('#lineslider').slider({
    range: "min",
    min: 1,
    max: 100,
    value: 10,
    slide: function( event, ui ) {
      $( "#amount" ).val( ui.value );
    }
  });

  $('#amount').change(function () {
    $('#lineslider').slider('value',$('#amount').val());
  });

  $('#clear-button,#resize-button')
    .button()
    .click(function( event ){
      $(this).prevAll('div').animate({height: "toggle", opacity: "toggle"},"slow");
    });

  $('#confirm-clear a,#confirm-resize a')
    .button()
    .click(function( event ){
      var ans = $(this).context.textContent
      var parentId = $(this).parent().attr("id")
      if(ans == 'yes'){
        switch(parentId){
        case 'confirm-clear':
          clickClear();
          break;
        case 'confirm-resize':
          clickResize();
          break;
        }
      }
      $(this).parent().animate({height: "toggle", opacity: "toggle"},"fast");
    });

  function clickClear(){
    socket.emit("clickClear",minichat.roomId);
  }

  function clickResize(){
    var nW = document.getElementById('resizeWidth').value;
    var nH = document.getElementById('resizeHeight').value;
    socket.emit("clickResize",{width: nW, height: nH, roomId: minichat.roomId});
  }
});