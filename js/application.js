/**
 *
 * Application Controller for Meditation
 * @author: Anthony Su
 *
 *
 */

 var settings = {
                 	 instagram_token: '271434636.1a79b15.9cab33e1a24547d3ae9623253881652c' //access_token
                   , sc_token:  '0832d7b6bacfb836dafac90b0365b3f6' //client_id:
                   , count : 100
                   , default_tag : 'Sankeien'
                }

    , game
    , mode;


 $(document).ready(function() {

     preload();
     intro();
     SC.initialize({ client_id: settings.sc_token });
     playSomeMusic();
   

     var $tabs = $('.flyout');
         $tabs.hide();

     $('nav i').click(function(e){
        //0 1 2
        var index = $(this).parent().index()
          , $tab = $($tabs[index]);

        if($tab.is('.active')) {
          
          $tab.hide().removeClass('active')

        } else {
          $('.active').hide().removeClass('active');
          $tab.addClass('active').show();
        }

        e.stopPropagation();

     })

     $('body').click(function(){
       $('.active').hide().removeClass('active');
     })

     //stop click propagation on tabs
     $('.flyout').click(function(e){
       e.stopPropagation();
     });

     //color picker for cards
     $('#color_settings li').click(function(){
       game.set_card_background($(this).attr("class"));
     })

     //restart
     $('.icon-cw').click(function(){
        reload();
     })

     $(document).on("click",".icon-play-circle2",function(){
        reload();
     })

     $(document).on("click",".close",function(){

       $(this).parent().fadeOut(function(){
         $('#overlay').fadeOut()
       });
       
     });

     //game mode 
     $('#mode-1').click(function(){
       game.set_single_player();
     });

     $('#mode-2').click(function(){
       game.set_two_player();
     })

     $(document).on("click","#m1",function(){

        mode = "single-player";
       
     });

     $(document).on("click","#m2",function(){

        mode = "two-player";
       
     });

     $('#m1').click();//set default setting to single-player


 });

 function reload() {
    $('#overlay').fadeOut(function(){
       load_images(settings.default_tag,settings.count);
    });
 }

 function load_images(tag,count) {

     $('#loader').show();

      var instagram_url = 'https://api.instagram.com/v1/tags/' + tag + '/media/recent?callback=?&count='+ count;

      $.getJSON(instagram_url, { access_token:settings.instagram_token }, function(instagram) {

          if(instagram.meta.code == 200) {

              var img_arr = []
                , photos = instagram.data;

              for(var key in photos) {

                  var photo = photos[key];

                  img_arr.push(photo.images.thumbnail.url);

              }


              if(game == undefined) {

                game = new meditation('board',mode,img_arr);

              } else {

                game.restart(img_arr);

              }


          } else {
              throw("Error" + instagram.meta.code);
          }

      });


 }

 function playSomeMusic() { 
      //SC.get('/users/2772749/tracks', //olafur arnalds

          SC.oEmbed("https://soundcloud.com/olafur-arnalds", {maxheight: 395 , auto_play: true, color: "01a2ff"}, //ff0066
            document.getElementById("music"));
  }

  function intro() {

   $('#overlay').append( 
      '<div id="game-intro">'
     + 'Welcome! Meditation is a spin on the classic game of <a href="http://en.wikipedia.org/wiki/Concentration_(game)" target="_blank">Concentration</a>.  Match pairs of Instagram photos of the Japanese garden, <a href="http://en.wikipedia.org/wiki/Sankei-en" target="_blank">Sankei-en</a>, while listening to beautiful pieces composed by the post-classical musician, <a href="https://soundcloud.com/olafur-arnalds" target="_blank">Olafur Arnalds</a>. Time to relax.'
     + '<hr/>'
     + '<div class="card_frame">'
     +  'Back face:'
     + '<div class="holder">'
     +  '<div class="card">'
     +    '<div class="front face carbon_fibre">'
     +    '</div><img src="http://distilleryimage7.s3.amazonaws.com/f113510439ce11e28a7322000a1fa414_5.jpg" class="back face">'
     +  '</div>'
     +  '</div>'
     + '</div>'

     + '<div class="card_frame">'
     + 'Front face:'
     +  '<div class="holder done">'
     +  '<div class="card">'
     +    '<div class="front face carbon_fibre">'
     +    '</div><img src="http://distilleryimage7.s3.amazonaws.com/f113510439ce11e28a7322000a1fa414_5.jpg" class="back face">'
     +  '</div>'
     +  '</div>'
     + '</div>'

     + '<div style="display: inline-block;border-left: 1px solid #CCC;height: 130px;width: 210px;padding: 0 10px;text-indent: 0;">'
     +  '<strong>Game Play:</strong><br/>'
     +  'Cards start face down and clicking on a card will flip it over. '
     +  'Game ends when all cards have been matched.'
     + '</div>'

     +'<hr />'


    +'<h3 style>Select Game Mode</h3>'
    +'<ul>'
    +             '<li class="game_mode">'
    +              '<ul>'
    +                '<li><input id="m1" name="mode" type="radio"/> Single Player</li>'
    +                '<li>Race against time.</li>'
    +              '</ul>'
    +              '</li>'
    +             '<li class="game_mode">'
    +              '<ul>'
    +                '<li><input id="m2" name="mode" type="radio"/> Two Player</li>'
    +                '<li>Play against a friend.</li>'
    +                '<li>Match a pair and go again.</li>'
    +                '<li>Most pairs win.</li>'
    +              '</ul>'
    +              '</li>'
    +  '</ul>'
    +  '<div class="clearfix"></div>'
    +  '<hr/>'

    +  '<i class="icon-play-circle2" title="play"></i>'

    + '</div>'
     );
  }

  function preload() {
     var instagram_url = 'https://api.instagram.com/v1/tags/' + settings.default_tag + '/media/recent?callback=?&count='+ settings.count;
     $.getJSON(instagram_url, { access_token:settings.instagram_token }, function(instagram) {

          if(instagram.meta.code == 200) {

              var photos = instagram.data;

              for(var key in photos) {

                  var photo = photos[key];

                  $('<img/>')[0].src = photo.images.thumbnail.url;

              }

          } else {
              throw("Error" + instagram.meta.code);
          }

      });


 }
