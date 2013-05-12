/**
 *
 * Meditation
 * @author: Anthony Su
 * 
 * Play Meditation by matching pictures!
 */

  function Meditation(board_id, mode, images) {

    this.$board = $('#' + board_id);

     if (mode === "single-player")  {
      $('#mode-1').attr("checked",true);
    } else {
       $('#mode-2').attr("checked",true);
    }

    //settings specific to this instance
    this.settings =  (function() {

      //default background
      var card_background = "carbon_fibre";

      return {

        //mode
          set_single_player : function() {
          mode = "single-player";
        }
        , is_single_player : function() {
          return mode ===  "single-player";
        }
        , set_two_player : function() {
          mode = "two-player";
        }
        , is_two_player : function() {
          return mode === "two-player";
        }
       
        //board background
        , get_card_background : function() {
          return card_background;
        }
        , set_card_background : function(bg) {
          $('.front').removeClass(this.get_card_background()).addClass(bg);
          card_background = bg;
        } 

      };

    }());

    this.new_board = true;
    this.started = false;
    this.setImages(images);
    this.generateBoard();


  }

  Meditation.prototype = {

    min_count : 14 //pairs
  , wait_time : 1000 //ms
  , set_card_one : function(val) {
    this.card_one = val;
  }
  , set_card_two : function(val) {
    this.card_two = val;
  }
  , cardsEqual : function() {
     return this.card_one === this.card_two;
  }
  // flip count indicates if we have have flipped two cards
  // and is used to trigger card checking
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

     setTimeout((function(game) {

        return function() {
          
          $('.flip').removeClass('flip');
           game.reset_flip_count();
        };

     })(this),this.wait_time);

  }
  //pair_count indicates number of correct pairs
  , increment_pair_count : function() {
    this.pair_count++;
  }
  , reset_pair_count : function() {
    this.pair_count = 0;
  } 
  , gameOver : function() {
    return this.pair_count == this.min_count;
  }
   /* 
    * setImages
    * 
    * @param arr - array of images
    * Because meditation is implemented here on a 7 * 4 board, 14 images should be provided
    */
  , setImages : function(arr) {


    if(arr.length >= this.min_count) {

      arr = shuffle(arr).slice(0, this.min_count);

      arr.forEach(function(url){
        arr.push(url);
      })

      this.image_list = shuffle(arr);

    } else {
      throw("There must be a minimum of " + this.min_count + " images provided.");
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
      , photos = this.getImages();

    this.reset_pair_count();
    this.reset_flip_count();

    if(this.new_board) {

      var $fragment =  $(document.createDocumentFragment());

      for(var i = 0; i < photos.length; i++) {

           $fragment.append(
                   $('<div/>').addClass('holder').append(
                      $('<div/>').addClass('card').append(
                          $('<div/>').addClass('front face')
                        , $('<img/>').attr({'src' : photos[i]}).addClass('back face')
                      )
                    )
                   .data('index', i)
              );

        }//end for loop

        $board.append($fragment);

        this.attach_card_handler();
        this.settings.set_card_background(this.settings.get_card_background());

        this.new_board = false;

    } else {

      // only need update image source
      // because handler only needs to be attached once
      $('.holder').each(function(index) {

          $(this).find('img').attr('src',photos[index])

      });


    }

     //after all handlers are prepared
     //wait for all images to load before game play

    var self = this;

    $('img').load(function() {


      if(self.settings.is_single_player()) {

            self.initialize_single_player();

      } else if (self.settings.is_two_player()) {

            self.initialize_two_player();

      } else {
            throw("Invalid game mode selected");
      }

      $('#loader').hide();

    self.started = true;

   });


  }

  , attach_card_handler : function() {

    var game = this
      , $board = this.get_board();

    //event delegation
    $board.on('click','.holder',function() {

      var $card = $(this)
        , idx = $card.data('index')
        , photos = game.getImages()
        , photo = photos[idx];

      if(game.started && !($card.hasClass('flip') || $card.hasClass('done'))  && game.get_flip_count() < 2 ) {

          $card.toggleClass('flip');
          game.increment_flip_count();
          
          if(game.get_flip_count() === 1) {
            game.set_card_one(photo);
          }
        
          if(game.get_flip_count() === 2) {

            game.set_card_two(photo);

             //if card 1 matches card 2 don't flip back, just display cards
            if(game.cardsEqual()) {

              $('.flip').addClass('done')
                        .removeClass('flip');

              //resets count but does not flip back cards
              game.reset_flip_count(); 

              game.increment_pair_count();

              if(game.settings.is_two_player()) {
                if(game.is_turn_one()) {
                  game.increment_score_one();
                } else {
                  game.increment_score_two();
                }
              }

              if(game.gameOver()) {

                game.display_results();
                game.started = false;

              }//end if game over


            } else {

            //otherwise flip back currently selected cards
            game.reset_flips();

            if(game.settings.is_two_player()) {
              game.change_turns();
            }

           }

         }//end two flip count

       }//end if game started

      });// end event delegation
   }
   /*==== SINGLE PLAYER ====*/
   , initialize_single_player: function() {
     $('#scoreboard').text("").append(
         "<div id='clock'>"
       + "<span id='min'>00</span><em>:</em><span id='sec'>00</span><em>:</em><span id='centisec'>00</span>"
       + "</div>"
     );

     this.start_watch();
   }
   , start_watch : function() {
     this.start_time = (new Date()).getTime();
     this.count();
   }
   , count: function() {
     //base = 10ms

     (function(self) {

       if(self.gameOver()) {
         return;
       } else {

       var diff_time = (new Date()).getTime() - self.start_time
        , min = Math.floor(diff_time / 60000) //60 sec * 1000 ms/sec
        , sec = Math.floor((diff_time % 60000)/1000) //ms remaining / 1000 ms/sec
        , centisec = Math.floor((diff_time % 1000)/10); //remaining ms converted to centisec ; 1 centisec = 10 ms


      $('#sec').text(sec.toString().replace(/^(\d)$/,"0$1"));
      $('#min').text(min.toString().replace(/^(\d)$/,"0$1"));
      $('#centisec').text(centisec.toString().replace(/^(\d)$/,"0$1"));

            setTimeout(function(){self.count()},10); //10
      }

    })(this);

   }
   /*==== END SINGLE PLAYER ====*/


   /*==== TWO PLAYER ====*/
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

      $('#scoreboard').html("").append(
           "<i id='player_one' class='icon-user' ></i>"
         + "<span id='score_one' class='score' >0</span>"

         + "<i id='player_two' class='icon-user'></i>"
         + "<span id='score_two' class='score'>0</span>"
       );

       this.turn_one = true;
       this.reset_pair_count();
       this.reset_scores();

       setTimeout(function() {
         $('#player_one').animate({opacity : 1});
         $('#player_two').animate({opacity : 0.3});
       },this.wait_time);
   }
   , change_turns : function() {

     this.turn_one = !this.turn_one;

     setTimeout((function(game) {

       if(game.is_turn_one()) {
         $('#player_one').animate({opacity : 1});
         $('#player_two').animate({opacity : 0.3});

       } else {

         $('#player_one').animate({opacity : 0.3});
         $('#player_two').animate({opacity : 1});

       }
     })(this),this.wait_time);

   }

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
   , display_results: function() {

      if(this.settings.is_two_player()) {

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

          $('#overlay').html("").append(
          result_info
          +  '<hr/>'
          +  '<i class="icon-play-circle2" title="Play Again"></i>'
          +  '<i class="icon-cancel close" title="Close"></i></div>'
          + '</div>'
          ).fadeIn();

       } else {
         $('#overlay').html("").append(
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
   , restart : function (img_arr) {

        this.started = false;

        $('.done').removeClass('done');
        $('.flip').removeClass('flip');

        var self = this;
        setTimeout(function() {
            self.setImages(img_arr);
            self.generateBoard();
       },self.wait_time * 2);
   }

 
 }//end Meditation


/*
 * shuffle
 *
 * uses Fisher-Yates_shuffle
 * To shuffle an array a of n elements (indices 0..n-1):
 * for i from n − 1 downto 1 do
 *      j ← random integer with 0 ≤ j ≤ i
 *      exchange a[j] and a[i]
 */  
function shuffle(arr) {

  var j , temp;
  for(var i = arr.length - 1; i > 0; i-- ) {
  	
  	j = Math.floor( Math.random() * i );

  	 temp = arr[j];
  	 arr[j] = arr[i];
  	 arr[i] = temp;
  }

  return arr;
}
