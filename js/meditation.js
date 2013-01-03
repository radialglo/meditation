/**
 *
 * Meditation
 * @author: Anthony Su
 * 
 * Play Meditation by matching pictures!
 */

 function meditation(board_id,mode,images) {
  this.$board = $('#' + board_id);
  (mode === "single-player")? this.set_single_player() : this.set_two_player();
  this.setImages(images);
  this.generateBoard();
 }

 meditation.prototype = {
    min_cnt : 14//pairs
  , flip_count : 0
  , new_board : true
  , wait_time : 1000
  , mode : "single-player"
  , get_mode : function() {
    return this.mode;
  }
  , set_single_player : function() {
    $('#mode-1').attr("checked",true);
    this.mode = "single-player";
  }
  , set_two_player : function() {
    $('#mode-2').attr("checked",true);
    this.mode = "two-player";
  }
  , card_one : ""
  , set_card_one : function(val) {
    this.card_one = val;
  }
  , card_two : ""
  , set_card_two : function(val) {
    this.card_two = val;
  }
  , cardsEqual : function() {
     return this.card_one === this.card_two;
  }
  , card_bg : "carbon_fibre"
  , get_card_background : function() {
    return this.card_bg;
  }
  , set_card_background : function(bg) {

    var self = this;

    $('.front').removeClass(self.get_card_background()).addClass(bg);
    self.card_bg = bg;
  } 
  , get_flip_count : function() { //[0-2]
    return this.flip_count;
  }
  , increment_flip_count : function() {
    this.flip_count++;
  }
  , reset_flip_count : function() {
    this.flip_count = 0;
  }
  , reset_flips : function() {

     setTimeout((function(game){

        return function() {
          
          $('.flip').removeClass('flip');
           game.reset_flip_count();
        };

     })(this),this.wait_time);

  }
  , pair_count : 0 //indicates number of correct pairs
  , increment_pair_count : function() {
    this.pair_count++;
  }
  , reset_pair_count : function() {
    this.pair_count = 0;
  } 
  , gameOver : function() {
    return this.pair_count == this.min_cnt;
  }

 	, setImages : function(arr) {
   /*
    * @param arr - array of images
    * Because meditation is implemented here on a 7 * 4 board, 14 images should be provided
    */

    if(arr.length >= this.min_cnt) {

 		  arr = shuffle(arr).slice(0, this.min_cnt);

      arr.forEach(function(url){
        arr.push(url);
      })

      this.image_list = shuffle(arr);

    } else {
      throw("There must be a minimum of " + this.min_cnt + " images provided.");
    }
 	
  }

  , getImages : function() {
 		 return this.image_list;
 	}

  , get_board: function() {
    return this.$board;
  }

  , generateBoard : function() {

     var $board = this.get_board()
       , photos = this.getImages()
       , game = this;

     if(this.new_board) {

         for(var i = 0; i < photos.length; i++) {

         (function(src,index) {

             $board.append(

                    $('<div/>').addClass('holder').append(
                      $('<div/>').addClass('card').append(
                          $('<div/>').addClass('front face')
                        , $('<img/>').attr({'src' : src}).addClass('back face')
                      )
                    ).click(function(){ 
                      game.card_handler(this,src,index); 

                    })//end click
              );
           })(photos[i],i)

        }//end for loop

        $('.front').addClass(game.get_card_background());

        this.new_board = false;

      } else {


        $('.holder').each(function(index){

            $(this).find('img').attr('src',photos[index]).end()
                   .off("click")
                   .click(function(){ 

                game.card_handler(this,photos[index],index); 

            });

        })


      }//end else

      switch(this.mode) {
          case "single-player" :
            this.initialize_single_player();
            break;
          case "two-player" :
            this.initialize_two_player();
            break;
          default :
            throw("Invalid game mode selected");
      }

     //after all handlers are prepared
     //wait for all images to load before game play
     $('img').load(function(){
                 $('#loader').hide();
     })


  }

  , card_handler : function(card,src,index) {


                $card = $(card);

                if( !$card.hasClass('flip') && this.get_flip_count() < 2 ) {

                    $card.toggleClass('flip');
                    this.increment_flip_count();
                    
                    if(this.get_flip_count() === 1) {
                       this.set_card_one(src);
                    }
                  

                    if(this.get_flip_count() === 2) {

                      this.set_card_two(src);

                       //if card 1 matches card 2 don't flip back, just display cards
                      if(this.cardsEqual()) {

                        $('.flip').addClass('done')
                                  .removeClass('flip')
                                  .off("click");

                        this.reset_flip_count(); //resets count but does not flip back cards

                        this.increment_pair_count();

                        if(this.get_mode() === "two-player") {
                          if(this.is_turn_one()) {
                            this.increment_score_one();
                          } else {
                            this.increment_score_two();
                          }
                        }

                        if(this.gameOver()) {

                         if(this.get_mode() === "two-player") {

                           var result_info =
                            '<div class="info">'
                            + '<hr/>';

                            if(this.is_tie()) {
                              result_info += '<i class="icon-user orange"></i>' 
                                          +  '<i class="icon-user orange_red"></i>' 
                                          +  'Tie Game';
                            } else if(this.player_one_wins()) {
                              result_info +=  '<i class="icon-user orange">Wins</i>' ;
                            } else {
                              result_info += '<i class="icon-user orange_red">Wins</i>' 
                            }

                            $('#overlay').text("").append(
                            result_info
                            +  '<hr/>'
                            +  '<i class="icon-play-circle2" title="Play Again"></i>'
                            +  '<i class="icon-cancel close" title="Close"></i></div>'
                            + '</div>'
                            ).fadeIn();

                         } else {
                           $('#overlay').text("").append(
                             '<div class="info">'
                            +  '<hr/>'
                            +    '<i class="icon-trophy"></i>'
                            +  '<hr/>'
                            +    'Puzzle Solved!' 
                            +    ' Time: '
                            +    '<span class="time">'+ $('#clock').text() +'</span>'
                            +  '<hr/>'
                            +  '<i class="icon-play-circle2" title="Play Again"></i>'
                            +  '<i class="icon-cancel close" title="Close"></i>'

                             ).fadeIn();
                         }

                        }


                      } else {

                      //otherwise flip back currently selected cards
                      this.reset_flips();

                      if(this.get_mode() === "two-player" ) {
                        this.change_turns();
                      }

                     }

                     

                   }//end two flip count


                 }//end if
   }
   /*==== SINGLE PLAYER ====*/
   , start_time : ""
   , initialize_single_player: function(){
     $('#scoreboard').text("").append(
         "<div id='clock'>"
       + "<span id='min'>00</span><em>:</em><span id='sec'>00</span><em>:</em><span id='centisec'>00</span>"
       + "</div>"
     );

     this.start_watch();
   }
   , start_watch : function(){
     this.start_time = (new Date()).getTime();
     this.count();
   }
   , count: function() {
    //base = 10ms

    (function(self){

      if(self.gameOver()) {
        return;
      } else {

      var diff_time = (new Date()).getTime() - self.start_time
        , min = Math.floor(diff_time / 60000) //60 sec * 1000 ms/sec
        , sec = Math.floor((diff_time % 60000)/1000) //ms remaining / 1000 ms/sec
        , centisec = Math.floor((diff_time % 1000)/10); //remaining ms converted to centisec ; 1 centisec = 10 ms


      $('#sec').text(sec.toString().replace(/^(\d)$/,"0$1"));
      $('#min').text( min.toString().replace(/^(\d)$/,"0$1"));
      $('#centisec').text(centisec.toString().replace(/^(\d)$/,"0$1"));

            setTimeout(function(){self.count()},10); //10
      }

    }
    )(this)

  }
   /*==== END SINGLE PLAYER ====*/


   /*==== TWO PLAYER ====*/
   , turn_one : true
   , is_turn_one : function() {
     return this.turn_one;
   }
   , player_one_wins : function() {
     return this.player_one_score > this.player_two_score;
   }
   , is_tie : function() {
     return this.player_one_score === this.player_two_score;
   }
   , initialize_two_player : function() {

      $('#scoreboard').text("").append(
           "<i id='player_one' class='icon-user' ></i>"
         + "<span id='score_one' class='score' >0</span>"

         + "<i id='player_two' class='icon-user'></i>"
         + "<span id='score_two' class='score'>0</span>"
       );


       var self = this;
       self.turn_one = true;
       self.reset_flip_count();
       self.reset_scores();
       setTimeout(function(){
         $('#player_one').animate({opacity : 1});
         $('#player_two').animate({opacity : 0.3});
       },self.wait_time);
   }
   , change_turns : function() {

     var self = this;
     this.turn_one = !this.turn_one;

     if(this.is_turn_one()) {

       setTimeout(function(){
         $('#player_one').animate({opacity : 1});
         $('#player_two').animate({opacity : 0.3});
       },self.wait_time);

     } else {

       setTimeout(function(){
         $('#player_one').animate({opacity : 0.3});
         $('#player_two').animate({opacity : 1});
       },self.wait_time);

     }

   }

   , player_one_score : 0
   , player_two_score : 0
   , increment_score_one : function() {
     this.player_one_score++;
     this.update_score_one();
   }
   , increment_score_two : function() {
     this.player_two_score++;
     this.update_score_two();
   }
   , update_score_one : function() {

     $('#score_one').text(this.player_one_score);
     
   }
   , update_score_two : function() {

     $('#score_two').text(this.player_two_score);

   }
   , reset_scores : function() {
     this.player_one_score = 0;
     this.player_two_score = 0;
     this.update_score_one();
     this.update_score_two();
   }

   /*==== END TWO PLAYER ====*/

   , restart : function (img_arr) {

        $('holder').off("click");
        $('.done').removeClass('done');
        $('.flip').removeClass('flip');

        var self = this;
        self.reset_pair_count();
        setTimeout(function() {
            self.setImages(img_arr);
            self.generateBoard();
       },self.wait_time * 2);
   }

 
 }//end Meditation


function shuffle(arr) {
/*
 Fisher-Yates_shuffle
 To shuffle an array a of n elements (indices 0..n-1):
  for i from n − 1 downto 1 do
       j ← random integer with 0 ≤ j ≤ i
       exchange a[j] and a[i]
 */	

  var j , temp;
  for(var i = arr.length - 1; i > 0; i-- ) {
  	
  	j = Math.floor( Math.random() * i );

  	 temp = arr[j];
  	 arr[j] = arr[i];
  	 arr[i] = temp;
  }

  return arr;
}
