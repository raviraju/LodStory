/*!
 * EIC PresentationController
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['lib/jquery', 'eic/Logger', 'eic/FacebookConnector',
  'eic/generators/IntroductionSlideGenerator', 'eic/generators/OutroductionSlideGenerator', 'eic/generators/TopicToTopicSlideGenerator',
  'eic/generators/TopicToTopicSlideGenerator2', 'eic/generators/CompositeSlideGenerator',
  'eic/generators/ErrorSlideGenerator', 'eic/SlidePresenter', 'eic/TopicSelector', 'eic/SlideEditor',  'config/URLs','lib/jvent'],
  function ($, Logger, FacebookConnector,
    IntroductionSlideGenerator, OutroductionSlideGenerator, TopicToTopicSlideGenerator,
    TopicToTopicSlideGenerator2, CompositeSlideGenerator,
    ErrorSlideGenerator, SlidePresenter, TopicSelector, SlideEditor, urls, EventEmitter) {
    "use strict";
    var logger = new Logger("PresentationController");

    function PresentationController(path, options) {	  
      this.path = path;
      this.generator;
      EventEmitter.call(this);
	  
	  options = options || {};
	  this.intro = options.intro || false;
	  this.outro = options.outro || false;
	  this.generatorOptions = options.generatorOptions || {};
	  this.outroOptions = options.outroOptions || {};
      logger.log("Created PresentationController2, ready to generate slides");

	  this.topicToTopic;
    }

    /* Member functions */

    PresentationController.prototype = {
      init: function () {
        logger.log("Initializing");
      },

      // Starts the movie about the connection between the user and the topic.
      playMovie: function () {
        var self = this;
        this.generator = new CompositeSlideGenerator();
        
	   this.startTopic=this.path.source;
	   this.endTopic=this.path.destination;
				
		if (this.intro)
			this.generator.addGenerator(new IntroductionSlideGenerator(this.startTopic, this.profile));
		
		this.topicToTopic = new TopicToTopicSlideGenerator2(this.path, this.generatorOptions);
		this.generator.addGenerator(this.topicToTopic);
		
		if (this.outro)
			this.generator.addGenerator(new OutroductionSlideGenerator(this.path.hashID, this.endTopic, this.outroOptions));
			

		//To prevent any slide-skipping, don't go into editor mode until all slides are at least done (waiting on topic slide audio)   		
		if (this.topicToTopic.ready){
			logger.log("New hash: ", self.path);
			self.emit('slide_generation_finished')
		}
		else{
			this.topicToTopic.once('topic slides ready', function(){
				self.topicToTopic.removeAllListeners('topic slidesready');
				logger.log("New hash: ", self.path); 
				self.emit('slide_generation_finished');
			});
		}

      }
    };
    return PresentationController;
  });
