/*!
 * EIC PresentationController
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['lib/jquery', 'eic/Logger', 'eic/FacebookConnector','eic/generators/LoadingSlideGenerator',
  'eic/generators/IntroductionSlideGenerator', 'eic/generators/OutroductionSlideGenerator', 'eic/generators/TopicToTopicSlideGenerator',
  'eic/generators/TopicToTopicSlideGenerator2', 'eic/generators/CompositeSlideGenerator',
  'eic/generators/ErrorSlideGenerator', 'eic/SlidePresenter', 'eic/TopicSelector', 'config/URLs'],
  function ($, Logger, FacebookConnector, LoadingSlideGenerator,
    IntroductionSlideGenerator, OutroductionSlideGenerator, TopicToTopicSlideGenerator,
    TopicToTopicSlideGenerator2, CompositeSlideGenerator,
    ErrorSlideGenerator, SlidePresenter, TopicSelector, urls) {
    "use strict";
    var logger = new Logger("PresentationController");

    function PresentationController(path, options) {
      this.path = path;
	  options = options || {};
      this.intro = options.intro === undefined ? true : options.intro;
      this.outro = options.outro === undefined ? true : options.outro;
	  this.generatorOptions = options.generatorOptions || {};
	  this.outroOptions = options.outroOptions || {};
	  this.topicToTopic;
    }

    /* Member functions */

    PresentationController.prototype = {
      init: function () {
        logger.log("Initializing");
      },

      // Starts the movie about the connection between the user and the topic. Calls createMovie if the generators don't exist yet
	  playMovie: function(){
	  var self = this;
		
		// Create the slides panel
        var $slides = $('<div>').addClass('slides'),
			$wrapper = $('<div>').addClass('slides-wrapper')
                                 .append($slides);
		
		// Hide the main panel and show the slides panel
		$('#screen').show();
        $('#screen').append($wrapper);
        $wrapper.hide().fadeIn($.proxy($slides.hide(), 'fadeIn', 1000));
		
		if (!this.generator){
			this.createMovie();
			
			//Give a second for the movie generation to start and the slides and generator variables to be instantiated...
			window.setTimeout(function(){
				//Go straight to "playing" so that the loading slide shows
				new SlidePresenter($slides, self.generator).start();
			},1000);
		}
		else{
			
			//Go straight to "playing" so that the loading slide shows
			new SlidePresenter($slides, self.generator).start();
		}
	  
	  },
      createMovie: function () {
        // Add introduction, body, and outroduction generators
        this.generator = new CompositeSlideGenerator();
        
		this.startTopic=this.path.source;
		this.endTopic=this.path.destination;
		
		var loader = new LoadingSlideGenerator()
		this.generator.addGenerator(loader);
		
		if (this.intro)
			this.generator.addGenerator(new IntroductionSlideGenerator(this.startTopic, this.profile));
		
		this.topicToTopic = new TopicToTopicSlideGenerator(this.path, loader, this.generatorOptions)
		this.generator.addGenerator(this.topicToTopic);
		
		if (this.outro)
			this.generator.addGenerator(new OutroductionSlideGenerator(this.path.hashID, this.endTopic, this.outroOptions));

    }};

    return PresentationController;
  });
