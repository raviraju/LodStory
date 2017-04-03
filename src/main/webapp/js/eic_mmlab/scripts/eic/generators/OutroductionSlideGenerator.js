/*!
 * EIC OutroductionSlideGenerator
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['lib/jquery', 'eic/generators/BaseSlideGenerator', 'eic/TTSService', 'config/URLs', 'lib/jvent'],
function ($, BaseSlideGenerator, TTSService, urls, EventEmitter) {
  "use strict";

	var tts = new TTSService();
  /*
   * CLEANUP
   * Add Path
   **/

  /** Generator that creates outroductory slides */
  function OutroductionSlideGenerator(hashID, endTopic, options) {

    BaseSlideGenerator.call(this);

    this.hash_object = endTopic;		//used to be known as 'endTopic'
    this.duration = options.duration || 1000;
	this.exitButtons = options.outroButtons || [];
	this.hashID = hashID;
    this.ready=false;
  }

  $.extend(OutroductionSlideGenerator.prototype,
           BaseSlideGenerator.prototype,
  {
      init: function () {
        if (!this.inited) {
          var self = this;
          self.createSpeech();
          this.inited = true;
        }
      },

      /** Checks whether the outro slide has been shown. */
      hasNext: function () {
        return this.done !== true;
      },

      /** Advances to the outro slide. */
      next: function () {
        if (!this.hasNext())
          return;

        var self = this,
            $outro = $('<h1>').text("The End."),
            slide = this.createBaseSlide('outro', $outro, this.duration);
        slide.once('started', function () {
          setTimeout(function () {
				addNavigation($outro.parent(), self.exitButtons);
				if (self.hashID)
					addRating($outro.parent(), self);
          }, 500);
        });
        slide.audioURL = this.audioURL;
		slide.audio_text = this.hash_object.audio_text;

        this.done = true;

        return slide;
      },

      createSpeech: function () {
        var self = this,
			 tts = new TTSService();

        var text = "  The end!"

		self.hash_object.audio_text=text;
        tts.getSpeech(text, 'en_GB', function (response) {
          self.audioURL = response.snd_url;
          self.ready=true;
          self.emit('newSlides');
        });
      },

      resendSpeech: function(text) {
		var self = this,
			 tts = new TTSService();
		self.hash_object.audio_text=text;
		this.ready=false;
        tts.getSpeech(text, 'en_GB', function (response) {
			self.audioURL = response.snd_url;
			self.ready=true;
			self.emit('newSlides');
		});
	  }
    });

  function addNavigation($container, exitButtons) {
    var $nav = $('<div />')
    .addClass('navigation')
    .appendTo($container);

    for (var i=0; i<exitButtons.length; i++){
		exitButtons[i].appendTo($nav);
	}	
  }
  
  function addRating($container, self){
	var $rate = $('<div />')
	.addClass('rating')
	
	var button =  $('<span>')
			.addClass('button')
			.click(function (){
				$rate.html("Thanks for rating!");
				$.ajax({
					url: urls.hashRate,	
					type: 'POST',
					data: {hashID: self.hashID, vote: true},
				});
			})
			.html('<img src="images/ThumbsUp.png">');
	button.appendTo($rate);
	
	var button =  $('<span>')
			.addClass('button')
			.click(function (){
				$rate.html("Thanks for rating!");
				
				$.ajax({
					url: urls.hashRate,	
					type: 'POST',
					data: {hashID: self.hashID, vote: false},
				});
			})
			.html('<img src="images/ThumbsDown.png">');
	button.appendTo($rate);
	
	$container.append($('<h2>').text('Rate:'), $rate);
  }

  function addShares($container, self) {
    var $buttons = $('<div>', {'class': 'share'});
    $container.append($('<h2>').text('Share:'), $buttons);
  }

  return OutroductionSlideGenerator;
});
