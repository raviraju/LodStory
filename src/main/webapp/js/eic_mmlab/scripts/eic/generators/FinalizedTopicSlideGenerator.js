define(['lib/jquery', 'eic/Logger', 'eic/TTSService',
  'eic/generators/CompositeSlideGenerator', 'eic/generators/GoogleImageSlideGenerator',
  'eic/generators/GoogleMapsSlideGenerator', 'eic/generators/TitleSlideGenerator', 'eic/generators/YouTubeSlideGenerator'],
  function ($, Logger, TTSService,
    CompositeSlideGenerator, GoogleImageSlideGenerator,
    GoogleMapsSlideGenerator, TitleSlideGenerator, YouTubeSlideGenerator) {
    "use strict";
    var logger = new Logger("FinalizedTopicSlideGenerator");

    /*
    * CLEANUP
    **/

    function FinalizedTopicSlideGenerator(topic, hash_object, options) {
      CompositeSlideGenerator.call(this);
	  
	  this.hash_object = hash_object;
      this.generators = [];
      this.topic = topic;
      this.first = true;
      this.durationLeft = 0;
      this.audioURL ='';
      this.ready=false;
	  options = options || {};
	  this.videoOptions = options.videoOptions || {};
	  this.maxImages = options.maxImages;
	  
      
      //stuff
      this.slides = [];
      this.firstSlide = new TitleSlideGenerator(this.topic);  
    }

    $.extend(FinalizedTopicSlideGenerator.prototype,
             CompositeSlideGenerator.prototype,
      {
        /** Checks whether at least one child generator has a next slide. */
        hasNext: function () {
          if (this.durationLeft <= 0)
            return false;
          else
            return this.slides.length > 0;
        },

        /** Initialize all child generators. */
        init: function () {
			if (this.inited)
				return;
		
			var self  = this;
			if (!self.hash_object.slide_description) {
				//Create all generators depending on the type of the topic
				logger.log("no slide description found, going to default");

				switch (this.topic.type) {
				case "http://dbpedia.org/ontology/PopulatedPlace":
					this.addGenerator(new GoogleImageSlideGenerator(this.topic, this.maxImages), false);
					this.addGenerator(new YouTubeSlideGenerator(this.topic, this.videoOptions), false);
					this.addGenerator(new GoogleMapsSlideGenerator(this.topic), false);
					break;
				default:
					this.addGenerator(new GoogleImageSlideGenerator(this.topic, this.maxImages), false);
					this.addGenerator(new YouTubeSlideGenerator(this.topic, this.videoOptions), false);
					break;
				}
			}
			else{
				logger.log("slide description found", this.hash_object.slide_description);
				if (this.hash_object.slide_description.length == 0){
					logger.log ("Empty slide description. Creating new generators anyway");
					//Create all generators depending on the type of the topic; suppress inits b/c we're not doing a search for vids/images
					switch (this.topic.type) {
					case "http://dbpedia.org/ontology/PopulatedPlace":
						this.addGenerator(new GoogleImageSlideGenerator(this.topic, this.maxImages), false);
						this.addGenerator(new YouTubeSlideGenerator(this.topic, this.videoOptions), false);
						this.addGenerator(new GoogleMapsSlideGenerator(this.topic), true);
						break;
					default:
						this.addGenerator(new GoogleImageSlideGenerator(this.topic, this.maxImages), false);
						this.addGenerator(new YouTubeSlideGenerator(this.topic, this.videoOptions), false);
						break;
					}
				}
				else{
					console.log(this.hash_object.slide_description);
					this.hash_object.slide_description.forEach(function(description){
						var slide;
						if(description){
							switch(description.type){
								case "GoogleImageSlide":
									slide = new GoogleImageSlideGenerator(self.topic);
									var image = new Image();
									$(image).load(function () {
										// add the image if it loads and we still need slides
										slide.addImageSlide(image.src, description.data.duration);
									});
									image.src = description.data.url;		
									self.addGenerator(slide,true);
	
									break;
								case "YouTubeSlide":
									slide = new YouTubeSlideGenerator(self.topic);
									self.addGenerator(slide,true);
	
									slide.addVideoSlide(description.data.videoID, (description.data.duration), description);
	
									break;
								/*case "GoogleMapSlide":
								break;					*/
							}
						}
					});
				}
			
		  }
		
			if (!self.hash_object.audioURL){
				var tts = new TTSService();
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

				//fallback if speech fails is to simply make the slide play 5 seconds of silence...at least there will be pictures
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

				logger.log('getting speech for topic', this.topic.label);
				tts.getSpeech(this.hash_object.audio_text, 'en_gb');
			}
			else{
				self.durationLeft = self.hash_object.audio_time;
				self.audioURL = self.hash_object.audioURL;
				logger.log('audioURL found for topic', self.topic.label);
					
				//After audio is ready, check that media slides have finished preparing. Also give 3 seconds for the slides to be added into the generator
				setTimeout(function(){		
					self.waitforReady(0,function(){
						self.ready=true;
						self.audio=true;
						self.emit('newSlides');									
					})
				}, 3000);
			}

          this.inited = true;
        },
		
		waitforReady: function(i,callback){
			var self=this;
			if (i>this.generators.length){
				i++;
				callback();
				return;
			}			
			if (!this.generators[i])	{ //Check the slideGenerator exists
				i++;
				this.waitforReady(i,callback);
			}
			else if (this.generators[i].ready){
				i++;
				this.waitforReady(i,callback);
			}
			else{
				this.generators[i].once('prepared', function(){
					i++; 
					self.waitforReady(i,callback);
				});
			}
		},
        
        next: function () {
          var slide;

          if (this.first) {
            // make sure first slide is always a titleslide
            slide = this.firstSlide.next();
			slide.audioURL = this.audioURL;
			slide.audio_text = this.hash_object.audio_text;
            // prepare other generators
            //this.generators.forEach(function (g) { g.prepare(); });

            this.first = false;

            logger.log('Added first slide on ', this.topic.label);

          }
          else {
            slide = this.slides.shift();

            // shorten the slide if it would take too long
            if (slide.duration > this.durationLeft)
              slide.duration = Math.min(slide.duration, this.durationLeft + 1000);
            // if no more slides are left, this one is allotted the remaining duration
            else if (this.generators.length <= 1 && !this.hasNext())
              slide.duration = this.durationLeft;
          }

          this.durationLeft -= slide.duration;
          logger.log('New slide: duration ', slide.duration, 'ms,', this.durationLeft, 'ms left');

          return slide;
        },
        
        resendSpeech: function(text){
			if (this.hash_object.audio_text==text){
				return;
			}
			
			this.ready=false;
			var self = this,
				tts = new TTSService();
			tts.once('speechReady', function (event, data) {
				self.durationLeft = Math.floor(data.snd_time);
				//Add extra time because IE definitely needs a plugin, which takes time to embed
				if (navigator.userAgent.indexOf('MSIE') !=-1)
					self.durationLeft +=5000;
					
				self.hash_object.audio_time = self.durationLeft;
				
				self.audioURL = data.snd_url;
				logger.log('Received speech for topic', self.topic.label);
				self.ready=true;
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
				// When speech is received, 'remind' the presenter that the slides are ready
				self.emit('newSlides');
			});
			
			logger.log('Getting speech for topic', this.topic.label);
			tts.getSpeech(text, 'en_GB');	
			this.hash_object.audio_text=text;
		},
		
		updateHash: function(){		//Not actually a hash object updater in this case...more like making sure the 'slides' are prsented in the order specified by the hash
			var slide_count=0;
			var generator, slide;
					
			for (var i = 0; i < this.generators.length; i++){
				slide_count+=this.generators[i].slides.length;
			}
			
			if (!this.hash_object.slide_description){
				// randomly pick a generator and select its next slide			
				for (var i=0; i<slide_count; i++){
					do {
						generator = this.generators[Math.floor(Math.random() * this.generators.length)];
					} while (!generator.hasNext())
					slide= generator.next();
					this.slides.push(slide);					
					//this.hash_object.slide_description.push(slide.slide_info);
				}
			}
			else{
				for (var i=0; i< this.generators.length; i++){
					while (this.generators[i].hasNext()){
						slide = this.generators[i].next()
						this.slides.push(slide);
						//this.hash_object.slide_description.push(slide.slide_info);
					}
				}				
			}
		},
		
		prepare: function () {

          // prepare other generators
          //this.generators.forEach(function (g) { g.prepare(); });

          //add all the slides for each generator
          for(var val in this.generatorsHash){
          	var s = [];
          	for(var i = 0; i < 3 && this.generatorsHash[val].hasNext() && 
          		this.generatorsHash[val].next !== undefined; i++){
          		s.push(this.generatorsHash[val].next());
          	}
          	this.slides[val] = s;
          }
          	
          logger.log('Added slides on ', this.topic.label);
        }        
      });
    return FinalizedTopicSlideGenerator;
  });


