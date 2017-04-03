/**
 * @author Dipa
 */
define(['lib/jquery', 'eic/Logger', 'eic/TTSService',
  'eic/generators/CompositeSlideGenerator', 'eic/generators/GoogleImageSlideGenerator',
  'eic/generators/GoogleMapsSlideGenerator', 'eic/generators/TitleSlideGenerator', 'eic/generators/YouTubeSlideGenerator'],
  function ($, Logger, TTSService,
    CompositeSlideGenerator, GoogleImageSlideGenerator,
    GoogleMapsSlideGenerator, TitleSlideGenerator, YouTubeSlideGenerator) {
    "use strict";
    var logger = new Logger("CustomSlideGenerator");

    /*
    * CLEANUP
    **/

    function CustomSlideGenerator(topic, hash_object, options) {
      CompositeSlideGenerator.call(this);

      this.hash_object = hash_object;
      this.generators = [];
      this.topic = topic;
      this.durationLeft = 0;
      this.audioURL ='';
      this.audio = true;
	  
	  options = options || {};
	  this.videoOptions = options.videoOptions || {};
	  this.maxImages = options.maxImages;
      
      this.generatorsHash = {}; //take care of this
      
      //stuff
      this.curSlide = null;
      this.slides = [];
	  this.slidesCopy =[];
      //this.editedSlides = [];
    }

    $.extend(CustomSlideGenerator.prototype,
             CompositeSlideGenerator.prototype,
      {
        /** Checks whether at least one child generator has a next slide. */
        hasNext: function () {
          if(this.curSlide != null) return true;
          else return false;
        },

        /** Initialize all child generators. */
        init: function () {
          if (this.inited)
            return;

          //Create all generators depending on the type of the topic
          switch (this.topic.type) {
          case "http://dbpedia.org/ontology/PopulatedPlace":
            this.addCutomGenerator(new GoogleImageSlideGenerator(this.topic, this.maxImages), false, "img");
            this.addCustomGenerator(new YouTubeSlideGenerator(this.topic, this.videoOptions), false, "vid");
            this.addCustomGenerator(new GoogleMapsSlideGenerator(this.topic), false, "img");
            break;
          default:
            this.addCustomGenerator(new GoogleImageSlideGenerator(this.topic, this.maxImages), false, "img");
            this.addCustomGenerator(new YouTubeSlideGenerator(this.topic, this.videoOptions), false, "vid");
            break;
          }

          var tts = new TTSService();
          var self = this;
          tts.once('speechReady', function (event, data) {
            self.durationLeft = Math.floor(data.snd_time);
            //Add extra time because IE definitely needs a plugin, which takes time to embed
            if (navigator.userAgent.indexOf('MSIE') !=-1)
				self.durationLeft +=5000;
						
            self.audioURL = data.snd_url;
			
			self.hash_object.audio_time = self.durationLeft;
			self.hash_object.audioURL = self.audioURL;
			
            logger.log('Received speech for topic', self.topic.label);
            self.ready=true;
            self.audio=true;
            // When speech is received, 'remind' the presenter that the slides are ready
            self.emit('newSlides');
			self.emit('newSpeech');
          });
          
          //Fallback if speech fails is to simply make the slide play 5 seconds of silence...at least there will be pictures
			tts.once('speechError', function(event, data){
				self.durationLeft = 10000;
				self.hash_object.audio_time = self.durationLeft;
				
				self.audioURL = null;
				logger.log('Failed to receive speech for topic', self.topic.label);
				self.ready=true;
				self.audio=false;
				// When speech is received, 'remind' the presenter that the slides are ready
				self.emit('newSlides');
			});
			
          logger.log('Getting speech for topic', this.topic.label);
          tts.getSpeech(this.hash_object.audio_text, 'en_GB');

          this.inited = true;
        },
        
        addCustomGenerator: function (generator, suppressInit, type) {        	
        	// initialize the generator and add it to the list
      		if (!suppressInit) generator.init();
      		this.generators.push(generator);
      		switch (type) {
      			case "img":
      				this.generatorsHash["img"] = generator;
      			case "vid":
      				this.generatorsHash["vid"] = generator;
      		}
      		// signal the arrival of new slides
      		generator.on('newSlides', this.emitNewSlidesEvent);
      		if (generator.hasNext())
        		this.emitNewSlidesEvent();
        },
        
        resendSpeech: function(text){
			if (this.hash_object.audio_text==text){
				return;
			}
			
			//Reset the ready variable and the audioURLs
			this.ready=false;
			this.audioURL = '';
			this.hash_object.audioURL = '';
			
			var self = this,
				tts = new TTSService();
			tts.once('speechReady', function (event, data) {
				self.durationLeft = Math.floor(data.snd_time);
				//Add extra time because IE definitely needs a plugin, which takes time to embed
				if (navigator.userAgent.indexOf('MSIE') !=-1)
					self.durationLeft +=5000;
					
				self.audioURL = data.snd_url;
				
				self.hash_object.audio_time = self.durationLeft;
				self.hash_object.audioURL = self.audioURL;				
				
				logger.log('Received speech for topic', self.topic.label);
				self.ready=true;
				self.audio=true;
				// When speech is received, 'remind' the presenter that the slides are ready
				self.emit('newSlides');
				self.emit('newSpeech');
			});
			
			//Fallback if speech fails is to simply make the slide play 5 seconds of silence...at least there will be pictures
			tts.once('speechError', function(event, data){
				self.durationLeft = 10000;
				self.hash_object.audio_time = self.durationLeft;
				
				self.audioURL = null;
				logger.log('Failed to receive speech for topic', self.topic.label);
				self.ready=true;
				self.audio = false;
				// When speech is received, 'remind' the presenter that the slides are ready
				self.emit('newSlides');
			});
			
			logger.log('Getting speech for topic', this.topic.label);
			tts.getSpeech(text, 'en_GB');	
			this.hash_object.audio_text=text;
		},
        updateHash: function(){
			var slide_count=0;
			var generator, slide;
					
			for (var i = 0; i < this.generators.length; i++){
				slide_count+=this.generators[i].slides.length;
			}
			
			if (!this.hash_object.slide_description){
				this.hash_object.slide_description = [];
				// randomly pick a generator and select its next slide					
				for (var i=0; i<slide_count && this.durationLeft >0 ; i++){
					do {
						generator = this.generators[Math.floor(Math.random() * this.generators.length)];
					} while (!generator.hasNext())
					slide= generator.next();				
					this.hash_object.slide_description.push(slide.slide_info);
					this.durationLeft -= slide.slide_info.data.duration;
				}
				this.hash_object.temp = true;
			}
			else{
				for (var i=0; i< this.generators.length; i++){
					while (this.generators[i].hasNext()){
						slide = this.generators[i].next();
						this.hash_object.slide_description.push(slide.slide_info);
					}
				}				
			}
			
		},
		reset: function() {
			console.log("reset");
			this.durationLeft = this.hash_object.audio_time;
			for (var i=0; i < this.generators.length; i++){
				this.generators[i].reset();
			}
		},
        prepare: function () {
          this.curSlide = new TitleSlideGenerator(this.topic).demo();
          this.curSlide.audioURL = this.audioURL;

          // prepare other generators
          this.generators.forEach(function (g) { g.prepare(); });

          //add all the slides for each generator
          for(var val in this.generatorsHash){
          	var s = [];
          	for(var i = 0; i< this.generatorsHash[val].slides.length; i++){
          		s.push(this.generatorsHash[val].slides[i]);
          	}
          	this.slides[val] = s;
          }
          	
          logger.log('Added slides on ', this.topic.label);
        },
        
        next: function () {
        	return this.curSlide;
        },
        
        
        getSlides: function() {
        	return this.slides;
        },
        
//        getEditedSlides: function(){
//        	return this.editedSlides;
//        },
//
//        setEditedSlide: function(newSlide){
//        	var present = false;
//        	for(var i = 0; i < this.editedSlides.length; i++){
//        		if(this.editedSlides[i] == newSlide) present = true;
//        	}
//        	if(!present) this.editedSlides.push(newSlide);
//        },
//
//        deleteEditedSlide: function(i){
//        	this.editedSlides.splice(i, 1);
//        },
        
        setCurSlide: function (slide) {
        	this.curSlide = slide;	
        },
        
        getTest: function () {
        	return this.testSlides;
        }
      });
    return CustomSlideGenerator;
  });


