/*!
 * EIC IntroductionSlideGenerator
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['lib/jquery', 'eic/generators/CompositeSlideGenerator', 'eic/generators/TitleSlideGenerator',
        'eic/generators/FBProfilePhotosGenerator', 'eic/TTSService', 'lib/jvent'],
  function ($, CompositeSlideGenerator, TitleSlideGenerator, FBProfilePhotosGenerator, TTSService, EventEmitter) {
    "use strict";
	
    var texts = {
      connected: " Is Connected",
      intro: "Once upon a time, $who wondered how $topic was connected to everything in this world. ",
      facebook: "You see, according to $his Facebook profile, $who likes $like. ",
    };
    
    var tts=new TTSService();

    /** Generator that creates introductory slides */
    function IntroductionSlideGenerator(startTopic, profile) {
      if (!startTopic)
        throw "The IntroductionSlideGenerator has no starttopic";

      CompositeSlideGenerator.call(this);
      this.slides = [];
      this.profile = profile;
      this.hash_object = startTopic;
      this.ready=false;
    }

    $.extend(IntroductionSlideGenerator.prototype,
      CompositeSlideGenerator.prototype, {
        init: function () {
          if (!this.inited) {
            this.createSpeech();
            this.createIntroSlideGenerators();
            this.inited = true;
          }
        },

        next: function () {
          // Get slide from parent generator and attach audio URL if necessary
          var slide = CompositeSlideGenerator.prototype.next.apply(this);
          if (this.audioURL) {
            slide.audioURL = this.audioURL;
			slide.audio_text = this.hash_object.audio_text;
            delete this.audioURL;
          }
          return slide;
        },

        createIntroSlideGenerators: function () {
          if (this.profile) {
            this.addGenerator(new TitleSlideGenerator(this.profile.first_name + texts.connected, 5000));
            this.addGenerator(new FBProfilePhotosGenerator(this.profile, 5));
          }
          else {
            this.addGenerator(new TitleSlideGenerator(this.hash_object.name + texts.connected, 8000));
          }
        },

        createSpeech: function () {
          // Create text
          var text = texts.intro;
          if (!this.profile) {
            text = text.replace(/\$who/g, "people")
                       .replace(/\$topic/g, this.hash_object.name);
          }
          else {
            var gender = this.profile.gender === 'male' ? 0 : 1;
            text += texts.facebook;
            text = text.replace(/\$who/g, this.profile.first_name)
                       .replace(/\$topic/g, ['he', 'she'][gender])
                       .replace(/\$his/g, ['his', 'her'][gender])
                       .replace(/\$like/g, this.startTopic.name);
          }
		  this.hash_object.audio_text=text;
		  
          // Create audio
          var self = this,
			 tts = new TTSService();
          tts.getSpeech(text, 'en_GB', function (response) {
            self.audioURL = response.snd_url;
            self.ready=true;
            self.emit('newSlides'); 
          });
        },
        
        resendSpeech: function(text){
			var self = this,
				tts = new TTSService();
			this.hash_object.audio_text=text;
			this.ready=false;
			tts.getSpeech(text, 'en_GB', function (response) {
				self.audioURL = response.snd_url;
				self.hash_object.audio_time = Math.floor(response.snd_time);
				self.ready=true;
				self.emit('newSlides');
			});
		},
      });

    return IntroductionSlideGenerator;
  });
