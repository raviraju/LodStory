/*!
 * EIC GoogleImageSlideGenerator
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['lib/jquery', 'eic/generators/BaseSlideGenerator'],
  function ($, BaseSlideGenerator) {
    "use strict";

    /*
   * CLEANUP
   * Avoid images that don't exists
   **/

    var defaultDuration = 2500;
    var repeat = false;

    /** Generator of images slides from Google Image search results.
   * Parameters: a topic and the maximum number of results to return
   */
    function GoogleImageSlideGenerator(topic, maxResults) {
      BaseSlideGenerator.call(this);

      if (typeof topic === "string")
        topic = {
          label: topic
        };

      this.topic = topic;
      this.maxResults = maxResults === undefined ? 8 : maxResults;
      this.slides = [];
	  this.slidesCopy = [];
      this.cnt = 0;
	  this.ready=true;
    }

    $.extend(GoogleImageSlideGenerator.prototype,
      BaseSlideGenerator.prototype,
      {
        /** Checks whether any slides are left. */
        hasNext: function () {
          return this.slides.length > 0;
        },

        /** Fetches a list of images about the topic. */
        init: function () {
          if (this.inited)
            return;
          var self = this;
          $.ajax('https://ajax.googleapis.com/ajax/services/search/images?v=1.0', {
            data: {
              q: this.topic.label,
              imgsz: 'xlarge',
              // search more images than needed, in case some of them don't load
              rsz: Math.floor(this.maxResults),
            },
            dataType: 'jsonp',
          })
          .success(function (response) {
        	  console.log("resonse:");
        	  console.log(response);
        	  if(response.responseData){
	            response.responseData.results.forEach(function (result) {
	              // preload the image to avoid broken images on slides
	              var image = new Image();
	              $(image).load(function () {
	                // add the image if it loads and we still need slides
	                if (self.slides.length < self.maxResults)
	                  self.addImageSlide(result.url);
	              });
	              image.src = result.url;
	            });
	          }
          });
          this.inited = true;
        },

        /** Advances to the next slide. */
        next: function () {
		  return this.slides.shift();
        },
		
		/** Since next() shifts the array until it's empty, let's have a reset function to repopulate it with the original contents) */
		reset: function() {
			for (var i=0; i< this.slidesCopy.length; i++){
				this.slides[i] = this.slidesCopy[i];		//Is this okay?
			}
		},

        /** Adds a new image slide. */
        addImageSlide: function (imageUrl, duration) {
          var $image = $('<img>').attr('src', imageUrl),
          $figure = $('<figure>').append($image),
          slide = this.createBaseSlide('image', $figure, duration || defaultDuration);
          
		  
		  slide.slide_info = {
			  type: "GoogleImageSlide",
			  data: {
				  url: imageUrl,
				  duration: duration || defaultDuration
			  }
		  };

          slide.on('started', function () {
            setTimeout($.proxy($image, 'addClass', 'zoom'));
          });
		  /*slide.once('stopped', function(){
			$image.hide();
		  });*/
          this.slides.push(slide);
		  this.slidesCopy.push(slide);
          this.emit('newSlides');
        },
      });

    return GoogleImageSlideGenerator;
  });
